
package com.example.Internship.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRegisterRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    // فیلدهای اختیاری
    private String industry;
    private String location;
    private String website;
}
