package com.edumind.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edumind.backend.model.User;
import com.edumind.backend.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/me")
    public ResponseEntity<Map<String, Object>> getMe(Authentication authentication) {
        User principal = (User) authentication.getPrincipal();

        // Re-fetch from DB so we always get latest course/year/semester
        User user = userRepository.findById(principal.getId()).orElse(principal);

        // Use HashMap instead of Map.of() — Map.of() has a 10 key limit
        Map<String, Object> response = new HashMap<>();
        response.put("id",              user.getId());
        response.put("name",            user.getName());
        response.put("email",           user.getEmail());
        response.put("picture",         user.getProfilePicture() != null ? user.getProfilePicture() : "");
        response.put("course",          user.getCourse()   != null ? user.getCourse()   : "");
        response.put("year",            user.getYear()     != null ? user.getYear()     : "");
        response.put("semester",        user.getSemester() != null ? user.getSemester() : "");
        response.put("profileComplete", user.getCourse()   != null && !user.getCourse().isEmpty());

        return ResponseEntity.ok(response);
    }
}