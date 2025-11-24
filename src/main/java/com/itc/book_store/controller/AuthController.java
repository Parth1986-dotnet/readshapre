package com.itc.book_store.controller;

import com.itc.book_store.dto.LoginRequest;
import com.itc.book_store.dto.JwtResponse;
import com.itc.book_store.dto.TokenRefreshRequest;
import com.itc.book_store.entity.Users;
import com.itc.book_store.repository.UserRepository;
import com.itc.book_store.security.JwtUtil;
import com.itc.book_store.services.EmailService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    /** Utility to build cookie header with SameSite=None */
    private void setJwtCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
//        String cookieValue = String.format(
//                "accessToken=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure=%s",
//                token != null ? token : "",
//                maxAgeSeconds,
//                false // ❗ set to true in production with HTTPS
//        );

        String cookieValue = String.format(
                "accessToken=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure",
                token != null ? token : "",
                maxAgeSeconds

        );
        response.setHeader("Set-Cookie", cookieValue);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        Optional<Users> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isPresent()) {
            Users user = userOpt.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String role = user.getRole().name();

                String accessToken = jwtUtil.generateToken(user.getEmail(), role);
                String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

                // ✅ Set cookie with SameSite=None
                setJwtCookie(response, accessToken, jwtUtil.getExpirationMs() / 1000);

                return ResponseEntity.ok(new JwtResponse(null, refreshToken));
            }
        }
        return ResponseEntity.status(401).body("Invalid email or password");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request, HttpServletResponse response) {
        try {
            String username = jwtUtil.validateToken(request.getRefreshToken());
            Optional<Users> userOpt = userRepository.findByEmail(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }

            String role = userOpt.get().getRole().name();
            String newAccessToken = jwtUtil.generateToken(username, role);

            // ✅ Reset cookie with new token
            setJwtCookie(response, newAccessToken, jwtUtil.getExpirationMs() / 1000);

            return ResponseEntity.ok(Map.of("message", "Token refreshed"));
        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(401).body("Refresh token expired");
        } catch (JwtException e) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // ✅ Clear cookie by setting MaxAge=0
        setJwtCookie(response, null, 0);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<Users> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security — always send OK even if email doesn't exist
            return ResponseEntity.ok("Reset link sent if email exists");
        }

        Users user = userOpt.get();
        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        // 🚀 VERY IMPORTANT — Send Email
        emailService.sendPasswordResetEmail(email, resetLink);

        return ResponseEntity.ok("Reset link sent if email exists");
    }



    // ===========================================================
    // 🔐 RESET PASSWORD
    // ===========================================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<Users> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body("Invalid token");
        }

        Users user = userOpt.get();

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body("Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }



}
