// =====================
// Elements
// =====================
const companyLoginForm = document.getElementById("companyLoginForm");
const registerCompanyForm = document.getElementById("registerCompanyForm"); // این فرم در HTML وجود دارد

const compLoginBox = document.getElementById("compLoginBox");
const compSignupBox = document.getElementById("compSignupBox");

const toCompSignUp = document.getElementById("toCompSignUp");
const toCompLogin = document.getElementById("toCompLogin");

// =====================
// Helpers
// =====================
async function parseResponse(res) {
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    // If parsing fails, it might be a plain text error or no content
  }
  return { text, json };
}

// =====================
// Switch between login/signup
// =====================
if (toCompSignUp) {
  toCompSignUp.addEventListener("click", () => {
    if (compLoginBox) compLoginBox.style.display = "none";
    if (compSignupBox) compSignupBox.style.display = "block";
  });
}

if (toCompLogin) {
  toCompLogin.addEventListener("click", () => {
    if (compSignupBox) compSignupBox.style.display = "none";
    if (compLoginBox) compLoginBox.style.display = "block";
  });
}

// =====================
// Company Login
// =====================
if (companyLoginForm) {
  companyLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("compLoginEmail")?.value.trim();
    const password = document.getElementById("compLoginPassword")?.value.trim();

    if (!email || !password) {
      alert("ایمیل و رمز عبور را وارد کنید");
      return;
    }

    try {
      // Endpoint for company login is correct
      const res = await fetch("http://localhost:8080/api/auth/company-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const { text, json } = await parseResponse(res);

      if (!res.ok) {
        console.error("COMPANY LOGIN FAILED:", res.status, text);
        alert(json?.message || text || `ورود ناموفق بود (کد ${res.status})`);
        return;
      }

      // Store company session info
      localStorage.setItem("companyLoggedIn", "true");
      localStorage.setItem("companyEmail", email);
      if (json?.token) localStorage.setItem("companyToken", json.token);
      // Assuming backend returns companyId and companyName upon successful login
      if (json?.companyId) localStorage.setItem("companyId", json.companyId);
      if (json?.companyName) localStorage.setItem("companyName", json.companyName);


      // Redirect to dashboard
      window.location.href = "company-dashboard.html";
    } catch (err) {
      console.error("Company login error:", err);
      alert("خطا در ارتباط با سرور");
    }
  });
}

// =====================
// Company Register
// =====================
if (registerCompanyForm) {
  registerCompanyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const companyName = document.getElementById("compName")?.value.trim();
    const email = document.getElementById("compEmail")?.value.trim();
    const password = document.getElementById("compPassword")?.value.trim(); // This password will be used by the backend to create the company's user account
    const industry = document.getElementById("compIndustry")?.value.trim();
    const location = document.getElementById("compLocation")?.value.trim();
    const website = document.getElementById("compWebsite")?.value.trim();

    // Basic validation
    if (!companyName || !email || !password || !industry || !location || !website) {
      alert("لطفاً همه فیلدها را کامل کنید");
      return;
    }

    // Prepare payload according to the backend's CompanyRegisterRequest DTO
    const payload = {
      companyName: companyName, // Matches CompanyRegisterRequest field
      email: email,             // Matches CompanyRegisterRequest field (also used for user creation)
      password: password,       // Matches CompanyRegisterRequest field (used for user creation)
      industry: industry,
      location: location,
      website: website
      // Add other fields if CompanyRegisterRequest requires them
    };

    try {
      // *** CORRECTED API ENDPOINT ***
      // We are now using the /api/auth/register-company endpoint which expects CompanyRegisterRequest
      const res = await fetch("http://localhost:8080/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { text, json } = await parseResponse(res);

      if (!res.ok) {
        console.error("COMPANY REGISTER FAILED:", res.status, text);
        // Display a user-friendly error message
        alert(json?.message || text || `ثبت‌نام ناموفق بود (کد ${res.status})`);
        return;
      }

      // Success message
      // The backend's AuthService.registerCompany should return a success message or token
      alert(json?.message || "ثبت شرکت با موفقیت انجام شد و در انتظار تایید است.");

      // Reset form and switch back to login view
      registerCompanyForm.reset();
      if (compSignupBox) compSignupBox.style.display = "none";
      if (compLoginBox) compLoginBox.style.display = "block";

    } catch (err) {
      console.error("Company register error:", err);
      alert("خطا در ارتباط با سرور");
    }
  });
}
