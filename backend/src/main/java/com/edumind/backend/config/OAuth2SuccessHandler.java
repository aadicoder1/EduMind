package com.edumind.backend.config;

import com.edumind.backend.model.User;
import com.edumind.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // Get Google user data directly from authentication object
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        // Save or fetch user from DB
        User user = userService.processOAuthUser(oauth2User);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        // Send JSON response with token
        response.setContentType("application/json");
        response.getWriter().write(
            objectMapper.writeValueAsString(Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
                )
            ))
        );
    }
}