package com.example.Internship.DTO;

import com.example.Internship.Entity.ApplicantStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApplicantStatusUpdateDTO {
    private ApplicantStatus status;
    private String note;
}