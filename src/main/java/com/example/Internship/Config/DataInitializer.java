package com.example.Internship.Config;

import com.example.Internship.Entity.Role;
import com.example.Internship.Entity.User;
import com.example.Internship.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.findByEmail("admin@platform.com").isEmpty()) {

            User admin = User.builder()
                    .name("Admin")
                    .email("admin@platform.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)        // ✔️ نقش درست
                    .enabled(true)                // ✔️ فعال‌سازی اجباری
                    .build();

            userRepository.save(admin);

            System.out.println("ADMIN CREATED");
        }
    }
}
