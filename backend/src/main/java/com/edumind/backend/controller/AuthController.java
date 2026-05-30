package com.edumind.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edumind.backend.config.JwtUtil;
import com.edumind.backend.model.User;
import com.edumind.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/success")
    public Map<String, Object> authSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        // Save or fetch user from DB
        User user = userService.processOAuthUser(oauth2User);

        // Generate JWT token for this user
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        // Return token + user info to frontend
        return Map.of(
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
            )
        );
    }

    @GetMapping("/failure")
    public Map<String, String> authFailure() {
        return Map.of("message", "Login failed. Please try again.");
    }
}