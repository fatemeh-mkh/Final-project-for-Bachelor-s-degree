package com.example.Internship.Service;

import com.example.Internship.Entity.JobAdvertisement;
import com.example.Internship.Entity.User;
import com.example.Internship.Repository.JobAdvertisementRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecommendationServiceTest {

    @Test
    void shouldRecommendJobWithCorrectMatchPercentage() {

        // Arrange

        JobAdvertisementRepository jobRepository =
                mock(JobAdvertisementRepository.class);

        User student = User.builder()
                .name("Test Student")
                .email("student@test.com")
                .password("123456")
                .studentSkills("Java")
                .mbtiType("INTJ")
                .interests("Backend")
                .build();

        JobAdvertisement job = JobAdvertisement.builder()
                .id(1L)
                .title("Java Backend Developer")
                .description("Backend development with Spring")
                .skills("Java, Spring")
                .active(true)
                .build();

        when(jobRepository.findAllByActiveTrue())
                .thenReturn(List.of(job));

        RecommendationService recommendationService =
                new RecommendationService(jobRepository);

        // Act

        List<Map<String, Object>> result =
                recommendationService.getRecommendationsForStudent(student);

        // Assert

        assertEquals(1, result.size());

        Map<String, Object> recommendation = result.get(0);

        assertSame(job, recommendation.get("job"));

        assertEquals(65, recommendation.get("matchPercentage"));

        verify(jobRepository).findAllByActiveTrue();
    }
}