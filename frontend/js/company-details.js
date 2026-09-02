document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  
  /* =====================================================
  CONFIG
  ===================================================== */
  
  const BASE_API_URL = "http://localhost:8080/api";
  
  /* =====================================================
  DOM CACHE
  ===================================================== */
  
  const els = {
  companyName: document.getElementById("company-name"),
  companyIndustry: document.getElementById("company-industry"),
  companyLocation: document.getElementById("company-location"),
  companyAbout: document.getElementById("company-about"),
  companyWebsite: document.getElementById("company-website"),
  companyEmail: document.getElementById("company-email"),
  companyPhone: document.getElementById("company-phone"),
  companyAddress: document.getElementById("company-address"),
  companySize: document.getElementById("company-size"),
  companyLogo: document.getElementById("company-logo"),
  
  experienceContainer: document.getElementById("experience-container"),
  
  expPrev: document.querySelector(".reviews-section .prev-arrow"),
  expNext: document.querySelector(".reviews-section .next-arrow"),
  
  jobsContainer: document.getElementById("jobs-container"),
  
  jobsPrev: document.querySelector(".jobs-section .prev-arrow"),
  jobsNext: document.querySelector(".jobs-section .next-arrow"),
  
  btnSubmitExp: document.querySelector(".btn-submit-exp")
  };
  
  /* =====================================================
  STATE
  ===================================================== */
  
  let experiences = [];
  let expIndex = 0;
  
  let jobs = [];
  let jobIndex = 0;
  
  /* =====================================================
  HELPERS
  ===================================================== */
  
  function escapeHtml(str) {
  return (str ?? "")
  .toString()
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;");
  }
  
  function setText(el,value,def="---"){
  if(!el) return;
  el.textContent = value || def;
  }
  
  function setHref(el,value){
  if(!el) return;
  
  if(!value){
  el.textContent="---";
  el.removeAttribute("href");
  return;
  }
  
  el.href=/^https?:\/\//i.test(value)?value:`https://${value}`;
  el.target="_blank";
  el.textContent=value;
  }
  
  function setImg(el,value){
  if(!el) return;
  el.src=value || "/images/default-company.png";
  }
  
  function getCompanyId(){
  const params=new URLSearchParams(window.location.search);
  return params.get("id") || params.get("companyId");
  }
  
  function formatRating(r){
  if(!r) return "---";
  return Number(r).toFixed(1);
  }
  
  /* =====================================================
  API
  ===================================================== */
  
  async function apiGet(url){
  
  const token=localStorage.getItem("token");
  
  const headers={"Accept":"application/json"};
  
  if(token){
  headers["Authorization"]=`Bearer ${token}`;
  }
  
  const res=await fetch(url,{headers});
  
  if(!res.ok){
  throw new Error(`HTTP ${res.status}`);
  }
  
  return await res.json();
  }
  
  /* =====================================================
  COMPANY
  ===================================================== */
  
  async function loadCompany(companyId){
  
  try{
  
  const c=await apiGet(`${BASE_API_URL}/companies/${companyId}`);
  
  renderCompany({
  name:c.name,
  industry:c.industry,
  location:c.location,
  about:c.about,
  website:c.website,
  email:c.email,
  phone:c.phone,
  address:c.address,
  size:c.employeeCount,
  logo:c.logoUrl
  });
  
  }catch(err){
  console.error("Company Load Error:",err);
  setText(els.companyName,"خطا در دریافت اطلاعات شرکت");
  }
  }
  
  function renderCompany(c){
  
  setText(els.companyName,c.name);
  setText(els.companyIndustry,c.industry);
  setText(els.companyLocation,c.location);
  setText(els.companyAbout,c.about,"توضیحی ثبت نشده است");
  
  setHref(els.companyWebsite,c.website);
  setText(els.companyEmail,c.email);
  setText(els.companyPhone,c.phone);
  setText(els.companyAddress,c.address);
  setText(els.companySize,c.size);
  
  setImg(els.companyLogo,c.logo);
  }
  
  /* =====================================================
  EXPERIENCES
  ===================================================== */
  
  async function loadExperiences(companyId){
  
  try{
    let list = [];
  
    try {
      list = await apiGet(`${BASE_API_URL}/experiences?companyId=${companyId}`) || [];
    } catch (queryErr) {
      try {
        list = await apiGet(`${BASE_API_URL}/companies/${companyId}/experiences`) || [];
      } catch (nestedErr) {
        list = await apiGet(`${BASE_API_URL}/public/companies/${companyId}/experiences`) || [];
      }
    }
  
    experiences = (list || []).filter(e =>
      String(e.companyId) === String(companyId) ||
      String(e.company?.id) === String(companyId) ||
      String(e.company?.companyId) === String(companyId) ||
      String(e.company?.company_id) === String(companyId) ||
      String(e.company_id) === String(companyId)
    );
  
    expIndex=0;
  
    renderExperience();
  
  }catch(err){
  
    console.warn("Experience Load Error:",err);
  
    renderExperience();
  }
  }
  
  function renderExperience(){
  
  if(!els.experienceContainer) return;
  
  if(!experiences.length){
  
  els.experienceContainer.innerHTML=`
  <div class="review-card">
  <p class="review-text">
  هنوز تجربه‌ای برای این شرکت ثبت نشده است.
  </p>
  </div>
  `;
  
  return;
  }
  
  const e=experiences[expIndex];
  
  els.experienceContainer.innerHTML=`
  <div class="review-card">
  
  <div class="review-header">
  
  <div class="user-info">
  <span class="user-avatar">
  <i class="fa-solid fa-user"></i>
  </span>
  
  <div>
  <span class="user-badge">کارآموز</span>
  <span class="review-date">
  ${escapeHtml(e.startDate || "")}
  </span>
  </div>
  </div>
  
  <div class="rating-stars">
  ${formatRating(e.rating)}
  </div>
  
  </div>
  
  <p class="review-text">
  ${escapeHtml(e.description || "")}
  </p>
  
  <div class="review-footer">
  
  <span class="votes-count">
  <i class="fa-solid fa-thumbs-up"></i>
  0
  </span>
  
  <button class="btn-view"
  onclick="window.location.href='experience-details.html?id=${e.id}'">
مشاهده کامل
</button>
  </div>
  
  </div>
  `;
  }
  
  /* =====================================================
  JOBS
  ===================================================== */
  
  async function loadJobs(companyId){
  
  try{
  
  const list=await apiGet(`${BASE_API_URL}/public/companies/${companyId}/jobs`);
  
  jobs=(list||[]).map(j=>({
  id:j.id,
  title:j.title,
  location:j.location,
  type:j.duration
  }));
  
  jobIndex=0;
  
  renderJob();
  
  }catch(err){
  
  console.error("Jobs Load Error:",err);
  
  renderJob();
  }
  }
  
  function renderJob(){
  
  if(!els.jobsContainer) return;
  
  if(!jobs.length){
  
  els.jobsContainer.innerHTML=`
  <div class="job-card">
  <h3>در حال حاضر آگهی فعالی وجود ندارد</h3>
  
  <button disabled class="btn-sub-job">
  ارسال درخواست
  </button>
  </div>
  `;
  
  return;
  }
  
  const j=jobs[jobIndex];
  
  els.jobsContainer.innerHTML=`
  <div class="job-card" data-id="${j.id}">
  
  <div class="job-card-header">
  
  <span class="job-icon">
  <i class="fa-solid fa-briefcase"></i>
  </span>
  
  <div>
  <h3>${escapeHtml(j.title)}</h3>
  <span class="job-type">
  ${escapeHtml(j.type || "کارآموزی")}
  </span>
  </div>
  
  </div>
  
  <div class="tags">
  <span class="tag">${escapeHtml(j.type || "Intern")}</span>
  </div>
  
  <span class="job-location">
  <i class="fa-solid fa-location-dot"></i>
  ${escapeHtml(j.location || "نامشخص")}
  </span>
  
  <button class="btn-sub-job" data-action="apply">
  ارسال درخواست
  </button>
  
  </div>
  `;
  }
  
  /* =====================================================
  EVENTS
  ===================================================== */
  
  els.expPrev?.addEventListener("click",()=>{
  if(!experiences.length) return;
  
  expIndex=(expIndex-1+experiences.length)%experiences.length;
  
  renderExperience();
  });
  
  els.expNext?.addEventListener("click",()=>{
  if(!experiences.length) return;
  
  expIndex=(expIndex+1)%experiences.length;
  
  renderExperience();
  });
  
  els.jobsPrev?.addEventListener("click",()=>{
  if(!jobs.length) return;
  
  jobIndex=(jobIndex-1+jobs.length)%jobs.length;
  
  renderJob();
  });
  
  els.jobsNext?.addEventListener("click",()=>{
  if(!jobs.length) return;
  
  jobIndex=(jobIndex+1)%jobs.length;
  
  renderJob();
  });
  
  /* APPLY BUTTON */
  
  els.jobsContainer?.addEventListener("click",(e)=>{
  
  const btn=e.target.closest("[data-action='apply']");
  if(!btn) return;
  
  const card=btn.closest(".job-card");
  const id=card?.dataset?.id;
  
  if(!id) return;
  
  window.location.href=`apply.html?jobId=${id}&companyId=${companyId}`;
  });
  
  /* =====================================================
  INIT
  ===================================================== */
  
  const companyId=getCompanyId();
  
  if(!companyId){
  setText(els.companyName,"شرکتی یافت نشد");
  return;
  }
  
  els.btnSubmitExp?.addEventListener("click",()=>{
  window.location.href=`experience.html?companyId=${companyId}`;
  });
  
  loadCompany(companyId);
  loadExperiences(companyId);
  loadJobs(companyId);
  
  });
