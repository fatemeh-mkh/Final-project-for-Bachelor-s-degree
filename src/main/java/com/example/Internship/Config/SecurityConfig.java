package com.example.Internship.Config;
import com.example.Internship.Security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. غیرفعال سازی CSRF (به دلیل استفاده از JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. تنظیمات CORS
                .cors(Customizer.withDefaults())

                // 3. مدیریت نشست‌ها (Stateless برای REST API)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 4. مدیریت دقیق دسترسی‌ها (Authorization)
                .authorizeHttpRequests(auth -> auth

                        // --- Swagger / OpenAPI ---
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // --- مسیرهای عمومی (Public) ---
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/api/companies/**",
                                "/api/experiences/**",
                                "/api/jobs/**",
                                "/api/job-ads/**",
                                "/api/student/personality/questions"
                        ).permitAll()

                        // --- پنل ادمین ---
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // --- پنل دانشجو ---
                        .requestMatchers("/api/student/**").hasRole("STUDENT")
                        .requestMatchers("/api/personality/submit").hasRole("STUDENT")

                        // --- پنل کارفرما ---
                        .requestMatchers("/api/company/**").hasRole("COMPANY")

                        // --- سایر درخواست‌ها ---
                        .anyRequest().authenticated()
                )
                // 5. تزریق فیلتر JWT قبل از فیلتر استاندارد امنیتی
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://localhost:3000",
                "http://localhost:8080"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cache-Control"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
