package com.edumind.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.edumind.backend.dto.PublicNoteDTO;
import com.edumind.backend.model.Note;
import com.edumind.backend.model.User;
import com.edumind.backend.service.NoteService;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadNote(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("chapterId") String chapterId,
            Authentication authentication) throws IOException {
        User user = (User) authentication.getPrincipal();
        Note note = noteService.uploadNote(file, title, chapterId, user);
        return ResponseEntity.ok(note);
    }

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<List<Note>> getNotesByChapter(@PathVariable String chapterId) {
        return ResponseEntity.ok(noteService.getNotesByChapter(chapterId));
    }
    @GetMapping("/public")
    public ResponseEntity<List<PublicNoteDTO>> getPublicNotes() {
        List<PublicNoteDTO> result = noteService.getPublicNotes();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{noteId}/visibility")
    public ResponseEntity<Note> toggleVisibility(
            @PathVariable String noteId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(noteService.toggleVisibility(noteId, user));
    }
}