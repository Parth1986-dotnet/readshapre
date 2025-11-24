package com.itc.book_store;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource("classpath:application-test.properties")
class BookStoreApplicationTests {

    @Test
    void contextLoads() {
        // test will pass if application context loads successfully
    }
}
