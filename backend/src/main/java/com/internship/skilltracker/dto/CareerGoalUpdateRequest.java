package com.internship.skilltracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CareerGoalUpdateRequest {
    @NotNull
    @Positive
    private Long careerRoleId;

    public Long getCareerRoleId() { return careerRoleId; }
    public void setCareerRoleId(Long careerRoleId) { this.careerRoleId = careerRoleId; }
}