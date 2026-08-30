package com.example.Internship.Controller;

import com.example.Internship.DTO.JobAdvertisementCreateUpdateDTO;
import com.example.Internship.DTO.JobAdvertisementDTO;
import com.example.Internship.Security.SecurityUtils;
import com.example.Internship.Service.JobAdvertisementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobAdvertisementController {

    private final JobAdvertisementService jobAdvertisementService;
    private final SecurityUtils securityUtils;

    // ==============================
    // پنل کارفرما
    // ==============================

    @GetMapping("/api/company/jobs")
    public ResponseEntity<List<JobAdvertisementDTO>> getMyJobs() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(jobAdvertisementService.getMyJobs(userId));
    }

    @GetMapping("/api/company/jobs/{jobId}")
    public ResponseEntity<JobAdvertisementDTO> getMyJobById(@PathVariable Long jobId) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(jobAdvertisementService.getMyJobById(userId, jobId));
    }

    @PostMapping("/api/company/jobs")
    public ResponseEntity<JobAdvertisementDTO> createJob(@RequestBody JobAdvertisementCreateUpdateDTO dto) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(jobAdvertisementService.createJob(userId, dto));
    }

    @PutMapping("/api/company/jobs/{jobId}")
    public ResponseEntity<JobAdvertisementDTO> updateJob(@PathVariable Long jobId,
                                                         @RequestBody JobAdvertisementCreateUpdateDTO dto) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(jobAdvertisementService.updateJob(userId, jobId, dto));
    }

    @DeleteMapping("/api/company/jobs/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId) {
        Long userId = securityUtils.getCurrentUserId();
        jobAdvertisementService.deleteJob(userId, jobId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/company/jobs/{jobId}/toggle-active")
    public ResponseEntity<JobAdvertisementDTO> toggleActive(@PathVariable Long jobId) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(jobAdvertisementService.toggleActive(userId, jobId));
    }

    // ==============================
    // endpoint عمومی
    // ==============================

    @GetMapping("/api/public/companies/{companyId}/jobs")
    public ResponseEntity<List<JobAdvertisementDTO>> getCompanyJobsPublic(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                jobAdvertisementService.getActiveJobsByCompanyId(companyId)
        );
    }
}
