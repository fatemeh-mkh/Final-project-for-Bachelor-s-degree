package com.example.Internship.Mapper;

import com.example.Internship.DTO.ExperienceRequestDTO;
import com.example.Internship.DTO.ExperienceResponseDTO;
import com.example.Internship.Entity.InternshipExperience;

public class InternshipExperienceMapper {

    public static InternshipExperience toEntity(ExperienceRequestDTO dto) {
        InternshipExperience exp = new InternshipExperience();
        exp.setTitle(dto.getTitle());
        exp.setDescription(dto.getDescription());
        exp.setRating(dto.getRating());
        exp.setStartDate(dto.getStartDate());
        exp.setEndDate(dto.getEndDate());
        return exp;
    }

    public static ExperienceResponseDTO toDTO(InternshipExperience exp) {
        ExperienceResponseDTO dto = new ExperienceResponseDTO();

        dto.setId(exp.getId());
        dto.setTitle(exp.getTitle());
        dto.setDescription(exp.getDescription());
        dto.setRating(exp.getRating());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());

        if (exp.getUser() != null) {
            dto.setUserId(exp.getUser().getId());
        }

        if (exp.getCompany() != null) {
            dto.setCompanyId(exp.getCompany().getId());
            dto.setCompanyName(exp.getCompany().getName()); // ✅ مهم
        }

        return dto;
    }
}
