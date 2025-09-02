package com.itc.book_store.controller;

import com.itc.book_store.dto.LoginRequest;
import com.itc.book_store.entity.Users;
import com.itc.book_store.repository.UserRepository;
import com.itc.book_store.security.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.itc.book_store.dto.JwtResponse;
import com.itc.book_store.dto.TokenRefreshRequest;


import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

import java.util.stream.Collectors;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Users> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                // Get the user's role as a String
                String role = user.getRole().name();

                // Generate access token and refresh token
                String accessToken = jwtUtil.generateToken(user.getEmail(), role);
                String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

                // Return both tokens in JwtResponse DTO
                return ResponseEntity.ok(new JwtResponse(accessToken, refreshToken));
            }
        }

        return ResponseEntity.status(401).body("Invalid email or password");
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<Users> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Do not reveal user existence for security reasons
            return ResponseEntity.ok("Reset link sent if email exists");
        }

        // ✅ Generate reset token and save to DB
        String token = UUID.randomUUID().toString(); // or use JWT if you want to send secure links

        Users user = userOpt.get();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // token expires in 10 minutes
        userRepository.save(user);

        // ✅ TODO: send email (e.g. using a mail service) with reset link
        // Example reset URL: http://localhost:3000/reset-password?token=xyz123
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        System.out.println("Password reset link: " + resetLink); // In real app: send this by email

        return ResponseEntity.ok("Reset link sent if email exists");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        try {
            String username = jwtUtil.validateToken(refreshToken);

            // You need to fetch the user role from DB, example:
            Optional<Users> userOpt = userRepository.findByEmail(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }
            String role = userOpt.get().getRole().name();

            String newAccessToken = jwtUtil.generateToken(username, role);

            return ResponseEntity.ok(new JwtResponse(newAccessToken, refreshToken));
        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(401).body("Refresh token expired");
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }
    }

}