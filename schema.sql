-- نبض الخبر: قاعدة البيانات + RLS
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  title text not null check (char_length(title) between 1 and 180),
  slug text not null unique check (char_length(slug) between 1 and 180),
  excerpt text default '' check (char_length(excerpt) <= 300),
  body text not null,
  category text default 'عام',
  image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.articles enable row level security;

-- الملف الشخصي: المستخدم يرى ملفه فقط.
drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles for select to authenticated using (id = auth.uid());

-- الأخبار المنشورة: القراءة عامة.
drop policy if exists "public read published articles" on public.articles;
create policy "public read published articles" on public.articles
for select to anon, authenticated using (status = 'published');

-- المدير يقرأ كل الأخبار ويضيف ويعدل ويحذف.
drop policy if exists "admin read all articles" on public.articles;
create policy "admin read all articles" on public.articles
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);

drop policy if exists "admin insert articles" on public.articles;
create policy "admin insert articles" on public.articles
for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
  and author_id=auth.uid()
);

drop policy if exists "admin update articles" on public.articles;
create policy "admin update articles" on public.articles
for update to authenticated using (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
) with check (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);

drop policy if exists "admin delete articles" on public.articles;
create policy "admin delete articles" on public.articles
for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);

-- إنشاء profile تلقائياً عند إنشاء مستخدم Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'editor');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- حماية الصور: bucket عام للقراءة، لكن الرفع والحذف للمدير فقط.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('news-images','news-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "admin upload news images" on storage.objects;
create policy "admin upload news images" on storage.objects for insert to authenticated
with check (
 bucket_id='news-images' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);

drop policy if exists "admin delete news images" on storage.objects;
create policy "admin delete news images" on storage.objects for delete to authenticated
using (
 bucket_id='news-images' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);

-- القراءة العامة للصور المنشورة/المخزنة في هذا bucket.
drop policy if exists "public read news images" on storage.objects;
create policy "public read news images" on storage.objects for select to anon,authenticated
using (bucket_id='news-images');
