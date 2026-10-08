package com.internship.skilltracker.repository;

import com.internship.skilltracker.entity.LearningGoal;
import com.internship.skilltracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningGoalRepository extends JpaRepository<LearningGoal, Long> {
    List<LearningGoal> findByUser(User user);
}
