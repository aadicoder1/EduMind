package com.edumind.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.edumind.backend.dto.PublicNoteDTO;
import com.edumind.backend.model.Chapter;
import com.edumind.backend.model.Note;
import com.edumind.backend.model.User;
import com.edumind.backend.repository.ChapterRepository;
import com.edumind.backend.repository.NoteRepository;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private TextExtractionService textExtractionService;

    public Note uploadNote(MultipartFile file, String title,
                           String chapterId, User user) throws IOException {

        // Step 1 — Upload file to Supabase Storage, get URL back
        String fileUrl = storageService.uploadFile(file);

        // Step 2 — Extract text from the file
        String rawText = textExtractionService.extractText(file);

        // Step 3 — Find the chapter this note belongs to
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));

        // Step 4 — Save note to database
        Note note = new Note();
        note.setTitle(title);
        note.setFileUrl(fileUrl);
        note.setFileType(file.getContentType());
        note.setRawText(rawText);
        note.setChapter(chapter);
        note.setUser(user);
        note.setIsPublic(false);

        return noteRepository.save(note);
    }

    public List<Note> getNotesByChapter(String chapterId) {
        return noteRepository.findByChapterId(chapterId);
    }

    // ✅ Fixed: now returns List<PublicNoteDTO> to match NoteController signature
    public List<PublicNoteDTO> getPublicNotes() {
        return noteRepository.findByIsPublicTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Note toggleVisibility(String noteId, User user) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        // Only owner can toggle visibility
        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        note.setIsPublic(!note.getIsPublic());
        return noteRepository.save(note);
    }

    // Shared DTO mapper — used by getPublicNotes()
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