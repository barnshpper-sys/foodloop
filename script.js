/*
FOODLOOP — script.js
1) Создай счетчик Яндекс Метрики.
2) Вставь ID в YANDEX_COUNTER_ID.
3) Создай цели с ID ниже.
4) Для реальной CRM вставь URL Google Apps Script в FORM_ENDPOINT.
*/
const YANDEX_COUNTER_ID = 0; // <- замени на ID Метрики
const FORM_ENDPOINT = "";    // <- URL Google Apps Script Web App

const GOALS = {
  cta_b2c:"cta_b2c", cta_b2b:"cta_b2b", view_offers:"view_offers",
  offer_click:"offer_click", lead_b2c:"lead_b2c", lead_b2b:"lead_b2b",
  phone_click:"phone_click", faq_open:"faq_open"
};

function initYandexMetrica(){
  if(!YANDEX_COUNTER_ID) return;
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    k=e.createElement(t); a=e.getElementsByTagName(t)[0];
    k.async=1; k.src=r; a.parentNode.insertBefore(k,a);
  })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
  ym(YANDEX_COUNTER_ID,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
}

function reachGoal(goal,params={}){
  if(typeof window.ym==="function" && YANDEX_COUNTER_ID){
    window.ym(YANDEX_COUNTER_ID,"reachGoal",goal,params);
  }
}

function readUTM(){
  const p=new URLSearchParams(location.search);
  const keys=["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  const current={}; keys.forEach(k=>current[k]=p.get(k)||"");
  const savedFirst=JSON.parse(localStorage.getItem("foodloop_first_utm")||"null");
  const first=savedFirst||current;
  if(!savedFirst && Object.values(current).some(Boolean)) localStorage.setItem("foodloop_first_utm",JSON.stringify(current));
  localStorage.setItem("foodloop_last_utm",JSON.stringify(current));
  return {first,last:current};
}

function putUTMInForm(){
  const {first,last}=readUTM(), f=last.utm_source||first.utm_source||"";
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k=>{
    document.getElementById(k).value=last[k]||first[k]||"";
  });
  document.getElementById("landing_url").value=location.href;
}

async function submitLead(data){
  if(!FORM_ENDPOINT){
    const key="foodloop_demo_leads", arr=JSON.parse(localStorage.getItem(key)||"[]");
    arr.push(data); localStorage.setItem(key,JSON.stringify(arr));
    return "demo";
  }
  const r=await fetch(FORM_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  if(!r.ok) throw new Error("CRM endpoint error");
  return "crm";
}

function setupForms(){
  const form=document.getElementById("lead-form");
  const title=document.getElementById("form-title"), subtitle=document.getElementById("form-subtitle");
  const leadType=document.getElementById("lead_type"), nameLabel=document.getElementById("name-label"), contactLabel=document.getElementById("contact-label");
  const businessWrap=document.getElementById("business-name-wrap"), districtWrap=document.getElementById("district-wrap"), button=document.getElementById("submit-button"), status=document.getElementById("form-status");

  document.querySelectorAll(".switch").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const type=btn.dataset.form;
      document.querySelectorAll(".switch").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
      leadType.value=type;
      const b2b=type==="b2b";
      title.textContent=b2b?"Стать партнёром FoodLoop":"Получать предложения FoodLoop";
      subtitle.textContent=b2b?"Оставь контакт — в CRM попадёт заявка с источником и UTM.":"Оставь контакт — в учебном прототипе сохраняются источник и UTM.";
      nameLabel.textContent=b2b?"Имя представителя":"Имя";
      contactLabel.textContent=b2b?"Телефон или Telegram":"Telegram или телефон";
      businessWrap.classList.toggle("hidden",!b2b); districtWrap.classList.toggle("hidden",!b2b);
      button.textContent=b2b?"Запросить пилот":"Получать предложения";
      status.textContent=""; status.className="form-status";
      putUTMInForm();
    });
  });

  form.addEventListener("submit",async e=>{
    e.preventDefault(); status.textContent=""; status.className="form-status";
    if(!form.checkValidity()){form.reportValidity();return;}
    const {first,last}=readUTM();
    const data={...Object.fromEntries(new FormData(form).entries()),first_utm:first,last_utm:last,timestamp:new Date().toISOString(),page_title:document.title};
    try{
      button.disabled=true; button.textContent="Сохраняем...";
      const mode=await submitLead(data);
      reachGoal(leadType.value==="b2b"?GOALS.lead_b2b:GOALS.lead_b2c,{source:data.utm_source,campaign:data.utm_campaign});
      status.textContent=mode==="crm"?"Готово — заявка передана в CRM.":"Готово — заявка сохранена в демо-режиме.";
      status.className="form-status success"; form.reset(); leadType.value=data.lead_type; putUTMInForm();
    }catch(err){console.error(err);status.textContent="Не удалось отправить заявку. Проверь CRM endpoint.";status.className="form-status error";}
    finally{button.disabled=false;button.textContent=leadType.value==="b2b"?"Запросить пилот":"Получать предложения";}
  });
}

function setupGoals(){
  document.querySelectorAll("[data-goal]").forEach(el=>el.addEventListener("click",()=>reachGoal(GOALS[el.dataset.goal])));
  document.querySelectorAll("a[href^='tel:']").forEach(el=>el.addEventListener("click",()=>reachGoal(GOALS.phone_click)));
  document.querySelectorAll("details").forEach(el=>el.addEventListener("toggle",()=>{if(el.open)reachGoal(GOALS.faq_open)}));
}

function setupOfferViewGoal(){
  const el=document.getElementById("offers"); if(!el||!("IntersectionObserver" in window)) return;
  let sent=false; const o=new IntersectionObserver(es=>es.forEach(x=>{if(!sent&&x.isIntersecting){sent=true;reachGoal(GOALS.view_offers);o.disconnect();}}),{threshold:.35});
  o.observe(el);
}

initYandexMetrica(); putUTMInForm(); setupForms(); setupGoals(); setupOfferViewGoal();
