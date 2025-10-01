    package com.itc.book_store.security;

    import com.itc.book_store.services.impl.CustomUserDetailsService;
    import io.jsonwebtoken.ExpiredJwtException;
    import io.jsonwebtoken.JwtException;
    import jakarta.servlet.FilterChain;
    import jakarta.servlet.ServletException;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
    import org.springframework.stereotype.Component;
    import org.springframework.web.filter.OncePerRequestFilter;

    import java.io.IOException;

    @Component
    public class JwtAuthenticationFilter extends OncePerRequestFilter {

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private CustomUserDetailsService userDetailsService;

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
            String path = request.getServletPath();
            return path.equals("/api/auth/login") ||
                    path.equals("/api/users/register") ||
                    path.equals("/api/users/reset-password") ||
                    path.equals("/api/users/verify-email") ||
                    path.startsWith("/api/public/") ||
                    path.startsWith("/api/books/") ||
                    path.startsWith("/ws/") ;// <-- exclude websocket handshake
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain)
                throws ServletException, IOException {

            System.out.println(">>> JwtAuthenticationFilter triggered on: " + request.getRequestURI());

            String token = null;
            String username = null;

            // 1. First, check the Authorization header
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                token = header.substring(7);
                System.out.println(">>> Token found in Authorization header");
            }

            // 2. If not in header, check cookies
            if (token == null && request.getCookies() != null) {
                for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                    if ("accessToken".equals(cookie.getName())) {
                        token = cookie.getValue();
                        System.out.println(">>> Token found in Cookie");
                        break;
                    }
                }
            }

            // 3. Validate the token
            if (token != null) {
                try {
                    username = jwtUtil.validateToken(token);
                    System.out.println(">>> JWT valid, username: " + username);
                } catch (ExpiredJwtException ex) {
                    System.out.println(">>> JWT expired: " + ex.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
                    return;
                } catch (JwtException ex) {
                    System.out.println(">>> JWT invalid: " + ex.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                    return;
                }
            }

            // 4. Set authentication if valid
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println(">>> Authentication set for: " + username);
            }

            filterChain.doFilter(request, response);
        }
    }
