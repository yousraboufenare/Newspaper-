import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "./config.js";
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const grid=document.querySelector("#newsGrid"), search=document.querySelector("#search");
const esc=s=>(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
async function load(){
 const {data,error}=await supabase.from("articles").select("id,title,slug,excerpt,image_url,category,published_at").eq("status","published").order("published_at",{ascending:false});
 if(error){grid.innerHTML="<p>تعذر تحميل الأخبار.</p>";return}
 window.news=data||[]; render();
}
function render(){const q=(search.value||"").toLowerCase().trim();const rows=window.news.filter(n=>(n.title+" "+(n.excerpt||"")+" "+(n.category||"")).toLowerCase().includes(q));
 grid.innerHTML=rows.length?rows.map(n=>`<article class="card"><img src="${esc(n.image_url||'assets/placeholder.svg')}" alt=""><div class="card-body"><div class="meta">${esc(n.category||"عام")} · ${new Date(n.published_at).toLocaleDateString("ar-DZ")}</div><h3>${esc(n.title)}</h3><p>${esc(n.excerpt||"")}</p><a class="read" href="article.html?slug=${encodeURIComponent(n.slug)}">اقرأ المزيد ←</a></div></article>`).join(""):"<p class='empty'>لا توجد أخبار مطابقة.</p>";
}
search.addEventListener("input",render);document.querySelector("#year").textContent=new Date().getFullYear();load();