package com.edumind.backend.service;

import com.edumind.backend.model.ChatMessage;
import com.edumind.backend.model.Conversation;
import com.edumind.backend.model.Note;
import com.edumind.backend.model.User;
import com.edumind.backend.repository.ChatMessageRepository;
import com.edumind.backend.repository.ConversationRepository;
import com.edumind.backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private GroqService groqService;

    // Create a new named conversation tied to a note
    public Conversation createConversation(String noteId, String title, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));

        Conversation conversation = new Conversation();
        conversation.setNote(note);
        conversation.setUser(user);
        conversation.setTitle(title);
        return conversationRepository.save(conversation);
    }

    // All conversations for sidebar — newest first
    public List<Conversation> getUserConversations(User user) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    // Single conversation with all messages
    public Conversation getConversation(String conversationId, User user) {
        return conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
    }

    // Delete conversation + all its messages (cascade handles messages)
    public void deleteConversation(String conversationId, User user) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conversationRepository.delete(conversation);
    }

    // Rename conversation
    public Conversation renameConversation(String conversationId, String newTitle, User user) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conversation.setTitle(newTitle);
        return conversationRepository.save(conversation);
    }

    // Send a message and get AI reply
    public ChatMessage sendMessage(String conversationId, String userQuestion, User user) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Save the user's message first
        ChatMessage userMessage = new ChatMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole("USER");
        userMessage.setContent(userQuestion);
        chatMessageRepository.save(userMessage);

        // Load last 6 messages for context (so AI remembers the thread)
        List<ChatMessage> recentMessages =
                chatMessageRepository.findTop6ByConversationIdOrderByCreatedAtAsc(conversationId);

        // Build context string from recent messages
        StringBuilder contextBuilder = new StringBuilder();
        for (ChatMessage msg : recentMessages) {
            contextBuilder.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
        }

        // Get note's raw text for grounding the AI
        String noteText = conversation.getNote().getRawText();

        // Call Groq with full context
        String aiReply = groqService.chatWithContext(noteText, contextBuilder.toString(), userQuestion);

        // Save AI reply
        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setConversation(conversation);
        aiMessage.setRole("AI");
        aiMessage.setContent(aiReply);
        return chatMessageRepository.save(aiMessage);
    }
}