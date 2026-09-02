(() => {
  "use strict";

  // ===============================
  // Config
  // ===============================
  const API_ORIGIN = "http://localhost:8080";
  const COMPANY_API = `${API_ORIGIN}/api/companies`;
  const EXPERIENCE_API = `${API_ORIGIN}/api/experiences`;

  // ===============================
  // دریافت داینامیک آیدی کاربر لاگین شده
  // ===============================
  function getLoggedInUserId() {
    const userId = localStorage.getItem("userId");
    
    if (!userId || userId === "undefined" || userId === "null" || String(userId).trim() === "") {
      return null;
    }
    return String(userId).trim();
  }

  // ===============================
  // DOM helpers
  // ===============================
  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  const setText = (el, text) => {
    if (!el) return;
    el.textContent = text;
  };

  const normalizeStr = (v) => (v === null || v === undefined ? "" : String(v)).trim();

  // ===============================
  // Elements
  // ===============================
  const form = byId("experienceForm");

  const titleEl = byId("title");
  const descEl = byId("description");
  const startEl = byId("startDate");
  const endEl = byId("endDate");

  // Company slider
  const companyNameText = byId("companyName");
  const companyHiddenInput = byId("companySelect");
  const prevBtn = byId("prevCompany");
  const nextBtn = byId("nextCompany");

  // Rating
  const sliders = document.querySelectorAll(".rate-input");
  const finalBadge = byId("finalRatingBadge");
  const finalText = byId("finalRatingText");
  const finalInput = byId("finalRating");

  // ===============================
  // State
  // ===============================
  let companies = [];
  let currentCompanyIndex = 0;

  // ===============================
  // Approved filter (robust)
  // ===============================
  function isCompanyApproved(c) {
    const status = normalizeStr(c?.status || c?.approvalStatus).toUpperCase();
    if (status === "APPROVED") return true;

    if (c?.approved === true) return true;
    if (c?.isApproved === true) return true;

    if (c?.approved === 1) return true;

    return false;
  }

  // ===============================
  // Fetch helpers
  // ===============================
  async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${raw || "Request failed"}`);
    }

    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      throw new Error("Response is not valid JSON.");
    }
  }

  // ===============================
  // Company slider
  // ===============================
  function updateCompanySlider() {
    if (!companies.length) return;

    const c = companies[currentCompanyIndex];
    setText(companyNameText, c?.name || "بدون نام");
    if (companyHiddenInput) companyHiddenInput.value = c?.id ?? "";
  }

  function nextCompany() {
    if (!companies.length) return;
    currentCompanyIndex = (currentCompanyIndex + 1) % companies.length;
    updateCompanySlider();
  }

  function prevCompany() {
    if (!companies.length) return;
    currentCompanyIndex = (currentCompanyIndex - 1 + companies.length) % companies.length;
    updateCompanySlider();
  }

  async function loadApprovedCompanies() {
    setText(companyNameText, "در حال بارگذاری شرکت‌ها...");
    if (companyHiddenInput) companyHiddenInput.value = "";

    const all = await fetchJson(COMPANY_API);

    if (!Array.isArray(all)) {
      const maybe = all?.content;
      if (Array.isArray(maybe)) {
        companies = maybe.filter(isCompanyApproved);
      } else {
        throw new Error("Company API response is not an array (or {content:[]}).");
      }
    } else {
      companies = all.filter(isCompanyApproved);
    }

    if (!companies.length) {
      setText(companyNameText, "هیچ شرکت تاییدشده‌ای موجود نیست");
      if (companyHiddenInput) companyHiddenInput.value = "";
      return;
    }

    currentCompanyIndex = 0;
    updateCompanySlider();
  }

  // ===============================
  // Rating average
  // ===============================
  function calculateAverage() {
    if (!sliders.length) return;

    let sum = 0;
    sliders.forEach((sl) => (sum += Number(sl.value || 0)));

    // ضرب در ۱۰، حذف اعشار با trunc، سپس تقسیم بر ۱۰ برای نمایش یک رقم اعشار بدون گرد کردن
    const avg = Math.trunc((sum / sliders.length) * 10) / 10;

    if (finalBadge) finalBadge.textContent = avg.toFixed(1);
    if (finalText) finalText.textContent = `${avg.toFixed(1)} / ۵`;
    if (finalInput) finalInput.value = String(avg);
}


  // ===============================
  // Submit experience
  // ===============================
  async function submitExperience(e) {
    e.preventDefault();

    // بررسی ولیدیشن لاگین کاربر
    const currentUserId = getLoggedInUserId();
    if (!currentUserId) {
      alert("❌ برای ثبت تجربه ابتدا باید وارد حساب کاربری خود شوید.");
      return;
    }

    const companyId = normalizeStr(companyHiddenInput?.value);
    if (!companyId) {
      alert("لطفاً یک شرکت تاییدشده انتخاب کنید.");
      return;
    }

    const title = normalizeStr(titleEl?.value);
    const description = normalizeStr(descEl?.value);
    const startDate = normalizeStr(startEl?.value);
    const endDate = normalizeStr(endEl?.value);

    if (!title) return alert("عنوان تجربه را وارد کنید.");
    if (!description) return alert("توضیحات تجربه را وارد کنید.");

    if (startDate && endDate && endDate < startDate) {
      return alert("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.");
    }

    const rating = finalInput ? Number(finalInput.value) : 3.0;

    const payload = {
      title,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      rating: Number.isFinite(rating) ? rating : 3.0,
    };

    // 🎯 قرار دادن آیدی واقعی کاربر لاگین شده در URL درخواست
    const url = `${EXPERIENCE_API}?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`;

    try {
      // اگر در LocalStorage توکن JWT داری، می‌توانی هدر Authorization را هم اینجا فعال کنی
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetchJson(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      alert("✅ تجربه شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد.");
      window.location.href = "index.html";
      
    } catch (err) {
      console.error("Submit experience error:", err);
      alert(`❌ خطا در ثبت تجربه:\n${err.message}`);
    }
  }

  // ===============================
  // Init
  // ===============================
  document.addEventListener("DOMContentLoaded", async () => {
    sliders.forEach((sl) => sl.addEventListener("input", calculateAverage));
    calculateAverage();

    if (prevBtn) prevBtn.addEventListener("click", (e) => (e.preventDefault(), prevCompany()));
    if (nextBtn) nextBtn.addEventListener("click", (e) => (e.preventDefault(), nextCompany()));

    if (form) form.addEventListener("submit", submitExperience);

    try {
      await loadApprovedCompanies();
    } catch (err) {
      console.error("Load companies error:", err);
      setText(companyNameText, "خطا در بارگذاری شرکت‌ها");
      alert(`❌ خطا در دریافت شرکت‌ها:\n${err.message}`);
    }
  });
})();