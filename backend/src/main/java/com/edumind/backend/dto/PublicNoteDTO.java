package com.edumind.backend.dto;

import java.time.LocalDateTime;

public class PublicNoteDTO {

    private String id;
    private String title;
    private String fileUrl;
    private String fileType;
    private LocalDateTime uploadedAt;
    private String ownerName;
    private String subjectName;

    public PublicNoteDTO(String id, String title, String fileUrl,
                         String fileType, LocalDateTime uploadedAt,
                         String ownerName, String subjectName) {
        this.id = id;
        this.title = title;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.uploadedAt = uploadedAt;
        this.ownerName = ownerName;
        this.subjectName = subjectName;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getFileUrl() { return fileUrl; }
    public String getFileType() { return fileType; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getOwnerName() { return ownerName; }
    public String getSubjectName() { return subjectName; }
}