package com.example.Internship.Controller;

import com.example.Internship.Entity.User;
import com.example.Internship.Repository.UserRepository;
import com.example.Internship.Service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:5500", allowCredentials = "true")
public class StudentController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Value("classpath:data/mbti_questions.json")
    private Resource mbtiQuestionsResource;

    // ۱. دریافت سوالات MBTI از فایل JSON
    @GetMapping("/personality/questions")
    public ResponseEntity<?> getPersonalityQuestions() {
        try {
            InputStream inputStream = mbtiQuestionsResource.getInputStream();
            String jsonContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            List<Map<String, Object>> questions = objectMapper.readValue(jsonContent, new TypeReference<>() {});

            if (questions == null || questions.isEmpty()) {
                return ResponseEntity.internalServerError().body("خطا در بارگذاری سوالات MBTI. فایل خالی است.");
            }

            return ResponseEntity.ok(questions);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("خطا در پردازش سوالات MBTI: " + e.getMessage());
        }
    }

    // ۲. دریافت اطلاعات پروفایل جاری دانشجو (اصلاح شد: ارسال فیلدهای مهارت و علاقه جهت پایداری تگ‌باکس‌ها)
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("جلسه کاری منقضی شده است. لطفا دوباره وارد شوید.");
        }

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("دانشجو با ایمیل " + principal.getName() + " یافت نشد"));

        // استفاده از HashMap برای همگام‌سازی کامل فیلدها با فرانت‌اِند و ایمنی در برابر مقادیر null
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("name", student.getName() != null ? student.getName() : "کاربر عزیز");
        profileData.put("email", student.getEmail());
        profileData.put("mbtiType", student.getMbtiType() != null ? student.getMbtiType() : "انجام نشده");
        profileData.put("studentSkills", student.getStudentSkills() != null ? student.getStudentSkills() : "");
        profileData.put("interests", student.getInterests() != null ? student.getInterests() : "");

        return ResponseEntity.ok(profileData);
    }

    // ۳. ثبت نهایی نتیجه تست شخصیت شناسی
    @PostMapping("/submit-test")
    public ResponseEntity<?> saveTestResult(@RequestBody Map<String, Object> result, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("نیاز به احراز هویت برای ثبت نتیجه تست.");
        }

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("دانشجو یافت نشد"));

        Object mbtiTypeObj = result.get("type");
        if (mbtiTypeObj == null) {
            return ResponseEntity.badRequest().body("اطلاعات نوع MBTI در درخواست یافت نشد.");
        }

        String mbtiType = mbtiTypeObj.toString().trim();

        if (mbtiType.isEmpty() || mbtiType.length() != 4) {
            return ResponseEntity.badRequest().body("نوع MBTI نامعتبر است. باید دقیقا ۴ حرف باشد (مثال: ENTJ).");
        }

        student.setMbtiType(mbtiType.toUpperCase());
        userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "نتیجه تست MBTI با موفقیت ثبت شد."));
    }

    // ۴. به‌روزرسانی مهارت‌ها و علاقه‌مندی‌ها (پشتیبانی از آرایه یا رشته ارسالی از فرانت)
    @SuppressWarnings("unchecked")
    @PostMapping("/update-profile-details")
    public ResponseEntity<?> updateProfileDetails(@RequestBody Map<String, Object> request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("نیاز به احراز هویت وجود دارد.");
        }

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("دانشجو یافت نشد"));

        Object skillsObj = request.get("skills");
        Object interestsObj = request.get("interests");

        if (skillsObj == null || interestsObj == null) {
            return ResponseEntity.badRequest().body("لطفاً مهارت‌ها و علاقه‌مندی‌ها را وارد کنید.");
        }

        // تبدیل مقدار ورودی فرانت‌اند به رشته جهت ذخیره در دیتابیس
        String skills = skillsObj instanceof List ? String.join(",", (List<String>) skillsObj) : skillsObj.toString();
        String interests = interestsObj instanceof List ? String.join(",", (List<String>) interestsObj) : interestsObj.toString();

        student.setStudentSkills(skills);
        student.setInterests(interests);

        userRepository.save(student);

        return ResponseEntity.ok(Map.of("message", "اطلاعات تکمیلی با موفقیت ثبت شد."));
    }

    // ۵. پیشنهاد هوشمند آگهی‌ها بر اساس تلفیق هوشمند (MBTI، مهارت‌ها و علایق)
    @GetMapping("/recommended-jobs")
    public ResponseEntity<?> getRecommendations(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("کاربر احراز هویت نشده است.");
        }

        // واکشی اطلاعات کامل دانشجو شامل مهارت‌ها، علایق و تیپ شخصیتی
        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("دانشجو یافت نشد"));

        String studentMbti = student.getMbtiType();

        if (studentMbti == null || studentMbti.isEmpty() || "انجام نشده".equalsIgnoreCase(studentMbti)) {
            return ResponseEntity.badRequest().body("ابتدا باید تست MBTI را کامل کنید تا پیشنهادات شغلی نمایش داده شوند.");
        }

        // دریافت آگهی‌های منطبق و وزن‌دهی شده از سرویس پیشنهاد دهنده هوشمند
        List<Map<String, Object>> recommendations = recommendationService.getRecommendationsForStudent(student);

        return ResponseEntity.ok(recommendations);
    }
}