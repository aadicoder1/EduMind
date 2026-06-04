package com.edumind.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edumind.backend.model.AiOutput;
import com.edumind.backend.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    // Generate summary from note
    @PostMapping("/summarize/{noteId}")
    public ResponseEntity<AiOutput> summarize(@PathVariable String noteId) {
        return ResponseEntity.ok(aiService.summarize(noteId));
    }

    // Generate flashcards from note
    @PostMapping("/flashcards/{noteId}")
    public ResponseEntity<AiOutput> flashcards(@PathVariable String noteId) {
        return ResponseEntity.ok(aiService.generateFlashcards(noteId));
    }

    // Chat with note — requires question in request body
    @PostMapping("/chat/{noteId}")
    public ResponseEntity<AiOutput> chat(
            @PathVariable String noteId,
            @RequestBody Map<String, String> body) {
        String question = body.get("question");
        return ResponseEntity.ok(aiService.chat(noteId, question));
    }
    
    @GetMapping("/test")
public ResponseEntity<String> test() {
    return ResponseEntity.ok("AI controller is working");
}
}