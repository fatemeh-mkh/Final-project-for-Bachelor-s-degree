package com.example.Internship.Service;

import com.example.Internship.DTO.*;
import com.example.Internship.Entity.*;
import com.example.Internship.Repository.CompanyRepository;
import com.example.Internship.Repository.PasswordResetTokenRepository;
import com.example.Internship.Repository.UserRepository;
import com.example.Internship.Security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    // ===============================
    // STUDENT REGISTER
    // ===============================
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("ایمیل قبلاً ثبت شده است.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .enabled(true)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getRole().name());
    }

    // ===============================
    // COMPANY REGISTER (PENDING)
    // ===============================
    public AuthResponse registerCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("ایمیل قبلاً ثبت شده است.");
        }

        if (companyRepository.existsByName(request.getCompanyName())) {
            throw new RuntimeException("نام شرکت تکراری است.");
        }

        User user = User.builder()
                .name(request.getCompanyName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.COMPANY)
                .enabled(true)
                .build();

        userRepository.save(user);

        Company company = new Company();
        company.setName(request.getCompanyName());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setStatus(CompanyStatus.PENDING);
        company.setUser(user);

        companyRepository.save(company);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getRole().name());
    }

    // ===============================
    // STUDENT + ADMIN LOGIN
    // ===============================
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("کاربر پیدا نشد"));

        // تفکیک نقش:
        // STUDENT و ADMIN از این مسیر می‌توانند وارد شوند
        // COMPANY باید از مسیر مخصوص شرکت‌ها وارد شود
        if (user.getRole() == Role.COMPANY) {
            throw new RuntimeException("لطفاً از بخش ورود شرکت‌ها استفاده کنید.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getRole().name());
    }

    // ===============================
    // COMPANY LOGIN (مخصوص شرکت‌ها)
    // ===============================
    public AuthResponse companyLogin(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("کاربر پیدا نشد"));

        // تفکیک نقش: جلوگیری از ورود دانشجوها از فرم شرکت
        if (user.getRole() != Role.COMPANY) {
            throw new RuntimeException("این بخش مخصوص ورود شرکت‌ها است.");
        }

        // بررسی وضعیت تایید توسط ادمین
        Company company = companyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("پروفایل شرکت یافت نشد."));

        if (company.getStatus() != CompanyStatus.APPROVED) {
            throw new RuntimeException("حساب شرکت شما در انتظار تایید مدیریت است.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getRole().name());
    }

    // ===============================
    // FORGOT PASSWORD
    // ===============================
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        passwordResetTokenRepository.findByUser(user)
                .ifPresent(existingToken -> {
                    passwordResetTokenRepository.delete(existingToken);
                    passwordResetTokenRepository.flush();
                });

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);
        System.out.println("RESET PASSWORD TOKEN: " + token);
    }

    // ===============================
    // RESET PASSWORD
    // ===============================
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }
}