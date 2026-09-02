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

        // =================================================
        // INTJ - معمار
        // تحلیل‌گر، استراتژیک، مستقل و علاقه‌مند به حل مسائل پیچیده
        // =================================================
        map.put("INTJ", List.of(
                "backend",
                "software",
                "developer",
                "programming",
                "java",
                "python",
                "spring",
                "algorithm",
                "data",
                "database",
                "ai",
                "machine learning",
                "analysis",
                "architecture",
                "system design",
                "security",
                "research"
        ));

        // =================================================
        // INTP - متفکر
        // علاقه‌مند به تحقیق، منطق، الگوریتم و حل مسئله
        // =================================================
        map.put("INTP", List.of(
                "research",
                "developer",
                "software",
                "backend",
                "programming",
                "algorithm",
                "python",
                "java",
                "ai",
                "machine learning",
                "data science",
                "analysis",
                "database",
                "system design",
                "researcher"
        ));

        // =================================================
        // ENTJ - فرمانده
        // رهبری، مدیریت، تصمیم‌گیری و هدایت تیم
        // =================================================
        map.put("ENTJ", List.of(
                "manager",
                "management",
                "lead",
                "leader",
                "team lead",
                "product",
                "product manager",
                "project manager",
                "scrum",
                "agile",
                "pmo",
                "operations",
                "business",
                "strategy",
                "cto",
                "consultant"
        ));

        // =================================================
        // ENTP - مبتکر
        // ایده‌پردازی، نوآوری، تکنولوژی و حل مسائل جدید
        // =================================================
        map.put("ENTP", List.of(
                "developer",
                "software",
                "programming",
                "startup",
                "founder",
                "product",
                "innovation",
                "ai",
                "machine learning",
                "research",
                "consultant",
                "business",
                "strategy",
                "frontend",
                "backend",
                "full stack"
        ));

        // =================================================
        // INFJ - حامی
        // آموزش، تحقیق، مشاوره و فعالیت‌های انسان‌محور
        // =================================================
        map.put("INFJ", List.of(
                "research",
                "researcher",
                "education",
                "training",
                "mentor",
                "hr",
                "human resources",
                "psychology",
                "consultant",
                "content",
                "writer",
                "analysis",
                "social",
                "communication"
        ));

        // =================================================
        // INFP - میانجی
        // خلاق، ارزش‌محور و علاقه‌مند به طراحی و تولید محتوا
        // =================================================
        map.put("INFP", List.of(
                "design",
                "ui",
                "ux",
                "graphic design",
                "writer",
                "content",
                "content creator",
                "research",
                "frontend",
                "html",
                "css",
                "creative",
                "illustration",
                "social media"
        ));

        // =================================================
        // ENFJ - قهرمان
        // ارتباطات، رهبری، آموزش و کار با افراد
        // =================================================
        map.put("ENFJ", List.of(
                "manager",
                "management",
                "mentor",
                "mentor",
                "hr",
                "human resources",
                "lead",
                "team lead",
                "scrum",
                "relations",
                "communication",
                "training",
                "education",
                "sales",
                "marketing",
                "customer success"
        ));

        // =================================================
        // ENFP - مبارز
        // خلاق، اجتماعی، ایده‌پرداز و علاقه‌مند به ارتباط با دیگران
        // =================================================
        map.put("ENFP", List.of(
                "marketing",
                "content",
                "content creator",
                "design",
                "ui",
                "ux",
                "frontend",
                "react",
                "javascript",
                "social media",
                "sales",
                "communication",
                "creative",
                "branding",
                "product"
        ));

        // =================================================
        // ISTJ - بازرس
        // دقیق، منظم، مسئولیت‌پذیر و علاقه‌مند به سیستم‌های ساختاریافته
        // =================================================
        map.put("ISTJ", List.of(
                "qa",
                "testing",
                "software testing",
                "security",
                "database",
                "network",
                "devops",
                "linux",
                "postgres",
                "postgresql",
                "mysql",
                "sql",
                "backend",
                "java",
                "documentation",
                "system administration"
        ));

        // =================================================
        // ISFJ - مدافع
        // دقیق، مسئولیت‌پذیر، همکاری‌محور و علاقه‌مند به پشتیبانی
        // =================================================
        map.put("ISFJ", List.of(
                "support",
                "technical support",
                "customer support",
                "qa",
                "testing",
                "documentation",
                "hr",
                "human resources",
                "administration",
                "database",
                "frontend",
                "ui",
                "service",
                "customer service",
                "communication"
        ));

        // =================================================
        // ESTJ - مدیر
        // سازمان‌دهی، مدیریت عملیات و اجرای فرآیندها
        // =================================================
        map.put("ESTJ", List.of(
                "management",
                "manager",
                "operations",
                "admin",
                "administration",
                "pmo",
                "project manager",
                "project management",
                "scrum",
                "agile",
                "team lead",
                "business",
                "sales",
                "planning",
                "coordination"
        ));

        // =================================================
        // ESFJ - سفیر
        // ارتباطات، خدمات، همکاری تیمی و تعامل با مشتری
        // =================================================
        map.put("ESFJ", List.of(
                "frontend",
                "react",
                "javascript",
                "ui",
                "ux",
                "support",
                "customer support",
                "sales",
                "marketing",
                "hr",
                "human resources",
                "communication",
                "customer success",
                "relations",
                "service"
        ));

        // =================================================
        // ISTP - صنعتگر
        // فنی، عملی، حل مسئله و علاقه‌مند به زیرساخت و سیستم
        // =================================================
        map.put("ISTP", List.of(
                "backend",
                "developer",
                "programming",
                "java",
                "python",
                "c",
                "cpp",
                "c++",
                "linux",
                "devops",
                "docker",
                "network",
                "networking",
                "security",
                "hardware",
                "system administration",
                "troubleshooting"
        ));

        // =================================================
        // ISFP - ماجراجو
        // خلاق، هنری و علاقه‌مند به طراحی و تجربه کاربری
        // =================================================
        map.put("ISFP", List.of(
                "design",
                "ui",
                "ux",
                "graphic design",
                "graphics",
                "frontend",
                "html",
                "css",
                "javascript",
                "figma",
                "photoshop",
                "illustration",
                "creative",
                "visual design"
        ));

        // =================================================
        // ESTP - کارآفرین
        // عمل‌گرا، سریع، اجتماعی و علاقه‌مند به کسب‌وکار و تکنولوژی
        // =================================================
        map.put("ESTP", List.of(
                "sales",
                "marketing",
                "business",
                "business development",
                "product",
                "product manager",
                "startup",
                "entrepreneur",
                "consultant",
                "customer success",
                "communication",
                "management",
                "operations",
                "frontend",
                "developer"
        ));

        // =================================================
        // ESFP - سرگرم‌کننده
        // اجتماعی، خلاق، ارتباطی و علاقه‌مند به محتوا و تعامل
        // =================================================
        map.put("ESFP", List.of(
                "marketing",
                "content",
                "content creator",
                "social media",
                "sales",
                "communication",
                "customer support",
                "customer success",
                "design",
                "ui",
                "ux",
                "frontend",
                "branding",
                "public relations",
                "event"
        ));

        return map;
    }
}
