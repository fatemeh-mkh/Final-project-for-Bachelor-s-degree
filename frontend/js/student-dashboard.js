/**
 * Student Dashboard Logic - Version 5.0
 * System: Internship Management
 *
 * تغییرات نسخه ۵.۰:
 *  - رفع فیلتر جستجوی فرصت‌های شغلی (قبلاً هیچ رویدادی به آن متصل نبود)
 *  - دکمه‌ی «مشاهده و درخواست» از کارت‌های پیشنهادی صفحه‌ی پیشخوان حذف شد
 *    (در صفحه‌ی «فرصت‌های شغلی» همچنان باقی مانده است)
 *  - جابه‌جایی بین تب‌ها اکنون فقط با کلاس CSS انجام می‌شود (بدون استایل اینلاین متناقض)
 *  - بخش «درخواست‌های من» (پیگیری وضعیت درخواست‌ها) کاملاً حذف شد؛
 *    چون endpoint متناظرش هنوز در بک‌اند پیاده‌سازی نشده بود و باعث می‌شد
 *    کاربر با خطای ۴۰۳ به‌طور ناخواسته logout شود. کارت‌های آماری پیشخوان
 *    اکنون فقط از داده‌ی واقعی و موجود (تعداد پیشنهادهای شغلی از
 *    /student/recommended-jobs و وضعیت تست MBTI از /student/profile) پر می‌شوند.
 */

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

// متغیرهای سراسری برای ذخیره مقادیر نهایی انتخاب شده در فرم مهارت/علاقه
let selectedSkills = [];
let selectedInterests = [];

// نگه‌داری توابع بروزرسانی UI مولتی‌سلکت
let updateSkillsUI = null;
let updateInterestsUI = null;

let mbtiAnswers = { EI: 0, SN: 0, TF: 0, JP: 0 };
let questionsData = [];

// داده‌ی خام پیشنهادهای شغلی (برای فیلتر جستجو در صفحه‌ی «فرصت‌های شغلی»)
let recommendedJobsData = [];

/* ==========================================================================
   0. ابزارهای کمکی
   ========================================================================== */

// تبدیل اعداد لاتین به ارقام فارسی برای هماهنگی بصری با بقیه‌ی رابط کاربری
function toPersianDigits(value) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(value).replace(/[0-9]/g, d => persianDigits[+d]);
}

/* ==========================================================================
   1. INITIALIZATION & LOCAL STORAGE INTEGRATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    if (!token || role !== "STUDENT") {
        console.error("Access Denied: Missing token or invalid role.");
        logout();
        return;
    }

    // راه‌اندازی تگ‌باکس‌های سفارشی
    updateSkillsUI = initCustomMultiSelect('skillsDropdown', 'selectedSkillsTags', 'انتخاب مهارت‌ها...', (tags) => {
        selectedSkills = tags;
        localStorage.setItem("user_skills", JSON.stringify(selectedSkills));
        updateSavedProfileDisplay();
    });

    updateInterestsUI = initCustomMultiSelect('interestsDropdown', 'selectedInterestsTags', 'انتخاب حوزه‌های علاقه...', (tags) => {
        selectedInterests = tags;
        localStorage.setItem("user_interests", JSON.stringify(selectedInterests));
        updateSavedProfileDisplay();
    });

    // خواندن مقادیر اولیه از LocalStorage قبل از پاسخ سرور
    loadFromLocalStorage();

    loadProfile();
    loadRecommendations();
    setCurrentDate();
});

// خواندن اطلاعات اولیه از LocalStorage
function loadFromLocalStorage() {
    const cachedSkills = localStorage.getItem("user_skills");
    const cachedInterests = localStorage.getItem("user_interests");

    if (cachedSkills && updateSkillsUI) {
        try {
            const arr = JSON.parse(cachedSkills);
            if (Array.isArray(arr) && arr.length > 0) updateSkillsUI(arr);
        } catch (e) { /* داده‌ی نامعتبر، نادیده گرفته می‌شود */ }
    }

    if (cachedInterests && updateInterestsUI) {
        try {
            const arr = JSON.parse(cachedInterests);
            if (Array.isArray(arr) && arr.length > 0) updateInterestsUI(arr);
        } catch (e) { /* داده‌ی نامعتبر، نادیده گرفته می‌شود */ }
    }
}

// بروزرسانی نمایش باکس اطلاعات ثبت‌شده در پایین فرم تست شخصیت
function updateSavedProfileDisplay() {
    const container = document.getElementById("savedProfileInfo");
    const skillsListEl = document.getElementById("savedSkillsList");
    const interestsListEl = document.getElementById("savedInterestsList");

    if (!container || !skillsListEl || !interestsListEl) return;

    if (selectedSkills.length === 0 && selectedInterests.length === 0) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    skillsListEl.innerHTML = selectedSkills.length > 0
        ? selectedSkills.map(s => `<span class="badge-tag">${s}</span>`).join(" ")
        : "<span style='color: #94a3b8;'>انتخاب نشده</span>";

    interestsListEl.innerHTML = selectedInterests.length > 0
        ? selectedInterests.map(i => `<span class="badge-tag interest">${i}</span>`).join(" ")
        : "<span style='color: #94a3b8;'>انتخاب نشده</span>";
}

function toggleDropdown(dropdownId) {
    document.querySelectorAll('.dropdown-list').forEach(el => {
        if (el.id !== dropdownId) el.classList.remove('show');
    });

    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle('show');
        const arrow = dropdown.parentElement.querySelector('.arrow-icon');
        if (arrow) {
            arrow.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.dropdown-list').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.arrow-icon').forEach(el => el.style.transform = 'rotate(0deg)');
    }
});

function initCustomMultiSelect(dropdownId, tagsContainerId, placeholderText, callback) {
    const dropdown = document.getElementById(dropdownId);
    const container = document.getElementById(tagsContainerId);
    if (!dropdown || !container) return () => {};

    let chosenValues = [];

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            const val = this.getAttribute('data-value');

            if (!chosenValues.includes(val)) {
                chosenValues.push(val);
                this.classList.add('selected');
            } else {
                chosenValues = chosenValues.filter(v => v !== val);
                this.classList.remove('selected');
            }

            renderTags();
            callback(chosenValues);
        });
    });

    function renderTags() {
        container.innerHTML = '';
        if (chosenValues.length === 0) {
            container.innerHTML = `<span class="placeholder">${placeholderText}</span>`;
            return;
        }

        chosenValues.forEach(val => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.innerHTML = `${val} <i class="fas fa-times" data-val="${val}"></i>`;

            tagEl.querySelector('i').addEventListener('click', function (e) {
                e.stopPropagation();
                const toRemove = this.getAttribute('data-val');
                chosenValues = chosenValues.filter(v => v !== toRemove);

                const dropItem = dropdown.querySelector(`.dropdown-item[data-value="${toRemove}"]`);
                if (dropItem) dropItem.classList.remove('selected');

                renderTags();
                callback(chosenValues);
            });

            container.appendChild(tagEl);
        });
    }

    return function setValues(valuesArray) {
        chosenValues = [...valuesArray];
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            const val = item.getAttribute('data-value');
            item.classList.toggle('selected', chosenValues.includes(val));
        });
        renderTags();
        callback(chosenValues);
    };
}

/* ==========================================================================
   2. LOAD PROFILE & PERSISTENT DATA
   ========================================================================== */
async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/student/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.status === 401 || res.status === 403) {
            logout();
            return;
        }

        const user = await res.json();

        const welcomeEl = document.getElementById("studentName");
        if (welcomeEl) welcomeEl.innerText = `خوش آمدید، ${user.name} عزیز`;

        const hasMbtiType = user.mbtiType && user.mbtiType !== "انجام نشده";

        const statusEl = document.getElementById("mbtiStatus");
        if (statusEl) {
            statusEl.innerText = hasMbtiType ? user.mbtiType : "تست انجام نشده";
            statusEl.className = hasMbtiType ? "status-badge" : "status-badge status-pending";
        }

        // کارت وضعیت تست شخصیت در پیشخوان
        const mbtiStatCard = document.getElementById("mbtiStatCard");
        const statMbtiStatus = document.getElementById("statMbtiStatus");
        if (statMbtiStatus) statMbtiStatus.innerText = hasMbtiType ? user.mbtiType : "انجام نشده";
        if (mbtiStatCard) {
            mbtiStatCard.classList.toggle("stat-success", hasMbtiType);
            mbtiStatCard.classList.toggle("stat-pending", !hasMbtiType);
        }

        if (user.studentSkills && updateSkillsUI) {
            const skillsArr = user.studentSkills.split(',').map(s => s.trim()).filter(Boolean);
            updateSkillsUI(skillsArr);
            localStorage.setItem("user_skills", JSON.stringify(skillsArr));
        }

        if (user.interests && updateInterestsUI) {
            const interestsArr = user.interests.split(',').map(i => i.trim()).filter(Boolean);
            updateInterestsUI(interestsArr);
            localStorage.setItem("user_interests", JSON.stringify(interestsArr));
        }

        updateSavedProfileDisplay();

    } catch (err) {
        console.error("Profile Load Error:", err);
    }
}

/* ==========================================================================
   3. SAVE DETAILS & QUIZ ENGINE — بخش تست شخصیت (بدون تغییر منطقی)
   ========================================================================== */
async function saveDetailsAndStartQuiz() {
    const container = document.getElementById("quizContainer");
    const intro = document.getElementById("testIntro");

    if (selectedSkills.length === 0 || selectedInterests.length === 0) {
        alert("لطفاً حداقل یک مهارت و یک حوزه کاری مورد علاقه را از منوهای کشویی انتخاب کنید.");
        return;
    }

    const skillsVal = selectedSkills.join(", ");
    const interestsVal = selectedInterests.join(", ");

    localStorage.setItem("user_skills", JSON.stringify(selectedSkills));
    localStorage.setItem("user_interests", JSON.stringify(selectedInterests));

    try {
        const detailsRes = await fetch(`${API_BASE}/student/update-profile-details`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                skills: skillsVal,
                interests: interestsVal
            })
        });

        if (!detailsRes.ok) throw new Error("خطا در ذخیره‌سازی اطلاعات تکمیلی پروفایل");

        container.innerHTML = "<div class='loader'>اطلاعات شما ذخیره شد. در حال بارگذاری تست...</div>";
        if (intro) intro.style.display = "none";
        container.style.display = "block";

        const res = await fetch(`${API_BASE}/student/personality/questions`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Could not fetch questions");

        questionsData = await res.json();
        renderQuestions();

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="error-box">
                <p>خطا در ارتباط با سرور. مطمئن شوید بک‌اِند اجرا شده است.</p>
                <button onclick="location.reload()" class="btn-secondary">تلاش مجدد</button>
            </div>`;
    }
}

function renderQuestions() {
    const container = document.getElementById("quizContainer");
    container.innerHTML = `
        <div class="quiz-header">
            <h3>تست شخصیت‌شناسی MBTI</h3>
            <p>لطفاً با دقت و بر اساس روحیات واقعی خود پاسخ دهید.</p>
        </div>
        <div id="questionsList"></div>
        <button id="submitMbtiBtn" class="btn-primary btn-block" style="margin-top: 30px; display: none;" onclick="submitQuiz()">
            ثبت نهایی و تحلیل شخصیت
        </button>
    `;

    const list = document.getElementById("questionsList");
    mbtiAnswers = { EI: 0, SN: 0, TF: 0, JP: 0 };

    questionsData.forEach((q, i) => {
        const qDiv = document.createElement("div");
        qDiv.className = "question-card";

        const optionsHtml = q.options.map(opt => `
            <button class="opt-btn" data-value="${opt.value}" onclick="selectOption(this, '${q.dimension}', ${opt.value})">
                ${opt.label}
            </button>
        `).join('');

        qDiv.innerHTML = `
            <p class="question-text"><strong>${i + 1}.</strong> ${q.text}</p>
            <div class="options-group" data-dimension="${q.dimension}">
                ${optionsHtml}
            </div>
        `;
        list.appendChild(qDiv);
    });
}

function selectOption(btn, dimension, value) {
    const parent = btn.parentElement;
    parent.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const answeredCount = document.querySelectorAll(".opt-btn.active").length;
    const submitBtn = document.getElementById("submitMbtiBtn");

    if (submitBtn && answeredCount === questionsData.length) {
        submitBtn.style.display = "block";
        submitBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

async function submitQuiz() {
    mbtiAnswers = { EI: 0, SN: 0, TF: 0, JP: 0 };

    document.querySelectorAll(".options-group").forEach(group => {
        const activeBtn = group.querySelector(".opt-btn.active");
        const dim = group.getAttribute("data-dimension");
        if (activeBtn) {
            const val = parseInt(activeBtn.getAttribute("data-value"), 10);
            mbtiAnswers[dim] += val;
        }
    });

    const finalType = calculateMBTI();
    const btn = document.getElementById("submitMbtiBtn");
    btn.disabled = true;
    btn.innerText = "در حال تحلیل...";

    try {
        const res = await fetch(`${API_BASE}/student/submit-test`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ type: finalType })
        });

        if (res.ok) {
            showResultUI(finalType);
            loadRecommendations();
            loadProfile();
        } else {
            throw new Error("Server error");
        }
    } catch (err) {
        alert("خطا در ثبت نتیجه. لطفاً دوباره تلاش کنید.");
        btn.disabled = false;
        btn.innerText = "ثبت نهایی و تحلیل شخصیت";
    }
}

function calculateMBTI() {
    return (mbtiAnswers.EI >= 0 ? "E" : "I") +
           (mbtiAnswers.SN >= 0 ? "S" : "N") +
           (mbtiAnswers.TF >= 0 ? "T" : "F") +
           (mbtiAnswers.JP >= 0 ? "J" : "P");
}

function showResultUI(type) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = `
        <div class="result-card animation-fadeIn">
            <div class="result-icon">🎯</div>
            <h4>تیپ شخصیتی شما: ${type}</h4>
            <p>تحلیل شخصیت شما همراه با فاکتورهای مهارت و علاقه‌مندی با موفقیت محاسبه شد.</p>
            <button onclick="showSection('jobs', document.querySelector('.nav-menu .nav-item:nth-child(2)'))" class="btn-primary">مشاهده پیشنهادات شغلی</button>
        </div>
    `;
}

/* ==========================================================================
   4. سیستم پیشنهاد فرصت‌های شغلی
   ========================================================================== */

// رندر یک کارت پیشنهاد شغلی. برای کارت‌های پیشخوان دکمه‌ی «مشاهده و درخواست»
// نمایش داده نمی‌شود؛ پیشخوان فقط یک نمای خلاصه است، درخواست از صفحه‌ی
// «فرصت‌های شغلی» انجام می‌شود.
function renderJobCard(item, options) {
    const showApplyButton = options && options.showApplyButton !== undefined ? options.showApplyButton : true;
    const job = item.job || {};
    const matchPercentage = item.matchPercentage || 0;

    let matchClass = "mid-match";
    if (matchPercentage >= 75) matchClass = "high-match";
    else if (matchPercentage < 50) matchClass = "";

    const companyName = job.company && job.company.name ? job.company.name : "شرکت متقاضی";
    const skillsHtml = job.skills
        ? job.skills.split(',').map(s => `<span>${s.trim()}</span>`).join('')
        : '<span>عمومی</span>';

        const buttonHtml = "";

    return `
        <div class="job-card-premium ${matchClass}">
            <div class="match-score">${toPersianDigits(matchPercentage)}% تطابق هوشمند</div>
            <div class="job-card-body">
                <h4>${job.title || "—"}</h4>
                <p class="comp-name"><i class="fas fa-building"></i> ${companyName}</p>
                <div class="job-tags">${skillsHtml}</div>
                ${buttonHtml}
            </div>
        </div>
    `;
}

// رندر گرید فرصت‌های شغلی صفحه‌ی «فرصت‌های شغلی» (با در نظر گرفتن فیلتر جستجو)
function renderJobsGrid(data) {
    const jobsGrid = document.getElementById("jobsJobOffersContainer");
    const emptyEl = document.getElementById("emptyJobOffers");
    if (!jobsGrid) return;

    if (!data || data.length === 0) {
        jobsGrid.innerHTML = "";
        if (emptyEl) emptyEl.style.display = "block";
        return;
    }

    if (emptyEl) emptyEl.style.display = "none";
    jobsGrid.innerHTML = data.map(item => renderJobCard(item, { showApplyButton: true })).join("");
}

// فیلتر جستجوی زنده روی عنوان شغل، نام شرکت و مهارت‌های موردنیاز
function filterJobs() {
    const input = document.getElementById("jobSearchInput");
    const query = input ? input.value.trim().toLowerCase() : "";

    if (!query) {
        renderJobsGrid(recommendedJobsData);
        return;
    }

    const filtered = recommendedJobsData.filter(item => {
        const job = item.job || {};
        const title = (job.title || "").toLowerCase();
        const company = (job.company && job.company.name ? job.company.name : "").toLowerCase();
        const skills = (job.skills || "").toLowerCase();
        return title.includes(query) || company.includes(query) || skills.includes(query);
    });

    renderJobsGrid(filtered);
}

async function loadRecommendations() {
    const overviewGrid = document.getElementById("overviewJobOffersContainer");
    const jobsGrid = document.getElementById("jobsJobOffersContainer");
    const resultGrid = document.getElementById("jobsGrid"); // مربوط به نتیجه‌ی تست شخصیت

    [overviewGrid, jobsGrid, resultGrid].forEach(grid => {
        if (grid) grid.innerHTML = "<div class='loader'>در حال محاسبۀ هوشمند بهترین فرصت‌ها...</div>";
    });

    // فیلتر جستجو با هر بارگذاری مجدد پاک می‌شود
    const searchInput = document.getElementById("jobSearchInput");
    if (searchInput) searchInput.value = "";

    try {
        const res = await fetch(`${API_BASE}/student/recommended-jobs`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            if (res.status === 400) {
                const errorMsg = await res.text();
                [overviewGrid, jobsGrid, resultGrid].forEach(grid => {
                    if (grid) grid.innerHTML = `<div class='no-data-notice'><p>${errorMsg}</p></div>`;
                });
                updateJobsCountStat(0);
                return;
            }
            throw new Error("Failed to load recommendations");
        }

        recommendedJobsData = await res.json();
        updateJobsCountStat(recommendedJobsData.length);

        // پیشخوان: فقط ۳ پیشنهاد برتر و بدون دکمه‌ی درخواست
        if (overviewGrid) {
            if (recommendedJobsData.length === 0) {
                overviewGrid.innerHTML = `<div class="no-data-notice"><p>هیچ پیشنهادی منطبق با مشخصات شما پیدا نشد.</p></div>`;
            } else {
                overviewGrid.innerHTML = recommendedJobsData
                    .slice(0, 3)
                    .map(item => renderJobCard(item, { showApplyButton: false }))
                    .join("");
            }
        }

        // صفحه‌ی فرصت‌های شغلی: همه‌ی پیشنهادها با دکمه‌ی درخواست
        renderJobsGrid(recommendedJobsData);

        // نتیجه‌ی تست شخصیت — بدون تغییر رفتار
        if (resultGrid) {
            if (recommendedJobsData.length === 0) {
                resultGrid.innerHTML = `<div class="no-data-notice"><p>هیچ پیشنهادی منطبق با مشخصات شما پیدا نشد.</p></div>`;
            } else {
                resultGrid.innerHTML = recommendedJobsData.map(item => renderJobCard(item, { showApplyButton: true })).join("");
            }
        }

    } catch (err) {
        console.error(err);
        [overviewGrid, jobsGrid, resultGrid].forEach(grid => {
            if (grid) grid.innerHTML = "<p class='error-text'>خطا در ارتباط با الگوریتم سیستم پیشنهادات.</p>";
        });
        updateJobsCountStat(0);
    }
}

// بروزرسانی کارت «پیشنهادهای شغلی» در پیشخوان — همیشه از تعداد واقعیِ
// پیشنهادهای دریافتی از /student/recommended-jobs گرفته می‌شود
function updateJobsCountStat(count) {
    const el = document.getElementById("statJobsCount");
    if (el) el.innerText = toPersianDigits(count);
}

/* ==========================================================================
   5. ناوبری بین سکشن‌ها و توابع عمومی
   ========================================================================== */
const SECTION_TITLES = {
    overview: "پیشخوان دانشجو",
    jobs: "فرصت‌های شغلی",
    personality: "تست شخصیت MBTI"
};

function showSection(sectionId, element) {
    // نمایش/عدم‌نمایش سکشن‌ها فقط از طریق کلاس CSS (هماهنگ با .content-section.active)
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    if (element) {
        element.classList.add('active');
    } else {
        document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${sectionId}'`)) {
                item.classList.add('active');
            }
        });
    }

    const titleEl = document.getElementById("sectionTitle");
    if (titleEl && SECTION_TITLES[sectionId]) titleEl.innerText = SECTION_TITLES[sectionId];

    if (sectionId === 'jobs' || sectionId === 'overview') loadRecommendations();
}

function logout() {
    localStorage.clear();
    window.location.href = "auth.html";
}

function setCurrentDate() {
    const el = document.getElementById("currentDate");
    if (el) {
        el.innerText = new Date().toLocaleDateString("fa-IR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function viewJobDetails(id) {
    alert("در حال انتقال به صفحه جزئیات آگهی...");
}
