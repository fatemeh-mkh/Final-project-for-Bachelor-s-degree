package com.example.Internship.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAdvertisementDTO {

    private Long id;
    private Long companyId;
    private String title;
    private String description;
    private String skills;
    private String benefits;
    private String duration;
    private Boolean active;
    private Long applicantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
