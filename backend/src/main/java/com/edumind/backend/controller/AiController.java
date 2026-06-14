package com.edumind.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edumind.backend.model.AiOutput;
import com.edumind.backend.repository.AiOutputRepository;
import com.edumind.backend.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private AiOutputRepository aiOutputRepository;

    @PostMapping("/summarize/{noteId}")
    public ResponseEntity<AiOutput> summarize(@PathVariable String noteId) {
        return ResponseEntity.ok(aiService.summarize(noteId));
    }

    @PostMapping("/flashcards/{noteId}")
    public ResponseEntity<AiOutput> flashcards(@PathVariable String noteId) {
        return ResponseEntity.ok(aiService.generateFlashcards(noteId));
    }

    // Force regenerate — deletes cache and re-calls Groq
    @PostMapping("/summarize/{noteId}/regenerate")
    public ResponseEntity<AiOutput> regenerateSummary(@PathVariable String noteId) {
        aiOutputRepository.findByNoteIdAndType(noteId, "SUMMARY")
            .ifPresent(aiOutputRepository::delete);
        return ResponseEntity.ok(aiService.summarize(noteId));
    }

    @PostMapping("/flashcards/{noteId}/regenerate")
    public ResponseEntity<AiOutput> regenerateFlashcards(@PathVariable String noteId) {
        aiOutputRepository.findByNoteIdAndType(noteId, "FLASHCARD")
            .ifPresent(aiOutputRepository::delete);
        return ResponseEntity.ok(aiService.generateFlashcards(noteId));
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("AI controller is working");
    }
}