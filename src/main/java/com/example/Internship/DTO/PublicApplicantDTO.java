package com.example.Internship.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PublicApplicantDTO {
    private Long jobId;
    private String fullName;
    private String email;
    // private String phoneNumber; // این خط رو حذف کن
    private String phone; // <<< نام فیلد رو به phone تغییر بده
    private String coverLetter;
}
