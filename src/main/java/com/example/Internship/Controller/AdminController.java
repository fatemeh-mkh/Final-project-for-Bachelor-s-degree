package com.example.Internship.Controller;

import com.example.Internship.Entity.Company;
import com.example.Internship.Service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // دریافت لیست شرکت‌های در انتظار تایید
    @GetMapping("/companies/pending")
    public ResponseEntity<List<Company>> getPendingCompanies() {
        return ResponseEntity.ok(adminService.getPendingCompanies());
    }

    // تایید شرکت
    @PutMapping("/companies/{id}/approve")
    public ResponseEntity<Map<String, String>> approveCompany(@PathVariable Long id) {

        adminService.approveCompany(id);

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "Company approved successfully"
                )
        );
    }

    // رد شرکت
    @PutMapping("/companies/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectCompany(@PathVariable Long id) {

        adminService.rejectCompany(id);

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "Company rejected successfully"
                )
        );
    }
    // دریافت لیست تمام شرکت‌ها (با هر وضعیتی) برای داشبورد ادمین
    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(adminService.getAllCompanies());
    }
}
