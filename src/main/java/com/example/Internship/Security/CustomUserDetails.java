package com.example.Internship.Security;

import com.example.Internship.Entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails extends org.springframework.security.core.userdetails.User {

    private final Long id;

    // سازنده اصلی (همان که داشتی)
    public CustomUserDetails(Long id,
                             String username,
                             String password,
                             Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.id = id;
    }

    // ✅ سازنده جدید: مستقیم از Entity User می‌سازد
    public CustomUserDetails(User user) {
        super(
                user.getEmail(),                // username در سیستم شما = email
                user.getPassword(),
                buildAuthorities(user)
        );
        this.id = user.getId();
    }

    private static Collection<? extends GrantedAuthority> buildAuthorities(User user) {
        // چون شما فقط یک role دارید (enum Role role)، یک authority می‌سازیم
        // Spring Security معمولاً انتظار دارد role با "ROLE_" شروع شود
        String roleName = user.getRole().name(); // مثل ADMIN یا COMPANY یا USER (هرچی در enum داری)

        // اگر enum شما از قبل ROLE_ADMIN شکل است، همین کافی است.
        // اگر enum شما ADMIN است، بهتر است ROLE_ADMIN تولید کنیم:
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        return List.of(new SimpleGrantedAuthority(roleName));
    }
}
