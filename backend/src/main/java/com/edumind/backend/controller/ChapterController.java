package com.edumind.backend.controller;

import com.edumind.backend.model.Chapter;
import com.edumind.backend.service.ChapterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chapters")
public class ChapterController {

    @Autowired
    private ChapterService chapterService;

    @PostMapping
    public ResponseEntity<Chapter> createChapter(
            @RequestBody Map<String, Object> body) {
        Chapter chapter = chapterService.createChapter(
            (String) body.get("name"),
            (Integer) body.get("orderIndex"),
            (String) body.get("subjectId")
        );
        return ResponseEntity.ok(chapter);
    }

    @GetMapping("/{subjectId}")
    public ResponseEntity<List<Chapter>> getChapters(
            @PathVariable String subjectId) {
        return ResponseEntity.ok(
            chapterService.getChaptersBySubject(subjectId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChapter(@PathVariable String id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.ok().build();
    }
}
