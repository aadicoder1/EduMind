package com.edumind.backend.controller;

import com.edumind.backend.dto.PublicNoteDTO;
import com.edumind.backend.model.AiOutput;
import com.edumind.backend.model.Conversation;
import com.edumind.backend.model.User;
import com.edumind.backend.service.AiService;
import com.edumind.backend.service.CommunityService;
import com.edumind.backend.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private AiService aiService;

    @Autowired
    private ConversationService conversationService;

    // Browse all public notes — no auth needed
    @GetMapping("/notes")
    public ResponseEntity<List<PublicNoteDTO>> getPublicNotes() {
        return ResponseEntity.ok(communityService.getAllPublicNotes());
    }

    // Get a single public note's details
    @GetMapping("/notes/{noteId}")
    public ResponseEntity<PublicNoteDTO> getPublicNote(@PathVariable String noteId) {
        return ResponseEntity.ok(communityService.getPublicNote(noteId));
    }

    // Get cached summary of a public note
    @GetMapping("/notes/{noteId}/summary")
    public ResponseEntity<AiOutput> getSummary(@PathVariable String noteId) {
        return ResponseEntity.ok(aiService.summarize(noteId));
    }

    // Get cached flashcards of a public note
    @GetMapping("/notes/{noteId}/flashcards")
    public ResponseEntity<AiOutput> getFlashcards(@PathVariable String noteId) {
        return ResponseEntity.ok(aiService.generateFlashcards(noteId));
    }

    // Start own conversation from someone else's public note
    @PostMapping("/notes/{noteId}/chat")
    public ResponseEntity<Conversation> startChat(
            @PathVariable String noteId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        // Verify note is public before allowing chat
        communityService.verifyNoteIsPublic(noteId);
        Conversation conversation = conversationService.createConversation(
                noteId, body.get("title"), user);
        return ResponseEntity.ok(conversation);
    }
}