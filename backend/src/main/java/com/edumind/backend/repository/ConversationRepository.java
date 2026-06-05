package com.edumind.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edumind.backend.model.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    // All conversations for a user — newest first for sidebar
    List<Conversation> findByUserIdOrderByCreatedAtDesc(String userId);
    // All conversations on a specific note by a specific user
    List<Conversation> findByNoteIdAndUserId(String noteId, String userId);
    // Safety check — make sure conversation belongs to user before any action
    Optional<Conversation> findByIdAndUserId(String id, String userId);
}