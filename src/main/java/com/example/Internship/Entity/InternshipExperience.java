package com.example.Internship.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "internship_experiences")
@Getter
@Setter
public class InternshipExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @Column(length = 2000)
    private String description;

    @Min(1)
    @Max(5)
    private int rating;

    private LocalDate startDate;
    private LocalDate endDate;

    @JsonIgnore // نادیده گرفتن اطلاعات کاربر هنگام نمایش تجربه برای امنیت و سادگی
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne // این فیلد را Ignore نمی‌کنیم چون می‌خواهیم نام شرکت را ببینیم
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
