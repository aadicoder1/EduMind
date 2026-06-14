package com.edumind.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edumind.backend.model.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
    List<Subject> findByUserId(String userId);
    Optional<Subject> findByNameAndUserId(String name, String userId);
}