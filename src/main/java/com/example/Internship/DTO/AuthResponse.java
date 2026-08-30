package com.example.Internship.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String role; // اضافه کردن رول

}
