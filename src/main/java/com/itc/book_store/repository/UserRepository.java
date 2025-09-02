package com.itc.book_store.repository;

import com.itc.book_store.entity.Users;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Optional;
public interface UserRepository extends JpaRepository<Users, Long> {
    // ✅ required method to find a user by email
    Optional<Users> findByEmail(String email);
    // ✅ required method to find a user by username
    Optional<Users> findByUsername(String username); // ✅ Must have this line // ✅ required method

    Page<Users> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email, Pageable pageable);

    Optional<Users> findByResetToken(String resetToken);

    boolean existsByEmail(String email);

    void deleteByEmail(String email);
}
