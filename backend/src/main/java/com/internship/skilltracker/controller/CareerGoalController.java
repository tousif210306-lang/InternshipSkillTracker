package com.internship.skilltracker.controller;

import com.internship.skilltracker.dto.CareerGoalDto;
import com.internship.skilltracker.dto.CareerGoalUpdateRequest;
import com.internship.skilltracker.service.CareerGoalService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/career-goal")
public class CareerGoalController {
    private final CareerGoalService careerGoalService;

    public CareerGoalController(CareerGoalService careerGoalService) {
        this.careerGoalService = careerGoalService;
    }

    @GetMapping
    public ResponseEntity<CareerGoalDto> getCareerGoal() {
        return ResponseEntity.ok(careerGoalService.getMyCareerGoal());
    }

    @PutMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CareerGoalDto> selectCareerGoal(@Valid @RequestBody CareerGoalUpdateRequest request) {
        return ResponseEntity.ok(careerGoalService.selectCareerGoal(request.getCareerRoleId()));
    }
}