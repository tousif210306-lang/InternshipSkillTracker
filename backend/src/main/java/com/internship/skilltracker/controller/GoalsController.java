package com.internship.skilltracker.controller;

import com.internship.skilltracker.entity.LearningGoal;
import com.internship.skilltracker.service.LearningGoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class GoalsController {
    private final LearningGoalService learningGoalService;

    public GoalsController(LearningGoalService learningGoalService) {
        this.learningGoalService = learningGoalService;
    }

    @GetMapping("/goals")
    public ResponseEntity<List<LearningGoal>> getGoals() {
        return ResponseEntity.ok(learningGoalService.getMyGoals());
    }

    @PostMapping("/goals")
    public ResponseEntity<LearningGoal> createGoal(@RequestBody LearningGoal goal) {
        return ResponseEntity.ok(learningGoalService.saveGoal(goal));
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<LearningGoal> updateGoal(@PathVariable Long id, @RequestBody LearningGoal goal) {
        return ResponseEntity.ok(learningGoalService.updateGoal(id, goal));
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        learningGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
