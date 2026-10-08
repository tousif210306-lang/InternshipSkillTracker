package com.internship.skilltracker.repository;

import com.internship.skilltracker.entity.InternshipApplication;
import com.internship.skilltracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {
    List<InternshipApplication> findByUser(User user);
}
