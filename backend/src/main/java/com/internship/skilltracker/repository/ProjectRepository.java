package com.internship.skilltracker.repository;

import com.internship.skilltracker.entity.Project;
import com.internship.skilltracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUser(User user);
}
