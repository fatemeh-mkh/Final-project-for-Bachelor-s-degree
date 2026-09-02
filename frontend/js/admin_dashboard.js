/* ==========================================================================
   admin_dashboard.js — داشبورد ادمین
   نسخه اصلاح‌شده منطبق بر ساختار CompanyProfileDTO و پالت پرمیوم
   ========================================================================== */

const API_BASE = 'http://localhost:8080/api/admin';

// ─── JWT Helpers ─────────────────────────────────────────────────────────────

// دریافت توکن ادمین از localStorage
function getToken() {
    return localStorage.getItem('token');
}

// اضافه کردن JWT به هدر درخواست
function getAuthHeaders() {
    const token = getToken();

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// تبدیل JWT به Payload
function parseJwtPayload(token) {
    try {
        if (!token) return null;

        const base64Url = token.split('.')[1];
        const base64 = base64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);

    } catch (error) {
        console.error('JWT Parse Error:', error);
        return null;
    }
}

// بررسی لاگین بودن ادمین
function isAdminLoggedIn() {
    const token = getToken();

    if (!token) {
        return false;
    }

    const payload = parseJwtPayload(token);

    if (!payload) {
        return false;
    }

    const role = payload.role;

    return role === 'ADMIN';
}

// ─── State ────────────────────────────────────────────────────────────────────
let allCompanies  = [];
let currentFilter = 'all';
let currentSearch = '';

// ─── DOM References ───────────────────────────────────────────────────────────
const tbody          = document.getElementById('companies-tbody');
const statusFilter   = document.getElementById('status-filter');
const searchInput    = document.getElementById('search-company');
const modal          = document.getElementById('status-modal');
const modalName      = document.getElementById('modal-company-name');
const modalSelect    = document.getElementById('modal-new-status');
const modalSaveBtn   = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

let activeCompanyId = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // بررسی وجود توکن ادمین
    if (!isAdminLoggedIn()) {
        alert('لطفاً ابتدا وارد حساب ادمین شوید.');
        window.location.href = '/html/auth.html';
        return;
    }

    // دریافت همه شرکت‌ها بجای فقط لیست pending
    fetchCompanies();
    bindFilters();
    bindModal();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchCompanies() {
    setLoading(true);

    try {
        // آدرس از /companies/pending به /companies تغییر یافت تا همه استاتوس‌ها لود شوند
        const res = await fetch(`${API_BASE}/companies`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error(`خطای سرور: ${res.status}`);

        allCompanies = await res.json();
        renderTable();

    } catch (err) {
        showError("ارتباط با سرور برقرار نشد. مطمئن شوید Spring Boot روی پورت 8080 اجرا شده است.");
    }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderTable() {
    const filtered = applyFilters(allCompanies);

    // تعداد کل ستون‌های جدول بر اساس هدرهای شما
    // نام، صنعت، موقعیت، وب‌سایت، ایمیل، وضعیت، عملیات
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">هیچ شرکتی یافت نشد.</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(company => `
        <tr data-id="${company.id}">
            <td><strong>${escapeHtml(company.name ?? '—')}</strong></td>
            <td>${escapeHtml(company.industry ?? '—')}</td>
            <td>${escapeHtml(company.location ?? '—')}</td>
            <td>
                ${company.website ? `<a href="${escapeHtml(company.website)}" target="_blank" style="color: var(--burnt-sienna); text-decoration: underline;">مشاهده سایت</a>` : '—'}
            </td>
            <td>${escapeHtml(company.email ?? '—')}</td>
            <td>
                <span class="status ${statusClass(company.status)}">
                    ${statusLabel(company.status)}
                </span>
            </td>
            <td>
                <div class="actions">
                    ${company.status !== 'APPROVED' ? `
                        <button class="btn-approve" onclick="handleApprove(${company.id})">✔ تایید</button>
                    ` : ''}
                    ${company.status !== 'REJECTED' ? `
                        <button class="btn-delete" onclick="handleReject(${company.id})">✘ رد</button>
                    ` : ''}
                    <button class="btn-status" onclick="openStatusModal(${company.id}, '${escapeHtml(company.name ?? '')}', '${company.status}')">
                        ⚙ وضعیت
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function applyFilters(list) {
    return list.filter(c => {

        // تبدیل وضعیت دیتابیس به حروف کوچک جهت هماهنگی با value آپشن‌های HTML
        const matchStatus = currentFilter === 'all'
            || c.status?.toLowerCase() === currentFilter.toLowerCase();

        const search = currentSearch.toLowerCase();

        // جستجو بر اساس فیلدهای مستقیم CompanyProfileDTO انجام می‌شود
        const matchSearch = !search
            || c.name?.toLowerCase().includes(search)
            || c.industry?.toLowerCase().includes(search)
            || c.location?.toLowerCase().includes(search)
            || c.email?.toLowerCase().includes(search);

        return matchStatus && matchSearch;
    });
}

function bindFilters() {

    statusFilter?.addEventListener('change', e => {
        currentFilter = e.target.value;
        renderTable();
    });

    searchInput?.addEventListener('input', e => {
        currentSearch = e.target.value.trim();
        renderTable();
    });
}

// ─── Actions ──────────────────────────────────────────────────────────────────
async function handleApprove(id) {

    if (!confirm('آیا از تایید این شرکت مطمئن هستید؟')) return;

    await changeStatus(
        id,
        'approve',
        'APPROVED',
        'شرکت با موفقیت تایید شد.'
    );
}

async function handleReject(id) {

    if (!confirm('آیا از رد این شرکت مطمئن هستید؟')) return;

    await changeStatus(
        id,
        'reject',
        'REJECTED',
        'شرکت رد شد.'
    );
}

async function changeStatus(id, action, newStatus, successMsg) {

    try {

        const res = await fetch(
            `${API_BASE}/companies/${id}/${action}`,
            {
                method: 'PUT',
                headers: getAuthHeaders()
            }
        );

        if (!res.ok) throw new Error(`خطا: ${res.status}`);

        updateLocalStatus(id, newStatus);
        renderTable();

        showToast(
            successMsg,
            newStatus === 'APPROVED' ? 'success' : 'error'
        );

    } catch (err) {

        showToast(err.message, 'error');
    }
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openStatusModal(id, name, currentStatus) {

    activeCompanyId = id;

    modalName.textContent = name;

    modalSelect.value = currentStatus
        ? currentStatus.toLowerCase()
        : 'pending';

    modal.removeAttribute('hidden');
}

function closeModal() {

    modal.setAttribute('hidden', '');
    activeCompanyId = null;
}

function bindModal() {

    modalCancelBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    modalSaveBtn?.addEventListener('click', async () => {

        if (!activeCompanyId) return;

        const newStatus = modalSelect.value;

        if (newStatus === 'pending') {

            showToast(
                'تغییر به "در انتظار" از طریق API پشتیبانی نمی‌شود.',
                'error'
            );

            return;
        }

        const label =
            newStatus === 'approved'
                ? 'APPROVED'
                : 'REJECTED';

        const msg =
            newStatus === 'approved'
                ? 'شرکت تایید شد.'
                : 'شرکت رد شد.';

        // هماهنگ‌سازی اکشن با پث متدهای PUT بک‌اند
        const apiAction =
            newStatus === 'approved'
                ? 'approve'
                : 'reject';

        await changeStatus(
            activeCompanyId,
            apiAction,
            label,
            msg
        );

        closeModal();
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function updateLocalStatus(id, newStatus) {

    const company = allCompanies.find(
        c => c.id === id
    );

    if (company) {
        company.status = newStatus;
    }
}

function setLoading(active) {

    if (active) {

        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">
                    در حال بارگیری اطلاعات شرکت‌ها...
                </td>
            </tr>`;
    }
}

// ساختار خروجی HTML هدرهای جدول شما:
// نام شرکت | صنعت | موقعیت مکانی | وب‌سایت | ایمیل | وضعیت | عملیات
function showError(message) {

    tbody.innerHTML = `
        <tr class="loading-row">
            <td colspan="7" style="color: var(--burnt-sienna);">
                ⚠ ${escapeHtml(message)}
            </td>
        </tr>`;
}

function statusClass(status) {

    if (!status) return '';

    return {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        SUSPENDED: 'suspended'
    }[status.toUpperCase()] ?? '';
}

function statusLabel(status) {

    if (!status) return '—';

    return {
        PENDING: 'در انتظار تایید',
        APPROVED: 'تایید شده',
        REJECTED: 'رد شده',
        SUSPENDED: 'مسدود'
    }[status.toUpperCase()] ?? status;
}

function escapeHtml(str) {

    if (!str) return '';

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {

    document.querySelector('.admin-toast')?.remove();

    const toast = document.createElement('div');

    toast.className = 'admin-toast';
    toast.textContent = message;

    Object.assign(toast.style, {

        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '0.85rem 1.75rem',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'inherit',
        fontWeight: '700',
        fontSize: '0.9rem',
        zIndex: '9999',
        boxShadow: 'var(--shadow-md)',
        opacity: '1',
        transition: 'opacity 0.4s ease',
        background:
            type === 'success'
                ? 'var(--text-main)'
                : 'var(--burnt-sienna)',
        color: '#fff',
    });

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = '0';

        setTimeout(() => toast.remove(), 400);

    }, 3000);
}