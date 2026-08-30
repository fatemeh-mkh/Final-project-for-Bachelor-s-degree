package com.example.Internship.Controller;

import com.example.Internship.DTO.*;
import com.example.Internship.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ===============================
    // STUDENT REGISTER
    // ===============================
    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest request) {
        return authService.register(request);
    }

    // ===============================
    // STUDENT LOGIN
    // ===============================
    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }

    // ===============================
    // COMPANY LOGIN (جدید)
    // ===============================
    @PostMapping("/company-login")
    public AuthResponse companyLogin(@RequestBody @Valid LoginRequest request) {
        return authService.companyLogin(request);
    }

    // ===============================
    // FORGOT PASSWORD
    // ===============================
    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
    }

    // ===============================
    // RESET PASSWORD
    // ===============================
    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );
    }

    // ===============================
    // COMPANY REGISTER (PENDING)
    // ===============================
    @PostMapping("/register-company")
    public AuthResponse registerCompany(@RequestBody @Valid CompanyRegisterRequest request) {
        return authService.registerCompany(request);
    }
}
