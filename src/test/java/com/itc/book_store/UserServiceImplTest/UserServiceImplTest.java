package com.itc.book_store.UserServiceImplTest;

import com.itc.book_store.dto.UserRegistrationRequest;
import com.itc.book_store.entity.Users;
import com.itc.book_store.Enum.RoleName;
import com.itc.book_store.repository.UserRepository;
import com.itc.book_store.services.EmailService;
import com.itc.book_store.services.RoleService;
import com.itc.book_store.services.impl.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

        @Mock
        private UserRepository userRepository;

        @Mock
        private RoleService roleService;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private EmailService emailService;

        private UserService userService;

        @BeforeEach
        void setUp() {
            userService = new UserService(
                    userRepository,
                    roleService,
                    passwordEncoder,
                    emailService
            );
        }

        @Test
        void testRegisterUser_Success() {
            UserRegistrationRequest request = new UserRegistrationRequest(
                    "parth",
                    "parth@example.com",
                    "password123",
                    "ROLE_USER"
            );

            when(userRepository.existsByEmail("parth@example.com")).thenReturn(false);
            when(passwordEncoder.encode("password123")).thenReturn("ENCODED");
            when(userRepository.save(any(Users.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            Users saved = userService.registerUser(request);

            assertNotNull(saved);
            assertEquals("parth@example.com", saved.getEmail());
            assertEquals(RoleName.ROLE_USER, saved.getRole());
            assertEquals("ENCODED", saved.getPassword());

            verify(emailService).sendWelcomeEmail("parth@example.com", "parth");
        }

    // ======================================================
    // 2️⃣ EMAIL ALREADY EXISTS
    // ======================================================
    @Test
    void testRegisterUser_EmailAlreadyExists() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "parth", "parth@example.com", "password123", null
        );

        when(userRepository.existsByEmail("parth@example.com")).thenReturn(true);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> userService.registerUser(request)
        );

        assertEquals("Email already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    // ======================================================
    // 3️⃣ BLOCK SELF ADMIN REGISTRATION
    // ======================================================
    @Test
    void testRegisterUser_CannotRegisterAdmin() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "parth", "parth@example.com", "password123", "ROLE_ADMIN"
        );

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> userService.registerUser(request)
        );

        assertEquals("You cannot self-register as admin.", ex.getMessage());
        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(any(), any());
    }

    // ======================================================
    // 4️⃣ INVALID ROLE PROVIDED
    // ======================================================
    @Test
    void testRegisterUser_InvalidRole() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "parth", "parth@example.com", "password123", "INVALID_ROLE"
        );

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> userService.registerUser(request)
        );

        assertTrue(ex.getMessage().contains("Invalid role"));
        verify(userRepository, never()).save(any());
    }

    // ======================================================
    // 5️⃣ PASSWORD ENCODING VERIFIED
    // ======================================================
    @Test
    void testRegisterUser_PasswordEncoded() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "parth", "parth@example.com", "password123", null
        );

        when(userRepository.existsByEmail("parth@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("ENCODED_PASS");
        when(userRepository.save(any(Users.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Users saved = userService.registerUser(request);

        assertEquals("ENCODED_PASS", saved.getPassword());
        verify(passwordEncoder, times(1)).encode("password123");
    }
}
