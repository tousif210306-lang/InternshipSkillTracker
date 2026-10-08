package com.internship.skilltracker.controller;

import com.internship.skilltracker.dto.InternshipApplicationRequest;
import com.internship.skilltracker.entity.InternshipApplication;
import com.internship.skilltracker.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationsController {
    private final ApplicationService applicationService;

    public ApplicationsController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/applications")
    public ResponseEntity<List<InternshipApplication>> getApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @PostMapping("/applications")
    public ResponseEntity<InternshipApplication> createApplication(
            @Valid @RequestBody InternshipApplicationRequest request) {
        return ResponseEntity.ok(applicationService.saveApplication(request));
    }

    @PutMapping("/applications/{id}")
    public ResponseEntity<InternshipApplication> updateApplication(
            @PathVariable Long id, @Valid @RequestBody InternshipApplicationRequest request) {
        return ResponseEntity.ok(applicationService.updateApplication(id, request));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
