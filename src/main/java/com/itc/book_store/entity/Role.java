// java
package com.itc.book_store.entity;

import jakarta.persistence.*;
import com.itc.book_store.Enum.RoleName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleName name;

    // explicit single-arg constructor used by DataInitializer
    public Role(RoleName name) {
        this.name = name;
    }
}
