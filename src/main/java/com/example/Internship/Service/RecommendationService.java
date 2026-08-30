package com.example.Internship.Service;

import com.example.Internship.Entity.JobAdvertisement;
import com.example.Internship.Entity.User;
import com.example.Internship.Repository.JobAdvertisementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final JobAdvertisementRepository jobRepository;

    /**
     * دریافت لیست آگهی‌های پیشنهادی برای دانشجو
     */
    public List<Map<String, Object>> getRecommendationsForStudent(User student) {

        List<JobAdvertisement> jobs = jobRepository.findAllByActiveTrue();

        if (jobs.isEmpty()) {
            return Collections.emptyList();
        }

        return jobs.stream()
                .map(job -> {

                    double skillScore = calculateSkillScore(student, job);
                    double personalityScore = calculatePersonalityScore(student, job);
                    double interestScore = calculateInterestScore(student, job);

                    double finalScore =
                            (skillScore * 0.5) +
                                    (personalityScore * 0.3) +
                                    (interestScore * 0.2);

                    int match = (int) Math.min(finalScore, 100);

                    Map<String, Object> result = new HashMap<>();
                    result.put("job", job);
                    result.put("matchPercentage", match);

                    return result;
                })

                // حداقل تطابق
                .filter(m -> (int) m.get("matchPercentage") >= 20)

                // مرتب سازی
                .sorted((a, b) -> Integer.compare(
                        (int) b.get("matchPercentage"),
                        (int) a.get("matchPercentage")
                ))

                // حداکثر پیشنهاد
                .limit(3)

                .collect(Collectors.toList());
    }

    // -------------------------------------------------
    // Skill Matching
    // -------------------------------------------------
    private double calculateSkillScore(User student, JobAdvertisement job) {

        if (student.getStudentSkills() == null ||
                job.getSkills() == null ||
                job.getSkills().isBlank()) {
            return 0;
        }

        Set<String> studentSkills = splitToSet(student.getStudentSkills());
        Set<String> jobSkills = splitToSet(job.getSkills());

        if (jobSkills.isEmpty()) return 0;

        long matchCount = studentSkills.stream()
                .filter(studentSkill ->
                        jobSkills.stream().anyMatch(jobSkill ->
                                jobSkill.contains(studentSkill) ||
                                        studentSkill.contains(jobSkill)))
                .count();

        double ratio = (double) matchCount / jobSkills.size();

        return ratio * 100;
    }

    // -------------------------------------------------
    // MBTI Matching
    // -------------------------------------------------
    private double calculatePersonalityScore(User student, JobAdvertisement job) {

        if (student.getMbtiType() == null || student.getMbtiType().isBlank()) {
            return 40;
        }

        String mbti = student.getMbtiType().toUpperCase();

        String title = normalize(job.getTitle());
        String description = normalize(job.getDescription());
        String skills = normalize(job.getSkills());

        Map<String, List<String>> map = mbtiKeywordMap();

        if (!map.containsKey(mbti)) {
            return 40;
        }

        List<String> keywords = map.get(mbti);

        for (String key : keywords) {
            if (containsExactKeyword(title, key)) {
                return 100;
            }
        }

        for (String key : keywords) {
            if (containsExactKeyword(skills, key) ||
                    containsExactKeyword(description, key)) {
                return 75;
            }
        }

        return 40;
    }

    // -------------------------------------------------
    // Interest Matching
    // -------------------------------------------------
    private double calculateInterestScore(User student, JobAdvertisement job) {

        if (student.getInterests() == null || student.getInterests().isBlank()) {
            return 0;
        }

        String title = normalize(job.getTitle());
        String description = normalize(job.getDescription());

        int score = 0;

        for (String interest : student.getInterests().split("[,،]")) {

            interest = interest.trim().toLowerCase();

            if (interest.isEmpty()) continue;

            if (containsExactKeyword(title, interest)) {
                score += 50;
            } else if (containsExactKeyword(description, interest)) {
                score += 25;
            }
        }

        return Math.min(score, 100);
    }

    // -------------------------------------------------
    // Helpers
    // -------------------------------------------------

    private Set<String> splitToSet(String text) {
        return Arrays.stream(text.toLowerCase().split("[,،]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase();
    }

    private boolean containsExactKeyword(String source, String keyword) {

        if (source == null || keyword == null || keyword.isBlank()) {
            return false;
        }

        String regex = "(?i)(^|[^a-zA-Z0-9آ-ی])"
                + Pattern.quote(keyword.trim())
                + "([^a-zA-Z0-9آ-ی]|$)";

        return Pattern.compile(regex).matcher(source).find();
    }

    private Map<String, List<String>> mbtiKeywordMap() {

        Map<String, List<String>> map = new HashMap<>();

        map.put("INTJ", List.of("backend","data","ai","analysis","java","python","spring"));
        map.put("INTP", List.of("research","developer","software","backend","algorithm"));
        map.put("ENTJ", List.of("manager","lead","product","scrum","cto"));
        map.put("ENFP", List.of("marketing","content","design","ui","ux","frontend"));
        map.put("INFJ", List.of("research","education","hr","mentor"));
        map.put("ESFJ", List.of("frontend","react","ui","ux","support","sales"));
        map.put("ISTJ", List.of("qa","security","database","network","devops","postgres","mysql"));
        map.put("ISFP", List.of("design","ui","ux","graphics","frontend","html","css"));
        map.put("ESTJ", List.of("management","operations","admin","pmo"));
        map.put("ENFJ", List.of("manager","mentor","hr","lead","scrum","relations"));
        map.put("ENTP", List.of("developer","founder","ai","product","consultant"));
        map.put("INFP", List.of("design","writer","ui","ux","research"));

        return map;
    }
}
