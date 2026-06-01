package com.edumind.backend.repository;

import com.edumind.backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findByChapterId(String chapterId);
    List<Note> findByIsPublicTrue();
    List<Note> findByUserId(String userId);
}