document.addEventListener("DOMContentLoaded", async () => {
    "use strict";
  
    const BASE_API_URL = "http://localhost:8080/api";
  
    const form = document.getElementById("applyForm");
    const submitBtn = form?.querySelector("button[type='submit']");
  
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    let companyId = params.get("companyId");
  
    if (!jobId) {
      alert("شناسه شغل مشخص نیست");
      return;
    }
  
    document.getElementById("jobId").value = jobId;
  
    /* =====================================================
       اگر companyId در URL نبود، از سرور بگیر
    ===================================================== */
  
    if (!companyId) {
      try {
        const res = await fetch(`${BASE_API_URL}/public/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          companyId = data.companyId || data.company?.id;
        }
      } catch (err) {
        console.warn("خطا در دریافت companyId:", err);
      }
    }
  
    /* =====================================================
       SUBMIT HANDLER
    ===================================================== */
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      if (submitBtn.disabled) return; // جلوگیری از دابل کلیک
  
      submitBtn.disabled = true;
      submitBtn.textContent = "در حال ارسال...";
  
      const applicantData = {
        jobId: parseInt(jobId),
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        coverLetter: form.coverLetter.value.trim()
      };
  
      try {
        const response = await fetch(
          `${BASE_API_URL}/public/applicants/apply`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(applicantData)
          }
        );
  
        const text = await response.text();
  
        if (!response.ok) {
          throw new Error(text || `HTTP ${response.status}`);
        }
  
        alert("درخواست با موفقیت ارسال شد ✅");
  
        form.reset();
  
        if (companyId) {
          window.location.replace(
            `company-details.html?id=${companyId}`
          );
        } else {
          window.location.replace("index.html");
        }
  
      } catch (err) {
        console.error("FULL ERROR:", err);
        alert("خطا در ارسال درخواست: " + err.message);
  
        submitBtn.disabled = false;
        submitBtn.textContent = "ارسال درخواست";
      }
    });
  });
  