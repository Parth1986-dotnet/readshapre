    package com.itc.book_store.entity;

    import jakarta.persistence.*;
    import com.itc.book_store.Enum.RoleName;

    @Entity
    @Table(name = "roles")
    public class Role {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, unique = true)
        private RoleName name;

        // Constructors
        public Role() {}

        public Role(RoleName name) {
            this.name = name;
        }

        // Getters and setters
        public Long getId() {
            return id;
        }

        public RoleName getName() {
            return name;
        }

        public void setName(RoleName name) {
            this.name = name;
        }
    }
