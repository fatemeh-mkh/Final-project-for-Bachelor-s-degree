package com.example.Internship.Service;

import com.example.Internship.DTO.ApplicantDTO;
import com.example.Internship.DTO.ApplicantStatusUpdateDTO;
import com.example.Internship.DTO.PublicApplicantDTO;
import com.example.Internship.Entity.Applicant;
import com.example.Internship.Entity.Company;
import com.example.Internship.Entity.JobAdvertisement;
import com.example.Internship.Repository.ApplicantRepository;
import com.example.Internship.Repository.JobAdvertisementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicantService {

    private final ApplicantRepository applicantRepository;
    private final CompanyService companyService;
    private final JobAdvertisementRepository jobAdvertisementRepository;

    @Transactional(readOnly = true)
    public Applicant getApplicantByIdAndCompanyId(Long applicantId, Long companyId) {
        return applicantRepository.findByIdAndCompanyId(applicantId, companyId)
                .orElseThrow(() -> new RuntimeException("متقاضی موردنظر پیدا نشد."));
    }

    @Transactional(readOnly = true)
    public ApplicantDTO mapToDTO(Applicant applicant) {
        return ApplicantDTO.builder()
                .id(applicant.getId())
                .fullName(applicant.getFullName())
                .email(applicant.getEmail())
                .phone(applicant.getPhone())
                .status(applicant.getStatus())
                .note(applicant.getNote())
                .appliedAt(applicant.getAppliedAt())
                .jobAdvertisementId(applicant.getJobAdvertisement().getId())
                .jobTitle(applicant.getJobAdvertisement().getTitle())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApplicantDTO> getAllMyApplicants(Long userId) {
        Company company = companyService.getCompanyByUserId(userId);

        return applicantRepository.findByCompanyIdOrderByAppliedAtDesc(company.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicantDTO> getApplicantsByJob(Long userId, Long jobId) {
        Company company = companyService.getCompanyByUserId(userId);

        jobAdvertisementRepository.findByIdAndCompanyId(jobId, company.getId())
                .orElseThrow(() -> new RuntimeException("آگهی موردنظر پیدا نشد یا متعلق به این شرکت نیست."));

        return applicantRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ApplicantDTO updateApplicantStatus(Long userId, Long applicantId, ApplicantStatusUpdateDTO dto) {
        Company company = companyService.getCompanyByUserId(userId);
        Applicant applicant = getApplicantByIdAndCompanyId(applicantId, company.getId());

        if (dto.getStatus() != null) {
            applicant.setStatus(dto.getStatus());
        }

        applicant.setNote(dto.getNote());

        Applicant updated = applicantRepository.save(applicant);
        return mapToDTO(updated);
    }
    public ApplicantDTO applyPublic(PublicApplicantDTO publicApplicantDTO) {
        // پیدا کردن آگهی شغلی بر اساس jobId
        JobAdvertisement jobAdvertisement = jobAdvertisementRepository.findById(publicApplicantDTO.getJobId())
                .orElseThrow(() -> new RuntimeException("آگهی شغلی با شناسه " + publicApplicantDTO.getJobId() + " پیدا نشد."));

        // ساختن موجودیت Applicant از روی DTO
        Applicant applicant = Applicant.builder()
                .fullName(publicApplicantDTO.getFullName())
                .email(publicApplicantDTO.getEmail())
                // توجه: نام فیلد در DTO 'phoneNumber' ولی در Entity 'phone' است.
                .phone(publicApplicantDTO.getPhone())
                .coverLetter(publicApplicantDTO.getCoverLetter())
                // Status و appliedAt به صورت خودکار توسط @PrePersist تنظیم می‌شوند
                .jobAdvertisement(jobAdvertisement)
                .build();

        // ذخیره Applicant در دیتابیس
        Applicant savedApplicant = applicantRepository.save(applicant);

        // برگرداندن DTOی ساخته شده
        return mapToDTO(savedApplicant);
    }
}
