// ======================================
// AUTH CONFIG
// ======================================

const API_ROOT = "http://localhost:8080/api";
const AUTH_API = `${API_ROOT}/auth`;

const DASHBOARD_BY_ROLE = {
    ADMIN: "/html/admin-dashboard.html",
    COMPANY: "/html/company-dashboard.html",
    STUDENT: "/html/student-dashboard.html"
};

// ======================================
// UTILITIES
// ======================================

function setLoading(btn, loading) {
    if (!btn) return;

    btn.disabled = loading;
    btn.style.opacity = loading ? "0.6" : "1";
    btn.style.cursor = loading ? "not-allowed" : "pointer";
}

async function readErrorMessage(response) {
    try {
        const text = await response.text();

        if (!text) return "خطای نامشخص از سرور";

        try {
            const json = JSON.parse(text);
            return json.message || json.error || json.details || text;
        } catch {
            return text;
        }
    } catch {
        return "خطا در خواندن پاسخ سرور";
    }
}

// ======================================
// STORAGE
// ======================================

function normalizeRole(role) {
    if (!role) return "STUDENT";

    let normalized = String(role).trim().toUpperCase();

    if (normalized.startsWith("ROLE_")) {
        normalized = normalized.replace("ROLE_", "");
    }

    return normalized;
}

function extractUserIdFromAuthResponse(data) {
    return (
        data?.userId ??
        data?.id ??
        data?.user?.id ??
        data?.currentUser?.id ??
        data?.account?.id ??
        data?.studentId ??
        data?.companyId ??
        null
    );
}

function extractRoleFromAuthResponse(data) {
    return normalizeRole(
        data?.role ??
        data?.user?.role ??
        data?.currentUser?.role ??
        data?.account?.role ??
        "STUDENT"
    );
}

function saveAuthToStorage(data) {
    const token = data?.token ?? data?.accessToken ?? data?.jwt ?? null;
    const userId = extractUserIdFromAuthResponse(data);
    const role = extractRoleFromAuthResponse(data);

    if (!token) {
        console.error("AUTH SAVE ERROR - Token is missing:", data);
        alert("توکن از سرور دریافت نشد");
        return false;
    }

    if (userId === null || userId === undefined || String(userId).trim() === "") {
        console.error("AUTH SAVE ERROR - UserId is missing:", data);
        alert("شناسه کاربر از سرور دریافت نشد");
        return false;
    }

    localStorage.setItem("token", String(token));
    localStorage.setItem("userId", String(userId).trim());
    localStorage.setItem("role", role);

    localStorage.setItem("currentUser", JSON.stringify({
        id: String(userId).trim(),
        role: role
    }));

    console.log("AUTH SAVED:", {
        userId: String(userId).trim(),
        role,
        hasToken: true
    });

    return true;
}

function clearAuthStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("currentUser");
}

function getToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    return !!token && !!userId && userId !== "undefined" && userId !== "null";
}

// ======================================
// REDIRECT
// ======================================

function redirectByRole(role) {
    const normalizedRole = normalizeRole(role);
    const target = DASHBOARD_BY_ROLE[normalizedRole] || DASHBOARD_BY_ROLE.STUDENT;

    window.location.href = target;
}

// ======================================
// PAGE INIT
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    const toSignUp = document.getElementById("toSignUp");
    const toLogin = document.getElementById("toLogin");

    const loginBox = document.querySelector(".login-box");
    const signupBox = document.querySelector(".signup-box");

    if (toSignUp && loginBox && signupBox) {
        toSignUp.addEventListener("click", () => {
            loginBox.style.display = "none";
            signupBox.style.display = "block";
        });
    }

    if (toLogin && loginBox && signupBox) {
        toLogin.addEventListener("click", () => {
            signupBox.style.display = "none";
            loginBox.style.display = "block";
        });
    }
});

// ======================================
// LOGIN
// ======================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const loginBtn = document.getElementById("loginBtn");
        setLoading(loginBtn, true);

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value.trim();

        if (!email || !password) {
            alert("ایمیل و رمز عبور الزامی است");
            setLoading(loginBtn, false);
            return;
        }

        try {
            const response = await fetch(`${AUTH_API}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                const msg = await readErrorMessage(response);
                alert(msg || "ورود ناموفق");
                return;
            }

            const data = await response.json();

            console.log("LOGIN RESPONSE:", data);

            const saved = saveAuthToStorage(data);

            if (!saved) {
                return;
            }

            const role = extractRoleFromAuthResponse(data);

            redirectByRole(role);

        } catch (err) {
            console.error("LOGIN ERROR:", err);
            alert("خطا در اتصال به سرور");
        } finally {
            setLoading(loginBtn, false);
        }
    });
}

// ======================================
// REGISTER
// ======================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const registerBtn = document.getElementById("registerBtn");
        setLoading(registerBtn, true);

        const name = document.getElementById("regName")?.value.trim();
        const email = document.getElementById("regEmail")?.value.trim();
        const password = document.getElementById("regPassword")?.value.trim();

        if (!name || !email || !password) {
            alert("تمام فیلدها الزامی هستند");
            setLoading(registerBtn, false);
            return;
        }

        try {
            const response = await fetch(`${AUTH_API}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            if (!response.ok) {
                const msg = await readErrorMessage(response);
                alert(msg || "خطا در ثبت‌نام");
                return;
            }

            alert("ثبت‌نام با موفقیت انجام شد ✅");

            registerForm.reset();

            const loginBox = document.querySelector(".login-box");
            const signupBox = document.querySelector(".signup-box");

            if (loginBox && signupBox) {
                signupBox.style.display = "none";
                loginBox.style.display = "block";
            }

        } catch (err) {
            console.error("REGISTER ERROR:", err);
            alert("ارتباط با سرور برقرار نشد");
        } finally {
            setLoading(registerBtn, false);
        }
    });
}

// ======================================
// LOGOUT
// ======================================

function logout() {
    clearAuthStorage();
    window.location.href = "/html/auth.html";
}
