package com.internship.skilltracker.dto;

import com.internship.skilltracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record InternshipApplicationRequest(
        @NotBlank String jobTitle,
        @NotNull Long companyId,
        @NotNull LocalDate applicationDate,
        ApplicationStatus status,
        String internshipType,
        LocalDate interviewDate,
        String applicationUrl,
        String notes
) {}
