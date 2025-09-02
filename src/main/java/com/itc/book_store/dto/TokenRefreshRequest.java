package com.itc.book_store.dto;

public class TokenRefreshRequest {
    private String refreshToken;

    public TokenRefreshRequest() {}

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
