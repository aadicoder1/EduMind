package com.edumind.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edumind.backend.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    // Last N messages for context window — ordered oldest first
    List<ChatMessage> findTop6ByConversationIdOrderByCreatedAtAsc(String conversationId);
    // All messages in a conversation for display
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}