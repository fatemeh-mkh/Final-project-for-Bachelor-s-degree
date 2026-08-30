package com.example.Internship.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String requestUri = request.getRequestURI();

        // ۱. اگر مسیر جزو موارد عمومی و آزاد (Public) است، فیلتر را بدون بررسی توکن عبور بده
        if (requestUri.startsWith("/api/auth/") ||
                requestUri.startsWith("/api/public/") ||
                requestUri.startsWith("/api/companies/") ||
                requestUri.startsWith("/api/experiences/") ||
                requestUri.startsWith("/api/jobs/") ||
                requestUri.startsWith("/api/job-ads/") ||
                requestUri.startsWith("/api/student/personality/questions")) { // آدرس سوالات MBTI کنترلر دانشجو

            filterChain.doFilter(request, response);
            return;
        }

        // ۲. بررسی وجود و فرمت درست توکن در هدر درخواست
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // استخراج توکن (حذف کلمه Bearer و فضاهای خالی احتمالی)
        final String token = authHeader.substring(7).trim();

        try {
            final String username = jwtUtil.extractUsername(token);

            // ۳. اگر نام کاربری یافت شد و کاربر هنوز احراز هویت نشده بود (در SecurityContext نیست)
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // ۴. اعتبارسنجی نهایی توکن JWT
                if (jwtUtil.validateToken(token)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // تزریق اطلاعات کاربر به سشن امنیتی اسپرینگ
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (Exception e) {
            // اصلاح ساختار لاگ خطا برای ثبت دقیق جزئیات در کنسول
            logger.error(String.format("JWT authentication error for URI: %s | Error: %s", requestUri, e.getMessage()));

            // در صورت تمایل به برگشت دادن آنی ارور 401 به کلاینت موقع خراب بودن توکن، دو خط زیر را فعال کنید:
            // response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            // return;
        }

        // هدایت درخواست به فیلتر بعدی در زنجیره فیلترها (Filter Chain)
        filterChain.doFilter(request, response);
    }
}