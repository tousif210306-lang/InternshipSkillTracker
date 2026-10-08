package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.LearningGoal;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.LearningGoalRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LearningGoalService {
    private final LearningGoalRepository learningGoalRepository;
    private final UserRepository userRepository;

    public LearningGoalService(LearningGoalRepository learningGoalRepository, UserRepository userRepository) {
        this.learningGoalRepository = learningGoalRepository;
        this.userRepository = userRepository;
    }

    public List<LearningGoal> getMyGoals() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return learningGoalRepository.findByUser(user);
    }

    public LearningGoal saveGoal(LearningGoal goal) {
        User user = currentUser();
        goal.setId(null);
        goal.setUser(user);
        return learningGoalRepository.save(goal);
    }

    public LearningGoal updateGoal(Long id, LearningGoal values) {
        LearningGoal goal = ownedGoal(id);
        goal.setTitle(values.getTitle());
        goal.setDescription(values.getDescription());
        goal.setTargetDate(values.getTargetDate());
        goal.setStatus(values.getStatus());
        return learningGoalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        learningGoalRepository.delete(ownedGoal(id));
    }

    private LearningGoal ownedGoal(Long id) {
        LearningGoal goal = learningGoalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning goal not found"));
        if (!goal.getUser().getId().equals(currentUser().getId())) {
            throw new ResourceNotFoundException("Learning goal not found");
        }
        return goal;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
