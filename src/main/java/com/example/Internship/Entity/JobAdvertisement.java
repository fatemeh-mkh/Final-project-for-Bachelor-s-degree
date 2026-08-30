package com.example.Internship.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_advertisements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAdvertisement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // عنوان آگهی
    @Column(nullable = false)
    private String title;

    // توضیحات
    @Column(columnDefinition = "TEXT")
    private String description;

    // مهارت‌ها (فعلاً ساده String؛ بعداً میشه لیست/JSON کرد)
    @Column(columnDefinition = "TEXT")
    private String skills;

    // مزایا
    @Column(columnDefinition = "TEXT")
    private String benefits;

    // مدت/نوع همکاری (اختیاری)
    private String duration;

    // فعال/غیرفعال بودن آگهی
    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.active == null) this.active = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
