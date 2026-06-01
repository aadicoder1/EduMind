package com.edumind.backend.service;

import com.edumind.backend.model.Chapter;
import com.edumind.backend.model.Subject;
import com.edumind.backend.repository.ChapterRepository;
import com.edumind.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChapterService {

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public Chapter createChapter(String name, Integer orderIndex,
                                  String subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Chapter chapter = new Chapter();
        chapter.setName(name);
        chapter.setOrderIndex(orderIndex);
        chapter.setSubject(subject);
        return chapterRepository.save(chapter);
    }

    public List<Chapter> getChaptersBySubject(String subjectId) {
        return chapterRepository.findBySubjectId(subjectId);
    }

    public void deleteChapter(String chapterId) {
        chapterRepository.deleteById(chapterId);
    }
}