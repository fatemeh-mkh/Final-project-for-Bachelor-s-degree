package com.example.Internship.Service;

import com.example.Internship.DTO.CompanyProfileDTO;
import com.example.Internship.DTO.DashboardStatsDTO;
import com.example.Internship.Entity.ApplicantStatus;
import com.example.Internship.Entity.Company;
import com.example.Internship.Entity.CompanyStatus;
import com.example.Internship.Repository.ApplicantRepository;
import com.example.Internship.Repository.CompanyRepository;
import com.example.Internship.Repository.JobAdvertisementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional // تراکنش‌ها را برای تمام متدهای این سرویس فعال می‌کند
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobAdvertisementRepository jobAdvertisementRepository;
    private final ApplicantRepository applicantRepository;

    // =========================
    // گرفتن Company با id
    // =========================
    @Transactional(readOnly = true)
    public Company getCompanyById(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("شرکت با این شناسه پیدا نشد: " + companyId));
    }

    // =========================
    // گرفتن Company با userId (شرکت لاگین شده)
    // =========================
    @Transactional(readOnly = true)
    public Company getCompanyByUserId(Long userId) {
        // --- اصلاح شده: استفاده مستقیم از متد findByUserId که با @Query پیاده‌سازی شده ---
        // دیگر نیازی به map و cast کردن نیست چون Optional<Company> برمی‌گرداند.
        return companyRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("برای این کاربر هیچ شرکتی ثبت نشده است."));
        // --------------------------------------------------------------------------
    }

    // =========================
    // تبدیل Entity به DTO
    // =========================
    @Transactional(readOnly = true)
    public CompanyProfileDTO mapToProfileDTO(Company company) {
        // این متد به نظر درست می‌رسد و نیازی به تغییر ندارد.
        CompanyProfileDTO dto = new CompanyProfileDTO();

        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setIndustry(company.getIndustry());
        dto.setLocation(company.getLocation());
        dto.setWebsite(company.getWebsite());

        dto.setAbout(company.getAbout());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setCoverUrl(company.getCoverUrl());
        dto.setEmail(company.getEmail());
        dto.setPhone(company.getPhone());
        dto.setAddress(company.getAddress());
        dto.setFoundedYear(company.getFoundedYear());
        dto.setEmployeeCount(company.getEmployeeCount());

        return dto;
    }

    // =========================
    // دریافت پروفایل شرکت با id
    // =========================
    @Transactional(readOnly = true)
    public CompanyProfileDTO getCompanyProfileById(Long companyId) {
        Company company = getCompanyById(companyId);
        return mapToProfileDTO(company);
    }

    // =========================
    // دریافت پروفایل شرکت لاگین‌کرده
    // =========================
    @Transactional(readOnly = true)
    public CompanyProfileDTO getMyCompanyProfile(Long userId) {
        Company company = getCompanyByUserId(userId);
        return mapToProfileDTO(company);
    }

    // =========================
    // آپدیت پروفایل شرکت با companyId
    // =========================
    public CompanyProfileDTO updateCompanyProfile(Long companyId, CompanyProfileDTO dto) {
        Company company = getCompanyById(companyId); // ابتدا شرکت مورد نظر را پیدا می‌کنیم

        updateCompanyFields(company, dto); // فیلدها را آپدیت می‌کنیم

        Company updatedCompany = companyRepository.save(company); // ذخیره تغییرات
        return mapToProfileDTO(updatedCompany); // DTO آپدیت شده را برمی‌گردانیم
    }

    // =========================
    // آپدیت پروفایل شرکت لاگین‌کرده
    // =========================
    public CompanyProfileDTO updateMyCompanyProfile(Long userId, CompanyProfileDTO dto) {
        Company company = getCompanyByUserId(userId); // شرکت کاربر لاگین شده را پیدا می‌کنیم

        updateCompanyFields(company, dto); // فیلدها را آپدیت می‌کنیم

        Company updatedCompany = companyRepository.save(company); // ذخیره تغییرات
        return mapToProfileDTO(updatedCompany); // DTO آپدیت شده را برمی‌گردانیم
    }

    // =========================
    // آمار داشبورد شرکت لاگین شده
    // (وابسته به JobAdvertisement و Applicant)
    // =========================
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(Long userId) {
        Company company = getCompanyByUserId(userId);
        Long companyId = company.getId();

        // فرض می‌کنیم ریپازیتوری‌ها متدهای count را با پارامتر companyId دارند
        // این خطوط باید با متدهای واقعی در JobAdvertisementRepository و ApplicantRepository مطابقت داشته باشند.
        long activeAds = jobAdvertisementRepository.countByCompanyIdAndActiveTrue(companyId);
        long totalApplicants = applicantRepository.countByCompanyId(companyId);

        // استفاده از Enum برای وضعیت متقاضی
        long pendingReviews = applicantRepository.countByCompanyIdAndStatus(companyId, ApplicantStatus.PENDING);
        long accepted = applicantRepository.countByCompanyIdAndStatus(companyId, ApplicantStatus.ACCEPTED);

        return DashboardStatsDTO.builder()
                .activeAds(activeAds)
                .totalApplicants(totalApplicants)
                .pendingReviews(pendingReviews)
                .accepted(accepted)
                .messages(0) // این قسمت را می‌توانید بعداً با پیاده‌سازی چت تکمیل کنید
                .build();
    }

    // =========================
    // متد کمکی برای ست‌کردن فیلدها هنگام آپدیت
    // =========================
    private void updateCompanyFields(Company company, CompanyProfileDTO dto) {

        // نام شرکت (اگر خواستی قابل ویرایش نباشه، این بخش رو حذف کن یا شرط رو عوض کن)
        if (dto.getName() != null && !dto.getName().isBlank()) {
            // بررسی وجود نام مشابه *فقط اگر نام جدید با نام فعلی متفاوت است*
            // و اطمینان از وجود متد existsByName در CompanyRepository
            if (!company.getName().equalsIgnoreCase(dto.getName()) && companyRepository.existsByName(dto.getName())) {
                throw new RuntimeException("شرکتی با این نام قبلاً ثبت شده است.");
            }
            company.setName(dto.getName());
        }

        // بقیه فیلدها - فقط در صورتی که مقدارشان null یا خالی نباشد، آپدیت می‌شوند
        if (dto.getIndustry() != null && !dto.getIndustry().isBlank()) company.setIndustry(dto.getIndustry());
        if (dto.getLocation() != null && !dto.getLocation().isBlank()) company.setLocation(dto.getLocation());
        if (dto.getWebsite() != null && !dto.getWebsite().isBlank()) company.setWebsite(dto.getWebsite());
        if (dto.getAbout() != null && !dto.getAbout().isBlank()) company.setAbout(dto.getAbout());
        if (dto.getLogoUrl() != null && !dto.getLogoUrl().isBlank()) company.setLogoUrl(dto.getLogoUrl());
        if (dto.getCoverUrl() != null && !dto.getCoverUrl().isBlank()) company.setCoverUrl(dto.getCoverUrl());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) company.setEmail(dto.getEmail());
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) company.setPhone(dto.getPhone());
        if (dto.getAddress() != null && !dto.getAddress().isBlank()) company.setAddress(dto.getAddress());
        if (dto.getFoundedYear() != null) company.setFoundedYear(dto.getFoundedYear());
        if (dto.getEmployeeCount() != null) company.setEmployeeCount(dto.getEmployeeCount());
    }

    // =========================
    // پیاده‌سازی متدهای عمومی که در Controller فراخوانی می‌شوند
    // =========================

    @Transactional(readOnly = true)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Company> getApprovedCompanies() {
        // فرض می‌کنیم CompanyStatus.APPROVED وجود دارد و به معنی "تایید شده" است
        // اگر نام وضعیت متفاوت است، آن را جایگزین کنید.
        return companyRepository.findByStatus(CompanyStatus.APPROVED);
    }


    public Company saveCompany(Company company) {
        // بررسی مجدد برای نام شرکت قبل از ذخیره (فقط برای ایجاد جدید)
        // اگر company.getId() == null باشد، یعنی در حال ایجاد هستیم.
        if (company.getId() == null && company.getName() != null && companyRepository.existsByName(company.getName())) {
            throw new RuntimeException("شرکتی با این نام قبلاً ثبت شده است.");
        }
        return companyRepository.save(company);
    }
}
