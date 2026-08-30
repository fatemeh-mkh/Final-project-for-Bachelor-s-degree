package com.example.Internship.Repository;

import com.example.Internship.Entity.Applicant;
import com.example.Internship.Entity.ApplicantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {

    @Query("""
           select count(a)
           from Applicant a
           where a.jobAdvertisement.company.id = :companyId
           """)
    long countByCompanyId(@Param("companyId") Long companyId);

    @Query("""
           select count(a)
           from Applicant a
           where a.jobAdvertisement.company.id = :companyId
             and a.status = :status
           """)
    long countByCompanyIdAndStatus(@Param("companyId") Long companyId,
                                   @Param("status") ApplicantStatus status);

    @Query("""
           select a
           from Applicant a
           where a.jobAdvertisement.id = :jobId
           order by a.appliedAt desc
           """)
    List<Applicant> findByJobIdOrderByAppliedAtDesc(@Param("jobId") Long jobId);

    @Query("""
           select a
           from Applicant a
           where a.jobAdvertisement.company.id = :companyId
           order by a.appliedAt desc
           """)
    List<Applicant> findByCompanyIdOrderByAppliedAtDesc(@Param("companyId") Long companyId);

    @Query("""
           select a
           from Applicant a
           where a.id = :applicantId
             and a.jobAdvertisement.company.id = :companyId
           """)
    Optional<Applicant> findByIdAndCompanyId(@Param("applicantId") Long applicantId,
                                             @Param("companyId") Long companyId);

    long countByJobAdvertisementId(Long jobAdvertisementId);
}
