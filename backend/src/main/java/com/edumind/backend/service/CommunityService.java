package com.edumind.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edumind.backend.dto.PublicNoteDTO;
import com.edumind.backend.model.Note;
import com.edumind.backend.repository.NoteRepository;

@Service
public class CommunityService {

    @Autowired
    private NoteRepository noteRepository;

    public List<PublicNoteDTO> getAllPublicNotes() {
        return noteRepository.findByIsPublicTrue()   // ✅ was findByPublicNoteTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PublicNoteDTO getPublicNote(String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        if (!note.getIsPublic()) {                   // ✅ was note.getPublicNote()
            throw new RuntimeException("Note is not public");
        }
        return toDTO(note);
    }

    // Throws if note is not public — used before allowing community chat
    public void verifyNoteIsPublic(String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        if (!note.getIsPublic()) {                   // ✅ was note.getPublicNote()
            throw new RuntimeException("Note is not public");
        }
    }

    private PublicNoteDTO toDTO(Note note) {
        return new PublicNoteDTO(
                note.getId(),
                note.getTitle(),
                note.getFileUrl(),
                note.getFileType(),
                note.getUploadedAt(),
                note.getUser().getName(),
                note.getChapter().getSubject().getName()
        );
    }
}