package com.example.Internship.DTO;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ExperienceResponseDTO {

    private Long id;
    private String title;
    private String description;
    private int rating;
    private LocalDate startDate;
    private LocalDate endDate;

    private Long userId;
    private Long companyId;
    private String companyName; // ✅ اضافه شود

}
