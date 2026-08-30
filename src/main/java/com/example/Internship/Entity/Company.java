package com.example.Internship.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Column(nullable = false, unique = true)
    private String name;

    private String industry;
    private String location;
    private String website;

    // ===== ستون‌هایی که با ALTER TABLE اضافه کردی =====

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "employee_count")
    private Integer employeeCount;

    // ===== وضعیت شرکت =====
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyStatus status = CompanyStatus.PENDING;

    // ===== ارتباط با یوزر (کلید لاگین شرکت) =====
    // اگر می‌خواهی هر کاربر فقط یک شرکت داشته باشد، unique = true خوب است.
    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", unique = true)
    private User user;


}
