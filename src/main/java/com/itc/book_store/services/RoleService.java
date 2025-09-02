package com.itc.book_store.services;

import com.itc.book_store.entity.Role;
import com.itc.book_store.Enum.RoleName;

public interface RoleService {
    Role getRoleByName(RoleName roleName);
}
