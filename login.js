import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "../config.js";
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY), form=document.querySelector("#login"),msg=document.querySelector("#msg");
const {data:{session}}=await supabase.auth.getSession();if(session)location.href="index.html";
form.onsubmit=async e=>{e.preventDefault();msg.textContent="جاري الدخول...";
 const {error}=await supabase.auth.signInWithPassword({email:email.value,password:password.value});
 if(error)msg.textContent="بيانات الدخول غير صحيحة أو الحساب غير مسموح به.";else location.href="index.html";
};