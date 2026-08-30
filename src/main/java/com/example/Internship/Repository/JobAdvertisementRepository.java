package com.example.Internship.Repository;

import com.example.Internship.Entity.JobAdvertisement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobAdvertisementRepository extends JpaRepository<JobAdvertisement, Long> {

    // ===============================
    // ✅ بخش مربوط به شرکت
    // ===============================

    long countByCompanyIdAndActiveTrue(Long companyId);

    List<JobAdvertisement> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<JobAdvertisement> findByCompanyIdAndActiveTrueOrderByCreatedAtDesc(Long companyId);

    Optional<JobAdvertisement> findByIdAndCompanyId(Long id, Long companyId);


    // ===============================
    // ✅ بخش مورد نیاز پنل دانشجو
    // ===============================

    // گرفتن تمام آگهی‌های فعال (برای پیشنهاددهنده)
    List<JobAdvertisement> findAllByActiveTrueOrderByCreatedAtDesc();

    // جستجو بر اساس عنوان (مثلا developer)
    List<JobAdvertisement> findByTitleContainingIgnoreCaseAndActiveTrue(String title);

    // جستجو بر اساس مهارت (چون skills String است)
    @Query("SELECT j FROM JobAdvertisement j WHERE LOWER(j.skills) LIKE LOWER(CONCAT('%', :skill, '%')) AND j.active = true")
    List<JobAdvertisement> findBySkillContaining(String skill);

    List<JobAdvertisement> findAllByActiveTrue();


}
