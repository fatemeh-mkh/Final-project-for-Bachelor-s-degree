// اسکریپت لودر هوشمند هدر و فوتر پلتفرم اینترنو (layout-loader.js)

const DASHBOARDS = {
  ADMIN: "admin-dashboard.html",
  COMPANY: "company-dashboard.html",
  STUDENT: "student-dashboard.html"
};

async function loadLayout() {
  try {
    // لود هم‌زمان هدر و فوتر با مسیرهای نسبی پروژه شما
    const [headerResponse, footerResponse] = await Promise.all([
      fetch("main_header.html"),
      fetch("main_footer.html")
    ]);

    if (headerResponse.ok) {
      const headerHtml = await headerResponse.text();
      const headerContainer = document.getElementById("header-container");
      if (headerContainer) {
        headerContainer.innerHTML = headerHtml;
        initHeaderActions();
      }
    } else {
      console.error("خطا: فایل main_header.html پیدا نشد.");
    }

    if (footerResponse.ok) {
      const footerHtml = await footerResponse.text();
      const footerContainer = document.getElementById("footer-container");
      if (footerContainer) {
        footerContainer.innerHTML = footerHtml;
      }
    } else {
      console.error("خطا: فایل main_footer.html پیدا نشد.");
    }

  } catch (error) {
    console.error("خطای شبکه در بارگذاری هدر یا فوتر:", error);
  }
}

// منطق احراز هویت و دکمه‌های پویا در هدر
function initHeaderActions() {
  const actions = document.getElementById("header-actions");
  if (!actions) return;

  // ۱. بررسی تمام حالت‌های ممکن لاگین (دانشجو یا شرکت)
  const companyLoggedIn = localStorage.getItem("companyLoggedIn") === "true";
  const companyToken = localStorage.getItem("companyToken");
  const userToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const token = companyToken || userToken;

  // ۲. تشخیص نقش کاربر
  let rawRole = localStorage.getItem("role");
  if (companyLoggedIn || companyToken) {
    rawRole = "COMPANY";
  }
  
  const role = (rawRole || "").toUpperCase().replace("ROLE_", "");

  // ۳. تشخیص وضعیت لاگین
  const isUserLoggedIn = !!token || companyLoggedIn;

  const searchBarHTML = `
    <div class="search-bar">
      <input type="text" placeholder="جستجو...">
      <i class="fas fa-search"></i>
    </div>
  `;

  // حالت اول: کاربر مهمان (لاگین نکرده)
  if (!isUserLoggedIn) {
    actions.innerHTML = `
      ${searchBarHTML}
      <a href="auth.html" style="text-decoration:none;">
        <button class="btn btn-outline">ورود</button>
      </a>
      <a href="auth.html?mode=register" style="text-decoration:none;">
        <button class="btn btn-solid">ثبت‌نام</button>
      </a>
    `;
    return;
  }

  // حالت دوم: ورود شرکت (فقط داشبورد شرکت و خروج)
  if (role === "COMPANY") {
    actions.innerHTML = `
      ${searchBarHTML}
      <a href="${DASHBOARDS.COMPANY}" style="text-decoration:none;">
        <button class="btn btn-outline">داشبورد شرکت</button>
      </a>
      <button class="btn btn-outline" id="logout-btn">خروج</button>
    `;
  } 
  // حالت سوم: ورود کاربر / دانشجو
  else {
    const userDashboardUrl = DASHBOARDS[role] || DASHBOARDS.STUDENT;
    actions.innerHTML = `
      ${searchBarHTML}
      <a href="add.html" style="text-decoration:none;">
        <button class="btn btn-solid">ثبت تجربه</button>
      </a>
      <a href="${userDashboardUrl}" style="text-decoration:none;">
        <button class="btn btn-outline">پروفایل</button>
      </a>
      <button class="btn btn-outline" id="logout-btn">خروج</button>
    `;
  }

  // رویداد خروج کامل
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "auth.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", loadLayout);