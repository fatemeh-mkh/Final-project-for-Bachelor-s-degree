// company-dashboard.js

document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("companyToken");
  const isLoggedIn = localStorage.getItem("companyLoggedIn");
  
  if (!token && isLoggedIn !== "true") {
  window.location.href = "company-auth.html";
  return;
  }
  
  const BASE_API_URL = "http://localhost:8080/api";
  
  const els = {
  
  sectionDashboard: document.getElementById("sectionDashboard"),
  sectionJobForm: document.getElementById("sectionJobForm"),
  sectionApplicants: document.getElementById("sectionApplicants"),
  
  btnNavDashboard: document.getElementById("btnNavDashboard"),
  btnNavNewJob: document.getElementById("btnNavNewJob"),
  btnNavApplicants: document.getElementById("btnNavApplicants"),
  
  statActiveJobs: document.getElementById("statActiveJobs"),
  statTotalApplicants: document.getElementById("statTotalApplicants"),
  statPendingApplicants: document.getElementById("statPendingApplicants"),
  statAcceptedApplicants: document.getElementById("statAcceptedApplicants"),
  
  jobsTable: document.getElementById("jobsTable"),
  jobSearch: document.getElementById("jobSearch"),
  btnOpenCreateJob: document.getElementById("btnOpenCreateJob"),
  
  jobForm: document.getElementById("jobForm"),
  jobId: document.getElementById("jobId"),
  jobTitle: document.getElementById("jobTitle"),
  jobDuration: document.getElementById("jobDuration"),
  jobDescription: document.getElementById("jobDescription"),
  jobSkills: document.getElementById("jobSkills"),
  jobBenefits: document.getElementById("jobBenefits"),
  btnCloseJobForm: document.getElementById("btnCloseJobForm"),
  
  applicantsTable: document.getElementById("applicantsTable"),
  filterJob: document.getElementById("filterJob"),
  filterStatus: document.getElementById("filterStatus"),
  
  statusModal: document.getElementById("statusModal"),
  btnCloseModal: document.getElementById("btnCloseModal"),
  modalApplicantName: document.getElementById("modalApplicantName"),
  modalApplicantJob: document.getElementById("modalApplicantJob"),
  modalStatusSelect: document.getElementById("modalStatusSelect"),
  modalNote: document.getElementById("modalNote"),
  btnSaveApplicantStatus: document.getElementById("btnSaveApplicantStatus")
  
  };
  
  let jobs = [];
  let applicants = [];
  let modalApplicantId = null;
  
  function authHeaders(){
  return {
  "Content-Type":"application/json",
  "Authorization":`Bearer ${token}`
  };
  }
  
  function parseSkillsInputToArray(input){
  if(!input) return [];
  return input.split(",").map(s=>s.trim()).filter(Boolean);
  }
  
  function escapeHtml(v){
  return (v ?? "").toString()
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;");
  }
  
  function showSection(name){
  
  els.sectionDashboard.hidden = true;
  els.sectionJobForm.hidden = true;
  els.sectionApplicants.hidden = true;
  
  if(name==="dashboard") els.sectionDashboard.hidden=false;
  if(name==="jobForm") els.sectionJobForm.hidden=false;
  if(name==="applicants") els.sectionApplicants.hidden=false;
  
  }
  
  function scrollToSection(el){
  el.scrollIntoView({behavior:"smooth"});
  }
  
  async function apiGet(url){
  const res = await fetch(url,{headers:authHeaders()});
  if(!res.ok) throw new Error(await res.text());
  return res.json();
  }
  
  async function apiSend(url,method,body){
  
  const res = await fetch(url,{
  method,
  headers:authHeaders(),
  body: body ? JSON.stringify(body) : undefined
  });
  
  if(!res.ok) throw new Error(await res.text());
  
  if(res.status===204) return null;
  
  return res.json();
  
  }
  
  function renderStats(){
  
  els.statActiveJobs.textContent = jobs.length;
  
  els.statTotalApplicants.textContent = applicants.length;
  
  els.statPendingApplicants.textContent =
  applicants.filter(a => a.status === "pending").length;
  
  els.statAcceptedApplicants.textContent =
  applicants.filter(a => a.status === "accepted").length;
  
  }
  
  function renderJobsTable(){
  
  const q = (els.jobSearch.value || "").toLowerCase();
  
  const filtered = jobs.filter(j =>
  j.title.toLowerCase().includes(q) ||
  (j.skills || []).join(",").toLowerCase().includes(q)
  );
  
  els.jobsTable.innerHTML = filtered.map(j=>`
  
  <div class="row" data-job-id="${j.id}">
  
  <div class="actions">
  <button data-action="viewApplicants">متقاضیان</button>
  <button data-action="edit">ویرایش</button>
  <button data-action="delete">حذف</button>
  </div>
  
  <span class="title">${escapeHtml(j.title)}</span>
  <span>${j.applicantCount ?? 0} متقاضی</span>
  
  </div>
  
  `).join("");
  
  }
  
  function renderJobFilterOptions(){
  
  els.filterJob.innerHTML = `
  <option value="all">همه آگهی‌ها</option>
  ${jobs.map(j=>`<option value="${j.id}">${escapeHtml(j.title)}</option>`).join("")}
  `;
  
  }
  
  function statusLabel(s){
  if(s==="pending") return "در انتظار بررسی";
  if(s==="accepted") return "پذیرفته‌شده";
  if(s==="rejected") return "رد شده";
  if(s==="reviewed") return "بررسی‌شده";
  return s;
  }
  
  function renderApplicantsTable(){
  
  const jobId = els.filterJob.value;
  const status = els.filterStatus.value;
  
  const filtered = applicants.filter(a => {
  
  const jobMatch = jobId==="all" || String(a.jobId)===jobId;
  const statusMatch = status==="all" || a.status===status;
  
  return jobMatch && statusMatch;
  
  });
  
  els.applicantsTable.innerHTML = filtered.map(a=>`
  
  <div class="row applicant" data-id="${a.id}">
  
  <div>
  <strong>${escapeHtml(a.fullName)}</strong>
  <div>${escapeHtml(a.jobTitle)}</div>
  </div>
  
  <span>${statusLabel(a.status)}</span>
  
  <button data-action="openModal">مشاهده وضعیت</button>
  
  </div>
  
  `).join("");
  
  }
  
  function openModal(applicant){
  
  modalApplicantId = applicant.id;
  
  els.modalApplicantName.textContent = applicant.fullName;
  els.modalApplicantJob.textContent = applicant.jobTitle;
  els.modalStatusSelect.value = applicant.status;
  els.modalNote.value = applicant.note;
  
  els.statusModal.hidden = false;
  
  }
  
  function closeModal(){
  els.statusModal.hidden = true;
  }
  
  async function loadJobs(){
  const data = await apiGet(`${BASE_API_URL}/company/jobs`);
  // استانداردسازی فیلد مهارت‌ها به آرایه برای عدم مواجهه با خطا
  jobs = (data || []).map(j => ({
  ...j,
  skills: Array.isArray(j.skills) ? j.skills : (typeof j.skills === "string" ? j.skills.split(",").map(s => s.trim()).filter(Boolean) : [])
  }));
  }
  
  async function loadApplicants(){
  const data = await apiGet(`${BASE_API_URL}/company/applicants`);
  // تبدیل وضعیت‌ها به حروف کوچک جهت هماهنگی با فرانت‌اند و فیلترها
  applicants = (data || []).map(a => ({
  ...a,
  status: (a.status || "pending").toLowerCase(),
  jobId: String(a.jobAdvertisementId ?? a.jobId ?? "")
  }));
  }
  
  async function loadAllData(){
  
  await loadJobs();
  await loadApplicants();
  
  renderJobsTable();
  renderJobFilterOptions();
  renderApplicantsTable();
  renderStats();
  
  }
  
  els.jobForm.addEventListener("submit", async e => {
  
  e.preventDefault();
  
  const id = els.jobId.value;
  
  const payload = {
  
  title: els.jobTitle.value,
  duration: els.jobDuration.value,
  description: els.jobDescription.value,
  skills: parseSkillsInputToArray(els.jobSkills.value),
  benefits: els.jobBenefits.value
  
  };
  
  if(id){
  
  await apiSend(`${BASE_API_URL}/company/jobs/${id}`,"PUT",payload);
  
  }else{
  
  await apiSend(`${BASE_API_URL}/company/jobs`,"POST",payload);
  
  }
  
  els.jobForm.reset();
  els.jobId.value="";
  
  await loadAllData();
  
  showSection("dashboard");
  scrollToSection(els.sectionDashboard);
  
  });
  
  els.btnOpenCreateJob.addEventListener("click",()=>{
  
  els.jobForm.reset();
  els.jobId.value="";
  
  showSection("jobForm");
  scrollToSection(els.sectionJobForm);
  
  });
  
  els.btnCloseJobForm.addEventListener("click",()=>{
  showSection("dashboard");
  scrollToSection(els.sectionDashboard);
  });
  
  els.jobSearch.addEventListener("input",renderJobsTable);
  
  els.filterJob.addEventListener("change",renderApplicantsTable);
  els.filterStatus.addEventListener("change",renderApplicantsTable);
  
  els.jobsTable.addEventListener("click",async e=>{
  
  const btn = e.target.closest("button[data-action]");
  if(!btn) return;
  
  const row = e.target.closest(".row");
  const jobId = row.dataset.jobId;
  
  const job = jobs.find(j=>String(j.id)===String(jobId));
  if(!job) return;
  
  const action = btn.dataset.action;
  
  if(action==="viewApplicants"){
  
  els.filterJob.value = jobId;
  
  showSection("applicants");
  scrollToSection(els.sectionApplicants);
  
  renderApplicantsTable();
  
  }
  
  if(action==="edit"){
  
  els.jobId.value = job.id;
  els.jobTitle.value = job.title;
  els.jobDuration.value = job.duration;
  els.jobDescription.value = job.description;
  els.jobSkills.value = (job.skills || []).join(",");
  els.jobBenefits.value = job.benefits;
  
  showSection("jobForm");
  scrollToSection(els.sectionJobForm);
  
  }
  
  if(action==="delete"){
  
  if(!confirm("آیا از حذف آگهی مطمئن هستید؟")) return;
  
  await apiSend(`${BASE_API_URL}/company/jobs/${jobId}`,"DELETE");
  
  jobs = jobs.filter(j=>j.id!=jobId);
  
  renderJobsTable();
  renderJobFilterOptions();
  renderStats();
  
  }
  
  });
  
  els.applicantsTable.addEventListener("click",e=>{
  
  const btn = e.target.closest("button[data-action='openModal']");
  if(!btn) return;
  
  const row = e.target.closest(".row");
  const id = row.dataset.id;
  
  const applicant = applicants.find(a=>String(a.id)===String(id));
  if(!applicant) return;
  
  openModal(applicant);
  
  });
  
  els.btnCloseModal.addEventListener("click",closeModal);
  
  els.btnSaveApplicantStatus.addEventListener("click",async ()=>{
  
  const newStatus = els.modalStatusSelect.value.toUpperCase();
  const note = els.modalNote.value;
  
  await apiSend(
  `${BASE_API_URL}/company/applicants/${modalApplicantId}/status`,
  "PATCH",
  {status:newStatus,note}
  );
  
  await loadAllData();
  
  closeModal();
  
  });
  
  els.btnNavDashboard.addEventListener("click",()=>{
  showSection("dashboard");
  scrollToSection(els.sectionDashboard);
  });
  
  els.btnNavNewJob.addEventListener("click",()=>{
  showSection("jobForm");
  scrollToSection(els.sectionJobForm);
  });
  
  els.btnNavApplicants.addEventListener("click",()=>{
  showSection("applicants");
  scrollToSection(els.sectionApplicants);
  });
  
  loadAllData();
  
  });
  