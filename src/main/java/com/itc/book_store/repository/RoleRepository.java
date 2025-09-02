package com.itc.book_store.repository;

import com.itc.book_store.entity.Role;
import com.itc.book_store.Enum.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository  extends  JpaRepository<Role, Long> {

    // Method to find a role by its name
    Optional<Role> findByName(RoleName roleName);

    // Method to check if a role exists by its name
    boolean existsByName(RoleName roleName);
}
