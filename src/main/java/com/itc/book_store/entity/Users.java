    package com.itc.book_store.entity;

    import com.itc.book_store.Enum.RoleName;
    import jakarta.persistence.*;
    import lombok.AllArgsConstructor;
    import lombok.Data;
    import java.time.LocalDateTime;

    @Data
    @Entity
    @AllArgsConstructor
    @Table(name = "users")
    public class Users {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(unique = true, nullable = false)
        private String username;

        @Column(unique = true, nullable = false)
        private String email;

        @Column(nullable = false)
        private String password;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private RoleName role;

        private String resetToken;
        private LocalDateTime resetTokenExpiry;

        public Users() {}

        public Users(String username, String email, String password, RoleName role) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.role = role;
        }
    }
