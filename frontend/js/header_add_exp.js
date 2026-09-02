document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // -------------------------
    // هدر نوع اول
    // -------------------------
    const headerActions = document.getElementById("header-actions");

    if (headerActions) {
        const searchBarHTML = `
            <div class="search-bar">
                <input type="text" placeholder="جستجو...">
                <i class="fas fa-search"></i>
            </div>
        `;

        if (!token || !userId) {
            headerActions.innerHTML = `
                ${searchBarHTML}
                <a href="auth.html" style="text-decoration:none;">
                    <button class="btn btn-outline">ورود</button>
                </a>
                <a href="auth.html?mode=register" style="text-decoration:none;">
                    <button class="btn btn-solid">ثبت‌نام</button>
                </a>
            `;
        } else {
            headerActions.innerHTML = `
                ${searchBarHTML}
                <a href="Interno.html" style="text-decoration:none;">
                    <button class="btn btn-outline">صفحه اصلی</button>
                </a>
                <a href="add.html" style="text-decoration:none;">
                    <button class="btn btn-solid">ثبت تجربه</button>
                </a>
                <a href="profile.html" style="text-decoration:none;">
                    <button class="btn btn-outline">پروفایل</button>
                </a>
                <button class="btn btn-outline" id="logout-btn">خروج</button>
            `;

            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    window.location.href = "Interno.html";
                });
            }
        }
    }

    // -------------------------
    // هدر نوع دوم
    // -------------------------
    const navLeft = document.getElementById("nav-left");

    if (navLeft) {
        if (!token || !userId) {
            navLeft.innerHTML = `
                <a href="Interno.html" class="btn-dashboard">صفحه اصلی</a>
                <a href="auth.html" class="btn-dashboard">ورود</a>
                <a href="auth.html?mode=register" class="btn-dashboard">ثبت‌نام</a>
            `;
        } else {
            navLeft.innerHTML = `
                <a href="Interno.html" class="btn-dashboard">صفحه اصلی</a>
                <a href="profile.html" class="btn-dashboard">پروفایل</a>
                <a href="add.html" class="btn-dashboard">ثبت تجربه</a>
                <a href="#" class="btn-dashboard" id="logout-link">خروج</a>
            `;

            const logoutLink = document.getElementById("logout-link");
            if (logoutLink) {
                logoutLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                   window.location.href = "Interno.html";
                });
            }
        }
    }
});
