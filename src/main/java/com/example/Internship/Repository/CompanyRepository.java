package com.example.Internship.Repository;

import com.example.Internship.Entity.Company;
import com.example.Internship.Entity.CompanyStatus;
import com.example.Internship.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository; // Import Repository annotation

import java.util.List;
import java.util.Optional;

@Repository // اضافه کردن این annotation به صورت صریح
public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByName(String name);

    List<Company> findByStatus(CompanyStatus status);

    Optional<Company> findByUser(User user);

    boolean existsByUser(User user);

    // --- متد اصلاح شده با استفاده از @Query ---
    // این متد مستقیما بر اساس ID کاربر، شرکت مرتبط را جستجو می‌کند.
    @Query("SELECT c FROM Company c WHERE c.user.id = :userId")
    Optional<Company> findByUserId(@Param("userId") Long userId);
    // -----------------------------------------


    // --- متد کمکی برای بررسی وجود شرکت بر اساس User ID ---
    // این متد هم با @Query پیاده‌سازی شده تا اطمینان حاصل شود که جستجو درست انجام می‌شود.
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM Company c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
    // ---------------------------------------------------
}
