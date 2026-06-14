package com.edumind.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edumind.backend.model.User;
import com.edumind.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // GET — returns full user object for profile page
    @GetMapping
    public ResponseEntity<User> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        // Re-fetch from DB to get latest data
        return userRepository.findById(user.getId())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // PUT — update course/year/semester
    @PutMapping("/setup")
    public ResponseEntity<Map<String, String>> setup(
            Authentication authentication,
            @RequestBody Map<String, String> body) {

        User user = (User) authentication.getPrincipal();
        user.setCourse(body.get("course"));
        user.setYear(body.get("year"));
        user.setSemester(body.get("semester"));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }
}