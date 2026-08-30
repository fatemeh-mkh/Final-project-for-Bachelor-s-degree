package com.example.Internship.Repository;


import com.example.Internship.Entity.InternshipExperience;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface InternshipExperienceRepository
        extends JpaRepository<InternshipExperience, Long> {

    // فیلتر بر اساس شرکت
    List<InternshipExperience> findByCompanyId(Long companyId);

    // فیلتر بر اساس کاربر
    List<InternshipExperience> findByUserId(Long userId);

    // فیلتر بر اساس امتیاز
    List<InternshipExperience> findByRating(int rating);

    // فیلتر بر اساس تاریخ شروع بعد از یک مقدار خاص
    List<InternshipExperience> findByStartDateAfter(LocalDate startDate);

    // صفحه‌بندی
    Page<InternshipExperience> findAll(Pageable pageable);



}
