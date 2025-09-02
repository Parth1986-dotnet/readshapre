package com.itc.book_store.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import com.itc.book_store.repository.UserRepository;
import com.itc.book_store.entity.Users;
import com.itc.book_store.Enum.RoleName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.Map;
import java.util.Optional;
import java.util.List;



@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")  // Only admins can manage roles
public class RoleManagerController {

    private final UserRepository userRepository;

    @Autowired
    public RoleManagerController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. Get paginated users with optional search
    @GetMapping("/users")
    public ResponseEntity<List<Users>> listUsers(
            @RequestParam(value = "search", required = false, defaultValue = "") String search,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("username").ascending());
        Page<Users> usersPage = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        return ResponseEntity.ok(usersPage.getContent());  // return list only
    }

    // 2. Update a user's role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> roleRequest) {

        String roleStr = roleRequest.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }

        RoleName role;
        try {
            role = RoleName.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + roleStr);
        }

        Optional<Users> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users user = optionalUser.get();
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok("User role updated successfully");
    }
}