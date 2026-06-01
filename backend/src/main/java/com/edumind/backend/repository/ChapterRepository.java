package com.edumind.backend.repository;

import com.edumind.backend.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, String> {
    List<Chapter> findBySubjectId(String subjectId);
}