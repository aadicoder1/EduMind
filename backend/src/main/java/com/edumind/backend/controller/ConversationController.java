package com.edumind.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edumind.backend.model.ChatMessage;
import com.edumind.backend.model.Conversation;
import com.edumind.backend.model.User;
import com.edumind.backend.service.ConversationService;
// ✅ Removed unused: import com.edumind.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;
    // ✅ Removed unused: @Autowired private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }

    // Create new conversation — body: { "noteId": "...", "title": "..." }
    @PostMapping
    public ResponseEntity<Conversation> createConversation(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Conversation conversation = conversationService.createConversation(
                body.get("noteId"), body.get("title"), user);
        return ResponseEntity.ok(conversation);
    }

    // Get all conversations for sidebar
    @GetMapping
    public ResponseEntity<List<Conversation>> getUserConversations(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(conversationService.getUserConversations(user));
    }

    // Get one conversation with all messages
    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversation(
            @PathVariable String id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(conversationService.getConversation(id, user));
    }

    // Delete conversation
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable String id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        conversationService.deleteConversation(id, user);
        return ResponseEntity.noContent().build();
    }

    // Rename conversation — body: { "title": "new name" }
    @PatchMapping("/{id}/title")
    public ResponseEntity<Conversation> renameConversation(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(
                conversationService.renameConversation(id, body.get("title"), user));
    }

    // Send message — body: { "question": "..." }
    @PostMapping("/{id}/message")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(
                conversationService.sendMessage(id, body.get("question"), user));
    }
}