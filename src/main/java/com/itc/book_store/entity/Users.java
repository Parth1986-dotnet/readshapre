package com.itc.book_store.entity;

import com.itc.book_store.Enum.RoleName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;


import java.time.LocalDateTime;
@Data
@Entity
@AllArgsConstructor


@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    // ✅ Add this
    @Column(unique = true, nullable = false)
    private String email; // ✅ Add this line

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleName role;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    // Constructors
    public Users() {}

    public Users(String username, String email, String password, RoleName role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {  // ✅ Add this
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(RoleName role) {
        this.role = role;
    }

    // Reset token related fields and forgot password functionality and methods

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }

    public void setId(Long userId) {
    }
}
