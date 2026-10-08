package com.internship.skilltracker.service;

import com.internship.skilltracker.dto.CareerGoalDto;
import com.internship.skilltracker.entity.CareerRole;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CareerGoalService {
    private final UserRepository userRepository;
    private final CareerRoleService careerRoleService;

    public CareerGoalService(UserRepository userRepository, CareerRoleService careerRoleService) {
        this.userRepository = userRepository;
        this.careerRoleService = careerRoleService;
    }

    @Transactional(readOnly = true)
    public CareerGoalDto getMyCareerGoal() {
        User user = getCurrentUser();
        CareerGoalDto dto = new CareerGoalDto();
        if (user.getCareerRole() != null) {
            dto.setSelectedCareerGoal(careerRoleService.toDto(user.getCareerRole()));
        }
        return dto;
    }

    @Transactional
    public CareerGoalDto selectCareerGoal(Long careerRoleId) {
        User user = getCurrentUser();
        CareerRole careerRole = careerRoleService.getActiveRole(careerRoleId);
        user.setCareerRole(careerRole);
        userRepository.save(user);

        CareerGoalDto dto = new CareerGoalDto();
        dto.setSelectedCareerGoal(careerRoleService.toDto(careerRole));
        return dto;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}