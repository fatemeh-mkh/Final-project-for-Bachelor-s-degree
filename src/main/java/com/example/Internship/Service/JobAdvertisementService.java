package com.example.Internship.Service;

import com.example.Internship.DTO.JobAdvertisementCreateUpdateDTO;
import com.example.Internship.DTO.JobAdvertisementDTO;
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
public class JobAdvertisementService {

    private final JobAdvertisementRepository jobAdvertisementRepository;
    private final ApplicantRepository applicantRepository;
    private final CompanyService companyService;

    // =========================================================
    // Utility
    // =========================================================

    @Transactional(readOnly = true)
    public JobAdvertisement getJobByIdAndCompanyId(Long jobId, Long companyId) {
        return jobAdvertisementRepository.findByIdAndCompanyId(jobId, companyId)
                .orElseThrow(() -> new RuntimeException("آگهی موردنظر پیدا نشد."));
    }

    private String convertSkillsListToString(List<String> skills) {
        return skills != null && !skills.isEmpty()
                ? String.join(",", skills)
                : "";
    }

    // =========================================================
    // Mapping
    // =========================================================

    @Transactional(readOnly = true)
    public JobAdvertisementDTO mapToDTO(JobAdvertisement job) {

        long applicantCount =
                applicantRepository.countByJobAdvertisementId(job.getId());

        return JobAdvertisementDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .skills(job.getSkills() != null ? job.getSkills() : "")
                .benefits(job.getBenefits())
                .duration(job.getDuration())
                .active(job.getActive())
                .companyId(job.getCompany().getId())   // ✅ خیلی مهم برای فرانت
                .applicantCount(applicantCount)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    // =========================================================
    // Company Panel (نیاز به لاگین)
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobAdvertisementDTO> getMyJobs(Long userId) {

        Company company = companyService.getCompanyByUserId(userId);

        return jobAdvertisementRepository
                .findByCompanyIdOrderByCreatedAtDesc(company.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobAdvertisementDTO getMyJobById(Long userId, Long jobId) {

        Company company = companyService.getCompanyByUserId(userId);

        JobAdvertisement job =
                getJobByIdAndCompanyId(jobId, company.getId());

        return mapToDTO(job);
    }

    // =========================================================
    // Create
    // =========================================================

    public JobAdvertisementDTO createJob(Long userId,
                                         JobAdvertisementCreateUpdateDTO dto) {

        Company company = companyService.getCompanyByUserId(userId);

        JobAdvertisement job = JobAdvertisement.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .skills(convertSkillsListToString(dto.getSkills()))
                .benefits(dto.getBenefits())
                .duration(dto.getDuration())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .company(company)
                .build();

        return mapToDTO(jobAdvertisementRepository.save(job));
    }

    // =========================================================
    // Update
    // =========================================================

    public JobAdvertisementDTO updateJob(Long userId,
                                         Long jobId,
                                         JobAdvertisementCreateUpdateDTO dto) {

        Company company = companyService.getCompanyByUserId(userId);

        JobAdvertisement job =
                getJobByIdAndCompanyId(jobId, company.getId());

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setSkills(convertSkillsListToString(dto.getSkills()));
        job.setBenefits(dto.getBenefits());
        job.setDuration(dto.getDuration());

        if (dto.getActive() != null) {
            job.setActive(dto.getActive());
        }

        return mapToDTO(jobAdvertisementRepository.save(job));
    }

    // =========================================================
    // Delete
    // =========================================================

    public void deleteJob(Long userId, Long jobId) {

        Company company = companyService.getCompanyByUserId(userId);

        JobAdvertisement job =
                getJobByIdAndCompanyId(jobId, company.getId());

        jobAdvertisementRepository.delete(job);
    }

    // =========================================================
    // Toggle Active
    // =========================================================

    public JobAdvertisementDTO toggleActive(Long userId, Long jobId) {

        Company company = companyService.getCompanyByUserId(userId);

        JobAdvertisement job =
                getJobByIdAndCompanyId(jobId, company.getId());

        job.setActive(!job.getActive());

        return mapToDTO(jobAdvertisementRepository.save(job));
    }

    // =========================================================
    // ✅ Public (بدون لاگین)
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobAdvertisementDTO> getActiveJobsByCompanyId(Long companyId) {

        return jobAdvertisementRepository
                .findByCompanyIdAndActiveTrueOrderByCreatedAtDesc(companyId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
}
