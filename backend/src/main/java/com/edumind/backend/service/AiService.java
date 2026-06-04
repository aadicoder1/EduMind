package com.edumind.backend.service;

import com.edumind.backend.model.AiOutput;
import com.edumind.backend.model.Note;
import com.edumind.backend.repository.AiOutputRepository;
import com.edumind.backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private AiOutputRepository aiOutputRepository;

    @Autowired
    private GroqService groqService;

    // Generate summary — checks if already exists first
    public AiOutput summarize(String noteId) {
        // If summary already generated, return cached version
        return aiOutputRepository.findByNoteIdAndType(noteId, "SUMMARY")
            .orElseGet(() -> {
                Note note = getNoteOrThrow(noteId);
                String summary = groqService.summarize(note.getRawText());
                return saveOutput(note, "SUMMARY", summary);
            });
    }

    // Generate flashcards — checks if already exists first
    public AiOutput generateFlashcards(String noteId) {
        return aiOutputRepository.findByNoteIdAndType(noteId, "FLASHCARD")
            .orElseGet(() -> {
                Note note = getNoteOrThrow(noteId);
                String flashcards = groqService.generateFlashcards(note.getRawText());
                return saveOutput(note, "FLASHCARD", flashcards);
            });
    }

    // Chat — always generates fresh response
    public AiOutput chat(String noteId, String question) {
        Note note = getNoteOrThrow(noteId);
        String answer = groqService.chat(note.getRawText(), question);

        // Save chat message to ai_outputs with question included
        AiOutput chatOutput = new AiOutput();
        chatOutput.setNote(note);
        chatOutput.setType("CHAT");
        chatOutput.setContent("Q: " + question + "\nA: " + answer);
        return aiOutputRepository.save(chatOutput);
    }

    // Helper — fetch note or throw error
    private Note getNoteOrThrow(String noteId) {
        return noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
    }

    // Helper — save AI output to database
    private AiOutput saveOutput(Note note, String type, String content) {
        AiOutput output = new AiOutput();
        output.setNote(note);
        output.setType(type);
        output.setContent(content);
        return aiOutputRepository.save(output);
    }
}