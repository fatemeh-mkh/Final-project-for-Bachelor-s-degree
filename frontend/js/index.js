// ======================================
// EXPERIENCES CONFIG
// ======================================

const EXPERIENCES_API = "http://localhost:8080/api/experiences";

// =========================
// سیستم پیام پایین صفحه
// =========================

function showMessage(text, type = "info") {
    const msg = document.getElementById("globalMessage");

    if (!msg) {
        console.warn("globalMessage element not found");
        alert(text);
        return;
    }

    msg.innerText = text;
    msg.className = `global-message ${type} show`;

    setTimeout(() => {
        msg.classList.remove("show");
    }, 3500);
}

// =========================
// گرفتن کاربر فعلی
// =========================

function getCurrentUser() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (
        !token ||
        !userId ||
        userId === "undefined" ||
        userId === "null" ||
        String(userId).trim() === ""
    ) {
        return null;
    }

    return {
        id: String(userId).trim(),
        token: token
    };
}

// =========================
// گرفتن مالک تجربه
// =========================

function getExperienceOwnerId(exp) {
    if (!exp) return null;
    // پوشش دادن هر دو حالت احتمالی مپ شدن در جاوا (userId یا user_id)
    return exp.userId ?? exp.user_id ?? exp.companyId ?? null;
}

// =========================
// بررسی مالک بودن
// =========================

function isExperienceOwner(exp) {
    const currentUser = getCurrentUser();
    const ownerId = getExperienceOwnerId(exp);

    if (!currentUser || ownerId === null || ownerId === undefined) {
        return false;
    }

    // یکسان‌سازی بی‌نقص دو مقدار برای مقایسه (رشته به رشته)
    return String(currentUser.id).trim() === String(ownerId).trim();
}

// =========================
// مقدار امن عددی
// =========================

function toSafeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

// =========================
// Escape ساده برای HTML
// =========================

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================
// Loading جدول
// =========================

function showTableLoading() {
    const tableBody = document.getElementById("experienceTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                در حال دریافت اطلاعات...
            </td>
        </tr>
    `;
}

// =========================
// ساخت ستاره‌ها
// =========================

function buildStars(rating) {
    const safeRating = Math.max(0, Math.min(5, toSafeNumber(rating, 0)));
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        stars += i <= safeRating ? "⭐" : "☆";
    }

    return stars;
}

// =========================
// ساخت ردیف جدول
// =========================

function buildExperienceRow(exp) {
    const isOwner = isExperienceOwner(exp);

    const expId = exp?.id;
    const title = escapeHtml(exp?.title || "-");
    const companyName = escapeHtml(exp?.companyName || "-");
    const rating = toSafeNumber(exp?.rating, 0);
    const startDate = escapeHtml(exp?.startDate || "-");
    const endDate = escapeHtml(exp?.endDate || "-");

    // ---------- Like ----------
    let liked = false;
    try {
        liked = JSON.parse(localStorage.getItem(`exp_liked_${expId}`)) || false;
    } catch {
        liked = false;
    }

    let likeCount = parseInt(localStorage.getItem(`exp_like_count_${expId}`));
    if (Number.isNaN(likeCount)) {
        likeCount = exp?.likesCount ?? 10;
        localStorage.setItem(`exp_like_count_${expId}`, String(likeCount));
    }

    const likeIcon = liked ? "favorite" : "favorite_border";
    const likeClass = liked ? "btn-icon liked" : "btn-icon";

    // ---------- Save ----------
    let saved = false;
    try {
        saved = JSON.parse(localStorage.getItem(`exp_saved_${expId}`)) || false;
    } catch {
        saved = false;
    }

    const saveIcon = saved ? "bookmark" : "bookmark_border";
    const saveClass = saved ? "btn-icon saved" : "btn-icon";

    // ---------- Edit Button ----------
    const editButton = isOwner
        ? `
            <button
                type="button"
                class="btn btn-primary"
                onclick="goToEdit('${String(expId)}')">
                ویرایش
            </button>
        `
        : "";

    return `
        <tr>
            <td style="font-weight:700;color:var(--text-main);">
                ${title}
            </td>

            <td>
                ${companyName}
            </td>

            <td>
                <span class="badge" title="${rating} از 5">
                    ${buildStars(rating)} ${rating}
                </span>
            </td>

            <td style="color:var(--text-muted);font-size:13px;">
                ${startDate} تا ${endDate}
            </td>

            <td>
                <div class="actions-wrapper">
                    <a class="btn btn-view"
                       href="experience-details.html?id=${encodeURIComponent(expId)}">
                       مشاهده
                    </a>

                    ${editButton}
                </div>
            </td>

            <td>
                <div class="interact-wrapper">
                    <button
                        type="button"
                        class="${likeClass}"
                        onclick="toggleLike(this, '${expId}')">

                        <span class="material-icons-outlined" style="font-size:20px;">
                            ${likeIcon}
                        </span>

                        <span class="like-count">
                            ${likeCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        class="${saveClass}"
                        onclick="toggleSave(this, '${expId}')">

                        <span class="material-icons-outlined" style="font-size:20px;">
                            ${saveIcon}
                        </span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// =========================
// آپدیت تعداد نتایج
// =========================

function updateResultCount(count) {
    const resultCount = document.getElementById("resultCount");

    if (resultCount) {
        resultCount.innerText = `${count} تجربه یافت شد`;
    }
}

// =========================
// لود تجربه‌ها
// =========================

async function loadExperiences() {
    const tableBody = document.getElementById("experienceTableBody");

    if (!tableBody) return;

    showTableLoading();

    try {
        const titleFilter = document.getElementById("filterTitle")?.value.trim().toLowerCase() || "";
        const ratingFilter = document.getElementById("filterRating")?.value || "";
        const companyFilter = document.getElementById("filterCompany")?.value.trim().toLowerCase() || "";

        const response = await fetch(EXPERIENCES_API, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const list = await response.json();

        if (!Array.isArray(list)) {
            throw new Error("Invalid API response. Expected array.");
        }

        let filtered = [...list];

        if (titleFilter) {
            filtered = filtered.filter(exp =>
                String(exp?.title || "").toLowerCase().includes(titleFilter)
            );
        }

        if (companyFilter) {
            filtered = filtered.filter(exp =>
                String(exp?.companyName || "").toLowerCase().includes(companyFilter)
            );
        }

        if (ratingFilter) {
            const minRating = parseInt(ratingFilter);
            filtered = filtered.filter(exp =>
                toSafeNumber(exp?.rating, 0) >= minRating
            );
        }

        tableBody.innerHTML = "";

        updateResultCount(filtered.length);

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        هیچ تجربه‌ای یافت نشد
                    </td>
                </tr>
            `;
            return;
        }

        const rows = filtered.map(exp => buildExperienceRow(exp));
        tableBody.innerHTML = rows.join("");

    } catch (error) {
        console.error("LOAD EXPERIENCES ERROR:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    خطا در دریافت اطلاعات از سرور
                </td>
            </tr>
        `;

        updateResultCount(0);
        showMessage("مشکل در ارتباط با سرور", "error");
    }
}

// =========================
// ویرایش تجربه
// =========================

function goToEdit(expId) {
    const user = getCurrentUser();

    if (!user) {
        showMessage("برای ویرایش ابتدا باید وارد حساب کاربری شوید", "error");
        return;
    }

    window.location.href = `edit.html?id=${encodeURIComponent(expId)}`;
}

// =========================
// سیستم لایک و ذخیره
// =========================

function toggleLike(element, id) {
    const icon = element.querySelector(".material-icons-outlined");
    const countSpan = element.querySelector(".like-count");

    if (!icon || !countSpan) return;

    let currentLikes = parseInt(countSpan.innerText);
    if (Number.isNaN(currentLikes)) currentLikes = 0;

    const isLiked = element.classList.contains("liked");

    if (isLiked) {
        element.classList.remove("liked");
        icon.innerText = "favorite_border";
        currentLikes = Math.max(0, currentLikes - 1);
        localStorage.setItem(`exp_liked_${id}`, JSON.stringify(false));
    } else {
        element.classList.add("liked");
        icon.innerText = "favorite";
        currentLikes++;
        localStorage.setItem(`exp_liked_${id}`, JSON.stringify(true));
    }

    countSpan.innerText = currentLikes;
    localStorage.setItem(`exp_like_count_${id}`, String(currentLikes));
}

function toggleSave(element, id) {
    const icon = element.querySelector(".material-icons-outlined");

    if (!icon) return;

    const isSaved = element.classList.contains("saved");

    if (isSaved) {
        element.classList.remove("saved");
        icon.innerText = "bookmark_border";
        localStorage.setItem(`exp_saved_${id}`, JSON.stringify(false));
        showMessage("از ذخیره‌ها حذف شد", "info");
    } else {
        element.classList.add("saved");
        icon.innerText = "bookmark";
        localStorage.setItem(`exp_saved_${id}`, JSON.stringify(true));
        showMessage("تجربه ذخیره شد", "success");
    }
}

// =========================
// دکمه‌های فیلتر
// =========================

function initFilterEvents() {
    document
        .getElementById("applyFiltersBtn")
        ?.addEventListener("click", loadExperiences);

    document
        .getElementById("clearFiltersBtn")
        ?.addEventListener("click", () => {
            const filterTitle = document.getElementById("filterTitle");
            const filterRating = document.getElementById("filterRating");
            const filterCompany = document.getElementById("filterCompany");

            if (filterTitle) filterTitle.value = "";
            if (filterRating) filterRating.value = "";
            if (filterCompany) filterCompany.value = "";

            loadExperiences();
        });
}

// =========================
// اجرای اولیه صفحه
// =========================

document.addEventListener("DOMContentLoaded", () => {
    initFilterEvents();
    loadExperiences();
});