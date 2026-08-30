package com.example.Internship.Controller;

import com.example.Internship.DTO.CompanyProfileDTO;
import com.example.Internship.DTO.DashboardStatsDTO;
import com.example.Internship.Entity.Company;
import com.example.Internship.Security.SecurityUtils; // این را اضافه کنید
import com.example.Internship.Service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final SecurityUtils securityUtils; // این را اضافه کنید

    // =========================
    // عمومی
    // =========================

    // GET /api/companies
    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        // فراخوانی متد از سرویس
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    // GET /api/companies/approved (برای صفحه اصلی)
    @GetMapping("/approved")
    public ResponseEntity<List<Company>> getApprovedCompanies() {
        // فراخوانی متد از سرویس
        return ResponseEntity.ok(companyService.getApprovedCompanies());
    }

    // POST /api/companies
    @PostMapping
    public ResponseEntity<?> createCompany(@Valid @RequestBody Company company) {
        try {
            // فراخوانی متد از سرویس
            Company savedCompany = companyService.saveCompany(company);
            return ResponseEntity.ok(savedCompany);
        } catch (RuntimeException e) {
            // مدیریت خطا در صورت وجود نام تکراری یا مشکل دیگر
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/companies/{id} (برای صفحه جزئیات شرکت)
    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyProfileById(@PathVariable Long id) {
        try {
            CompanyProfileDTO dto = companyService.getCompanyProfileById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            // مدیریت خطا در صورت عدم یافتن شرکت
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================
    // شرکت لاگین شده (me)
    // =========================

    // GET /api/companies/me/dashboard-stats
    @GetMapping("/me/dashboard-stats")
    public ResponseEntity<DashboardStatsDTO> getMyDashboardStats() {
        // userId را از SecurityContext می‌گیریم
        Long userId = securityUtils.getCurrentUserId();
        // فراخوانی متد مربوطه در سرویس
        return ResponseEntity.ok(companyService.getDashboardStats(userId));
    }

    // GET /api/companies/me/profile
    @GetMapping("/me/profile")
    public ResponseEntity<CompanyProfileDTO> getMyCompanyProfile() {
        // userId را از SecurityContext می‌گیریم
        Long userId = securityUtils.getCurrentUserId();
        // فراخوانی متد مربوطه در سرویس
        return ResponseEntity.ok(companyService.getMyCompanyProfile(userId));
    }

    // PUT /api/companies/me/profile
    @PutMapping("/me/profile")
    public ResponseEntity<CompanyProfileDTO> updateMyCompanyProfile(@Valid @RequestBody CompanyProfileDTO dto) {
        // userId را از SecurityContext می‌گیریم
        Long userId = securityUtils.getCurrentUserId();
        // companyId را از userId استخراج می‌کنیم و سپس پروفایل را آپدیت می‌کنیم
        return ResponseEntity.ok(companyService.updateMyCompanyProfile(userId, dto));
    }
}
