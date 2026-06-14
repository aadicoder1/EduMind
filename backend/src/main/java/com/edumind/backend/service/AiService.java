package com.edumind.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edumind.backend.model.AiOutput;
import com.edumind.backend.model.Note;
import com.edumind.backend.repository.AiOutputRepository;
import com.edumind.backend.repository.NoteRepository;

@Service
public class AiService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private AiOutputRepository aiOutputRepository;

    @Autowired
    private GroqService groqService;

    public AiOutput summarize(String noteId) {
        // Check cache — but skip if cached content is blank/garbage
        return aiOutputRepository.findByNoteIdAndType(noteId, "SUMMARY")
            .filter(existing -> existing.getContent() != null && existing.getContent().trim().length() > 20)
            .orElseGet(() -> {
                // Delete stale cache if exists
                aiOutputRepository.findByNoteIdAndType(noteId, "SUMMARY")
                    .ifPresent(aiOutputRepository::delete);
                Note note = getNoteOrThrow(noteId);
                String summary = groqService.summarize(note.getRawText());
                return saveOutput(note, "SUMMARY", summary);
            });
    }

    public AiOutput generateFlashcards(String noteId) {
        return aiOutputRepository.findByNoteIdAndType(noteId, "FLASHCARD")
            .filter(existing -> existing.getContent() != null && existing.getContent().trim().length() > 20)
            .orElseGet(() -> {
                aiOutputRepository.findByNoteIdAndType(noteId, "FLASHCARD")
                    .ifPresent(aiOutputRepository::delete);
                Note note = getNoteOrThrow(noteId);
                String flashcards = groqService.generateFlashcards(note.getRawText());
                return saveOutput(note, "FLASHCARD", flashcards);
            });
    }

    private Note getNoteOrThrow(String noteId) {
        return noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
    }

    private AiOutput saveOutput(Note note, String type, String content) {
        AiOutput output = new AiOutput();
        output.setNote(note);
        output.setType(type);
        output.setContent(content);
        return aiOutputRepository.save(output);
    }
}