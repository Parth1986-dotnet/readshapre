// src/main/java/com/itc/book_store/services/impl/RoleServiceImpl.java
package com.itc.book_store.services.impl;


import com.itc.book_store.entity.Role;
import com.itc.book_store.Enum.RoleName;
import com.itc.book_store.repository.RoleRepository;
import com.itc.book_store.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Role getRoleByName(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
    }
}
