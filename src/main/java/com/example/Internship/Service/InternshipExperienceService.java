package com.example.Internship.Service;

import com.example.Internship.DTO.ExperienceRequestDTO;
import com.example.Internship.DTO.ExperienceResponseDTO;
import com.example.Internship.Entity.Company;
import com.example.Internship.Entity.InternshipExperience;
import com.example.Internship.Entity.User;
import com.example.Internship.Mapper.InternshipExperienceMapper;
import com.example.Internship.Repository.CompanyRepository;
import com.example.Internship.Repository.InternshipExperienceRepository;
import com.example.Internship.Repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InternshipExperienceService {

    private final InternshipExperienceRepository experienceRepo;
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;

    public InternshipExperienceService(
            InternshipExperienceRepository experienceRepo,
            UserRepository userRepo,
            CompanyRepository companyRepo) {

        this.experienceRepo = experienceRepo;
        this.userRepo = userRepo;
        this.companyRepo = companyRepo;
    }

    // ---------------------------------------------------------
    //                      CREATE
    // ---------------------------------------------------------
    public ExperienceResponseDTO create(ExperienceRequestDTO dto, Long userId, Long companyId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        InternshipExperience exp = InternshipExperienceMapper.toEntity(dto);
        exp.setUser(user);
        exp.setCompany(company);

        InternshipExperience saved = experienceRepo.save(exp);
        return InternshipExperienceMapper.toDTO(saved);
    }

    // ---------------------------------------------------------
    //                      GET ALL
    // ---------------------------------------------------------
    public List<ExperienceResponseDTO> getAll() {
        return experienceRepo.findAll()
                .stream()
                .map(InternshipExperienceMapper::toDTO)
                .toList();
    }

    // ---------------------------------------------------------
    //                     GET BY ID  (مهم‌ترین بخش)
    // ---------------------------------------------------------
    public ExperienceResponseDTO getById(Long id) {
        InternshipExperience exp = experienceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
        return InternshipExperienceMapper.toDTO(exp);
    }

    // ---------------------------------------------------------
    //                 FILTER OPERATIONS
    // ---------------------------------------------------------
    public List<ExperienceResponseDTO> getByCompany(Long companyId) {
        return experienceRepo.findByCompanyId(companyId)
                .stream()
                .map(InternshipExperienceMapper::toDTO)
                .toList();
    }

    public List<ExperienceResponseDTO> getByUser(Long userId) {
        return experienceRepo.findByUserId(userId)
                .stream()
                .map(InternshipExperienceMapper::toDTO)
                .toList();
    }

    public List<ExperienceResponseDTO> getByRating(int rating) {
        return experienceRepo.findByRating(rating)
                .stream()
                .map(InternshipExperienceMapper::toDTO)
                .toList();
    }

    public List<ExperienceResponseDTO> getByStartDateAfter(LocalDate date) {
        return experienceRepo.findByStartDateAfter(date)
                .stream()
                .map(InternshipExperienceMapper::toDTO)
                .toList();
    }

    // ---------------------------------------------------------
    //                      PAGINATION
    // ---------------------------------------------------------
    public Page<ExperienceResponseDTO> getPaginated(int page, int size) {
        return experienceRepo.findAll(PageRequest.of(page, size))
                .map(InternshipExperienceMapper::toDTO);
    }

    // ---------------------------------------------------------
    //                      UPDATE
    // ---------------------------------------------------------
    public ExperienceResponseDTO update(Long id, @Valid ExperienceRequestDTO dto, Long userId) {

        InternshipExperience existing = experienceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        // بررسی مالک تجربه
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to edit this experience");
        }

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setRating(dto.getRating());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());

        InternshipExperience updated = experienceRepo.save(existing);
        return InternshipExperienceMapper.toDTO(updated);
    }

    // ---------------------------------------------------------
    //                      DELETE
    // ---------------------------------------------------------
    public void delete(Long id) {

        if (!experienceRepo.existsById(id))
            throw new RuntimeException("Experience not found");

        experienceRepo.deleteById(id);
    }
}
