package com.edumind.backend.service;

import com.edumind.backend.model.Subject;
import com.edumind.backend.model.User;
import com.edumind.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public Subject createSubject(String name, String semester, User user) {
        Subject subject = new Subject();
        subject.setName(name);
        subject.setSemester(semester);
        subject.setUser(user);
        return subjectRepository.save(subject);
    }

    public List<Subject> getMySubjects(User user) {
        return subjectRepository.findByUserId(user.getId());
    }

    public void deleteSubject(String subjectId) {
        subjectRepository.deleteById(subjectId);
    }
}