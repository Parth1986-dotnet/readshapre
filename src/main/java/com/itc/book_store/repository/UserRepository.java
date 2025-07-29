package com.itc.book_store.repository;

import com.itc.book_store.entity.Users;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface UserRepository extends JpaRepository<Users, Long> {

    // Method to find a user by their email
    Optional<Users> findByEmail(String username);

}
