package com.example.Internship.Service;

import com.example.Internship.Entity.Company;
import com.example.Internship.Entity.CompanyStatus;
import com.example.Internship.Repository.CompanyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // برای لاگ کردن عملیات حساس
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j // فعال‌سازی لاگر
public class AdminService {

    private final CompanyRepository companyRepository;

    /**
     * واکشی تمام شرکت‌هایی که در وضعیت PENDING هستند.
     * این متد برای داشبورد ادمین حیاتی است.
     */
    public List<Company> getPendingCompanies() {
        log.info("Fetching all pending companies for admin review.");
        return companyRepository.findByStatus(CompanyStatus.PENDING);
    }

    /**
     * تایید یک شرکت.
     * استفاده از @Transactional تضمین می‌کند که اتمیسیته (Atomicity) رعایت شود.
     */
    @Transactional
    public void approveCompany(Long companyId) {
        Company company = findCompanyById(companyId);

        // جلوگیری از تغییر وضعیت اگر قبلاً تایید شده باشد
        if (company.getStatus() == CompanyStatus.APPROVED) {
            log.warn("Attempted to approve an already approved company: ID {}", companyId);
            return;
        }

        company.setStatus(CompanyStatus.APPROVED);

        // نکته فنی: اگر در User Entity هم فیلد enabled دارید، اینجا می‌توانید آن را true کنید.
        if (company.getUser() != null) {
            company.getUser().setEnabled(true);
        }

        companyRepository.save(company);
        log.info("Company with ID {} has been APPROVED.", companyId);
    }

    /**
     * رد یک شرکت.
     */
    @Transactional
    public void rejectCompany(Long companyId) {
        Company company = findCompanyById(companyId);

        company.setStatus(CompanyStatus.REJECTED);

        // در صورت رد شدن، دسترسی لاگین کاربر مرتبط را هم می‌بندیم (اختیاری اما منطقی)
        if (company.getUser() != null) {
            company.getUser().setEnabled(false);
        }

        companyRepository.save(company);
        log.info("Company with ID {} has been REJECTED.", companyId);
    }

    /**
     * متد کمکی داخلی برای جلوگیری از تکرار کد (DRY - Don't Repeat Yourself)
     */
    private Company findCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Company not found with ID: {}", id);
                    return new RuntimeException("Error: Company with ID " + id + " not found.");
                });
    }
    /**
     * واکشی تمام شرکت‌ها بدون فیلتر وضعیت
     */
    public List<Company> getAllCompanies() {
        log.info("Fetching all companies for admin review.");
        return companyRepository.findAll(); // همه شرکت‌ها را برمی‌گرداند
    }

}
