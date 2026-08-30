package com.example.Internship.DTO;

import lombok.Data;

@Data
public class ResetPasswordRequest {

    private String token;
    private String newPassword;
}
