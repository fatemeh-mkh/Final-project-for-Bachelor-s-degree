package com.example.Internship.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @JsonIgnore // بسیار مهم: پسورد هرگز نباید در API نمایش داده شود
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @JsonIgnore // قطع چرخه: وقتی کاربر را می‌گیریم، نیازی به لود مجدد شیء شرکت نیست
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Company company;
    // در فایل User.java این فیلدها را اضافه کنید:

    @Column(length = 4)
    private String mbtiType; // مثلا: INTJ, ENFP

    @Column(columnDefinition = "TEXT")
    private String studentSkills; // مهارت‌هایی که دانشجو خودش وارد کرده یا کسب کرده

    @Column(columnDefinition = "TEXT")
    private String interests; // علاقه‌مندی‌های دانشجو

}
