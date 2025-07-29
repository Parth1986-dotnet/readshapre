package com.itc.book_store.dto;

public class UserDTO {
    private Long id;
    private String username;
    private RoleName role;

    // Constructors
    public UserDTO() {}

    public UserDTO(Long id, String username, RoleName role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public RoleName getRole() {
        return role;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(RoleName role) {
        this.role = role;
    }
}
