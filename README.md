# نبض الخبر — النسخة الآمنة

## البنية
- الواجهة العامة: HTML/CSS/JS
- المصادقة: Supabase Auth
- قاعدة البيانات: PostgreSQL عبر Supabase
- الصلاحيات: Row Level Security (RLS)
- الصور: Supabase Storage
- الاستضافة المقترحة: Cloudflare Pages أو أي استضافة static تدعم HTTPS

## إعداد مرة واحدة
1. أنشئي مشروعاً في Supabase.
2. افتحي SQL Editor وشغلي `supabase/schema.sql`.
3. من Authentication > Users أنشئي حسابك بالبريد وكلمة مرور قوية.
4. خذي User UID للحساب ثم نفذي:
   update public.profiles set role='admin' where id='USER_UUID';
5. من Project Settings > API خذي Project URL وPublishable/anon key.
6. ضعيهما في `config.js`.
7. افتحي `admin/login.html` وسجلي الدخول.

## مهم
لا تضعي `service_role` key في `config.js` أو GitHub. الواجهة تستخدم publishable/anon key فقط، والحماية الفعلية تأتي من RLS.
لا تضعي كلمات المرور داخل الكود.

## النشر
ارفعي مجلد المشروع إلى GitHub ثم اربطي المستودع بـ Cloudflare Pages، أو استخدمي أي استضافة static.
HTTPS مطلوب.
