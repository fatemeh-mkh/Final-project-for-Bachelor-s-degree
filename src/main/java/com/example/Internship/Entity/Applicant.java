package com.example.Internship.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applicants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // نام متقاضی
    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;

    // ******** فیلد جدید اضافه شده ********
    @Column(columnDefinition = "TEXT") // میتونه متن طولانی باشه
    private String coverLetter;
    // *************************************

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicantStatus status = ApplicantStatus.PENDING;

    // یادداشت کارفرما/ادمین روی متقاضی
    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_advertisement_id", nullable = false)
    private JobAdvertisement jobAdvertisement;

    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @PrePersist
    public void prePersist() {
        this.appliedAt = LocalDateTime.now();
        if (this.status == null) this.status = ApplicantStatus.PENDING;
    }
}
