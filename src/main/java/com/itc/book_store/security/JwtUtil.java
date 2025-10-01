package com.itc.book_store.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.*;
import java.util.Base64;
import java.util.Date;

import java.util.List;
import java.util.Map;
import java.util.HashMap;


@Component
public class JwtUtil {

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;

    @Value("${jwt.private-key-path}")
    private Resource privateKeyResource;

    @Value("${jwt.public-key-path}")
    private Resource publicKeyResource;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @PostConstruct
    public void loadKeys() throws Exception {
        // Load Private Key
        try (InputStream is = privateKeyResource.getInputStream()) {
            String privateKeyPEM = new String(is.readAllBytes())
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.privateKey = (RSAPrivateKey) kf.generatePrivate(spec);
        }

        // Load Public Key
        try (InputStream is = publicKeyResource.getInputStream()) {
            String publicKeyPEM = new String(is.readAllBytes())
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] keyBytes = Base64.getDecoder().decode(publicKeyPEM);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.publicKey = (RSAPublicKey) kf.generatePublic(spec);
        }
    }

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);  // single role

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(privateKey, SignatureAlgorithm.RS384)
                .compact();
    }


    public String generateRefreshToken(String username) {
        long refreshExpirationMs = 60 * 60 * 1000; // 1 hour
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(privateKey, SignatureAlgorithm.RS384)
                .compact();
    }

    public String validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ✅ Add this getter
    public long getExpirationMs() {
        return expirationMs;
    }
}


