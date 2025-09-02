package com.itc.book_store.controller;

import com.itc.book_store.dto.UserDTO;
import com.itc.book_store.dto.UserRegistrationRequest;
import com.itc.book_store.entity.Users;
import com.itc.book_store.services.impl.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Users> registerUser(@RequestBody UserRegistrationRequest request) {
        Users savedUser = userService.registerUser(request);
        return ResponseEntity.ok(savedUser);
    }


    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(Authentication authentication) {
        // 'authentication' is auto-injected by Spring Security with the logged-in user's details
        String username = authentication.getName(); // typically the username

        Users user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Optionally: Hide password before returning user object
        //user.setPassword(null);

        return ResponseEntity.ok(
                new UserDTO(user.getId(), user.getUsername(), user.getRole()) );
    }

}