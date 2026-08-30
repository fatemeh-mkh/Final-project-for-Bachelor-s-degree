package com.example.Internship.Controller;

import com.example.Internship.DTO.ApplicantDTO;
import com.example.Internship.DTO.ApplicantStatusUpdateDTO;
import com.example.Internship.DTO.PublicApplicantDTO;
import com.example.Internship.Security.SecurityUtils;
import com.example.Internship.Service.ApplicantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService applicantService;
    private final SecurityUtils securityUtils;

    // ------------------------
    // Company APIs (نیاز به لاگین)
    // ------------------------

    @GetMapping("/api/company/applicants")
    public ResponseEntity<List<ApplicantDTO>> getAllMyApplicants() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(applicantService.getAllMyApplicants(userId));
    }

    @GetMapping("/api/company/applicants/job/{jobId}")
    public ResponseEntity<List<ApplicantDTO>> getApplicantsByJob(@PathVariable Long jobId) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(applicantService.getApplicantsByJob(userId, jobId));
    }

    @PatchMapping("/api/company/applicants/{applicantId}/status")
    public ResponseEntity<ApplicantDTO> updateApplicantStatus(
            @PathVariable Long applicantId,
            @RequestBody ApplicantStatusUpdateDTO dto) {

        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(
                applicantService.updateApplicantStatus(userId, applicantId, dto)
        );
    }

    // ------------------------
    // Public API (بدون لاگین)
    // ------------------------

    // مسیر نهایی:
    // POST /api/public/applicants/apply
    @PostMapping("/api/public/applicants/apply")
    public ResponseEntity<ApplicantDTO> applyForJob(@RequestBody PublicApplicantDTO applicantDTO) {

        try {
            ApplicantDTO createdApplicant = applicantService.applyPublic(applicantDTO);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdApplicant);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(null);
        }
    }
}
