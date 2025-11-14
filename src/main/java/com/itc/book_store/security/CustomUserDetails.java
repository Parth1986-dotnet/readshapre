package com.itc.book_store.security;

import com.itc.book_store.entity.Users;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collection;
import java.util.Collections;

public record CustomUserDetails(Users user) implements UserDetails {

    public Long getId() {
        return user.getId(); // numeric user id
    }

    public String getEmail() {
        return user.getEmail(); // ✅ expose email if needed
    }

    public String getRole() {
        return user.getRole().name(); // ✅ helpful for profile response
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // ✅ IMPORTANT: use email for login
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
