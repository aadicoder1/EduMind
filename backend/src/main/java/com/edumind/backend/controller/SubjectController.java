package com.edumind.backend.controller;

import com.edumind.backend.model.Subject;
import com.edumind.backend.model.User;
import com.edumind.backend.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping
    public ResponseEntity<Subject> createSubject(
        @RequestBody Map<String, String> body,
        Authentication authentication) {
            User user = (User) authentication.getPrincipal();
            Subject subject = subjectService.createSubject(
                body.get("name"),
                body.get("semester"),
                user
            );
        return ResponseEntity.ok(subject);
    }

        @GetMapping
    public ResponseEntity<List<Subject>> getMySubjects(
        Authentication authentication) {
    User user = (User) authentication.getPrincipal();
    return ResponseEntity.ok(subjectService.getMySubjects(user));
}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable String id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok().build();
    }
}