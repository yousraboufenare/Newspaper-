import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "../config.js";
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=id=>document.querySelector(id);let user,editing=null,currentImage=null;
const {data:{session}}=await supabase.auth.getSession();if(!session){location.href="login.html"}else{
 const {data:p}=await supabase.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
 if(!p||p.role!=="admin"){await supabase.auth.signOut();$("#authMsg").innerHTML="<div class='panel'>هذا الحساب ليس حساب مدير.</div>";}else{$("#authMsg").hidden=true;$("#dashboard").hidden=false;user=session.user;load();}
}
supabase.auth.onAuthStateChange((e,s)=>{if(e==="SIGNED_OUT")location.href="login.html"});
async function load(){const {data,error}=await supabase.from("articles").select("*").order("created_at",{ascending:false});if(error){$("#list").innerHTML="<p>تعذر تحميل الأخبار.</p>";return}$("#list").innerHTML=(data||[]).map(n=>`<div class="admin-item"><img class="preview" src="${n.image_url||"../assets/placeholder.svg"}"><div class="grow"><b>${esc(n.title)}</b><div class="meta">${esc(n.category||"عام")} · ${esc(n.status)}</div></div><button class="btn" data-edit="${n.id}">تعديل</button><button class="btn danger" data-del="${n.id}">حذف</button></div>`).join("")||"<p class='muted'>لا توجد أخبار.</p>"}
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("#list").onclick=async e=>{const id=e.target.dataset.edit||e.target.dataset.del;if(!id)return;if(e.target.dataset.edit){const {data}=await supabase.from("articles").select("*").eq("id",id).single();editing=id;for(const [k,v] of Object.entries({title:data.title,category:data.category,slug:data.slug,excerpt:data.excerpt,body:data.body,status:data.status}))$("#"+k).value=v||"";currentImage=data.image_url||null;$("#formTitle").textContent="تعديل الخبر";$("#cancel").hidden=false;scrollTo(0,0)}
else if(confirm("هل تريدين حذف هذا الخبر؟")){const {error}=await supabase.from("articles").delete().eq("id",id);if(error)alert("تعذر الحذف");else load();}};
$("#imageFile").onchange=e=>{const f=e.target.files[0];if(f){if(f.size>5*1024*1024)return alert("الصورة يجب ألا تتجاوز 5MB");$("#preview").src=URL.createObjectURL(f);$("#preview").hidden=false}};
$("#form").onsubmit=async e=>{e.preventDefault();$("#formMsg").textContent="جاري الحفظ...";
 let image_url=currentImage;
 const f=$("#imageFile").files[0];
 if(f){const ext=f.name.split(".").pop().toLowerCase(),path=`${user.id}/${crypto.randomUUID()}.${ext}`;const {error}=await supabase.storage.from("news-images").upload(path,f,{contentType:f.type,upsert:false});if(error){$("#formMsg").textContent="فشل رفع الصورة.";return}const {data}=supabase.storage.from("news-images").getPublicUrl(path);image_url=data.publicUrl}
 let slug=$("#slug").value.trim()||$("#title").value.trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now();
 const obj={title:$("#title").value.trim(),category:$("#category").value.trim()||"عام",slug,excerpt:$("#excerpt").value.trim(),body:$("#body").value.trim(),image_url,status:$("#status").value,author_id:user.id,published_at:$("#status").value==="published"?new Date().toISOString():null};
 let res=editing?await supabase.from("articles").update(obj).eq("id",editing):await supabase.from("articles").insert(obj);
 if(res.error){$("#formMsg").textContent="تعذر حفظ الخبر: "+res.error.message;return}clearForm();load();$("#formMsg").textContent="تم الحفظ بنجاح."};
function clearForm(){$("#form").reset();editing=null;currentImage=null;$("#formTitle").textContent="إضافة خبر";$("#cancel").hidden=true;$("#preview").hidden=true}
$("#cancel").onclick=clearForm;$("#logout").onclick=()=>supabase.auth.signOut();