import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "./config.js";
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY), box=document.querySelector("#article");
const esc=s=>(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const slug=new URLSearchParams(location.search).get("slug");
const {data,error}=await supabase.from("articles").select("*").eq("slug",slug).eq("status","published").maybeSingle();
if(error||!data){box.innerHTML="<div class='card-body'><h2>الخبر غير موجود</h2><a class='read' href='index.html'>العودة</a></div>"}else{
 document.title=data.title;
 box.innerHTML=`<img src="${esc(data.image_url||'assets/placeholder.svg')}" alt=""><div class="card-body"><div class="meta">${esc(data.category||"عام")} · ${new Date(data.published_at).toLocaleDateString("ar-DZ")}</div><h1>${esc(data.title)}</h1><p style="white-space:pre-wrap;line-height:2;font-size:18px">${esc(data.body)}</p><a class="read" href="index.html">← العودة للأخبار</a></div>`;
}