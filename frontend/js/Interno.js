/* ==========================================================================
   Interno.js — صفحه اصلی اینترنو
   ========================================================================== */

/* ==========================================================================
   ۱. آزمون شخصیت — چک ورود کاربر
   ========================================================================== */
   document.getElementById('startQuizBtn')?.addEventListener('click', () => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
        // کاربر وارد شده → رفتن به داشبورد قسمت آزمون
        window.location.href = 'student-dashboard.html#personality';
    } else {
        // نمایش toast
        const toast = document.getElementById('loginToast');
        if (!toast) return;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 5000);
    }
});

/* ==========================================================================
   ۲. اسلایدر شرکت‌ها
   ========================================================================== */

// لوگوهای placeholder تا زمانی که API اطلاعات شرکت واقعی برگردونه
const FALLBACK_LOGOS = [
    'https://logo.clearbit.com/digikala.com',
    'https://logo.clearbit.com/snapp.ir',
    'https://logo.clearbit.com/tapsi.ir',
    'https://logo.clearbit.com/cafe.bazaar.ir',
    'https://logo.clearbit.com/aparat.com',
];

function getCompanyLogo(company, index) {
    // اگر شرکت website داشت از clearbit بگیر، وگرنه fallback
    if (company.website) {
        try {
            const domain = new URL(company.website).hostname.replace('www.', '');
            return `https://logo.clearbit.com/${domain}`;
        } catch {}
    }
    return FALLBACK_LOGOS[index % FALLBACK_LOGOS.length];
}

function buildCompanyCard(company, index) {
    const logo = getCompanyLogo(company, index);
    return `
    <div class="company-card-item" data-id="${company.id}">
        <img
            class="company-logo-img"
            src="${logo}"
            alt="${company.name ?? 'شرکت'}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
            loading="lazy"
        >
        <div style="display:none;width:60px;height:60px;border-radius:10px;background:var(--haze);align-items:center;justify-content:center;color:var(--azure);font-size:22px;">
            <i class="fas fa-building"></i>
        </div>
        <h4>${company.name ?? 'بدون نام'}</h4>
        <span>${company.industry ?? 'تکنولوژی'}</span>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const slider = document.getElementById('companies-slider');
    const btnNext = document.getElementById('sliderNext');
    const btnPrev = document.getElementById('sliderPrev');

    if (!slider) return;

    try {
        const response = await fetch('http://localhost:8080/api/companies/approved');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const companies = await response.json();

        if (!companies || companies.length === 0) {
            slider.innerHTML = '<p class="loading-status">هنوز شرکتی ثبت نشده است.</p>';
            btnNext?.style && (btnNext.style.display = 'none');
            btnPrev?.style && (btnPrev.style.display = 'none');
            return;
        }

        slider.innerHTML = companies.map(buildCompanyCard).join('');

        // کلیک روی کارت
        slider.querySelectorAll('.company-card-item').forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = `company-details.html?id=${card.dataset.id}`;
            });
        });

        // ناوبری اسلایدر (RTL: next = scroll left, prev = scroll right)
        const scrollStep = 260;
        btnNext?.addEventListener('click', () => slider.scrollBy({ left: -scrollStep, behavior: 'smooth' }));
        btnPrev?.addEventListener('click', () => slider.scrollBy({ left: scrollStep, behavior: 'smooth' }));

        // پنهان‌کردن دکمه‌ها اگر محتوا کمتر از عرض اسلایدر باشه
        setTimeout(() => {
            if (slider.scrollWidth <= slider.clientWidth) {
                if (btnNext) btnNext.style.visibility = 'hidden';
                if (btnPrev) btnPrev.style.visibility = 'hidden';
            }
        }, 300);

    } catch (error) {
        console.error('[Slider Error]', error);
        slider.innerHTML = '<p class="loading-status">خطا در اتصال به سرور</p>';
        btnNext?.style && (btnNext.style.display = 'none');
        btnPrev?.style && (btnPrev.style.display = 'none');
    }
});