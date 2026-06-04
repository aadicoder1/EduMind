package com.edumind.backend.repository;

import com.edumind.backend.model.AiOutput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AiOutputRepository extends JpaRepository<AiOutput, String> {
    // Find existing output by note and type to avoid regenerating
    Optional<AiOutput> findByNoteIdAndType(String noteId, String type);
    List<AiOutput> findByNoteId(String noteId);
}