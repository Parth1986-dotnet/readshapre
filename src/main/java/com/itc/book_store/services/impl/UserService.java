package com.itc.book_store.services.impl;

import com.itc.book_store.dto.UserRegistrationRequest;
import com.itc.book_store.entity.Users;
import com.itc.book_store.Enum.RoleName;
import com.itc.book_store.repository.UserRepository;
import com.itc.book_store.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, RoleService roleService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
    }

    public Users registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // ❌ Prevent self-registration as ADMIN
        if ("ROLE_ADMIN".equalsIgnoreCase(request.getRole())) {
            throw new RuntimeException("You cannot self-register as admin.");
        }

        // ✅ Determine role (default to ROLE_USER)
        RoleName roleName = RoleName.ROLE_USER;
        if (request.getRole() != null) {
            try {
                roleName = RoleName.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + request.getRole());
            }
        }

        // ✅ Encode password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // ✅ Create and save user
        Users user = new Users(
                request.getUsername(),
                request.getEmail(),
                encodedPassword,
                roleName
        );

        return userRepository.save(user);
    }

    public Optional<Users> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<Users> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Users saveUser(Users user) {
        return userRepository.save(user);
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void deleteUserByEmail(String email) {
        userRepository.deleteByEmail(email);
    }

    public Optional<Users> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByEmail(usernameOrEmail);
    }

}
