package com.example.Internship.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ExperienceRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @Min(1)
    @Max(5)
    private int rating;

    private LocalDate startDate;
    private LocalDate endDate;

    private String name;

    // userId و companyId اینجا نباید باشد
}
