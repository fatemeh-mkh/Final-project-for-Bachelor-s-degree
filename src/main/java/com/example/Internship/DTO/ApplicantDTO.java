package com.example.Internship.DTO;

import com.example.Internship.Entity.ApplicantStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private ApplicantStatus status;
    private String note;
    private LocalDateTime appliedAt;

    private Long jobAdvertisementId;
    private String jobTitle;
}
