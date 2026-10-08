package com.internship.skilltracker.controller;

import com.internship.skilltracker.dto.CareerRoleDto;
import com.internship.skilltracker.dto.CareerRoleRequest;
import com.internship.skilltracker.service.CareerRoleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CareerRolesController {
    private final CareerRoleService careerRoleService;

    public CareerRolesController(CareerRoleService careerRoleService) {
        this.careerRoleService = careerRoleService;
    }

    @GetMapping("/career-roles")
    public ResponseEntity<List<CareerRoleDto>> getAvailableRoles() {
        return ResponseEntity.ok(careerRoleService.getAvailableRoles());
    }

    @GetMapping("/admin/career-roles")
    public ResponseEntity<List<CareerRoleDto>> getAllRoles() {
        return ResponseEntity.ok(careerRoleService.getAllRoles());
    }

    @PostMapping("/admin/career-roles")
    public ResponseEntity<CareerRoleDto> createRole(@Valid @RequestBody CareerRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(careerRoleService.createRole(request));
    }

    @PutMapping("/admin/career-roles/{id}")
    public ResponseEntity<CareerRoleDto> updateRole(@PathVariable Long id, @Valid @RequestBody CareerRoleRequest request) {
        return ResponseEntity.ok(careerRoleService.updateRole(id, request));
    }

    @DeleteMapping("/admin/career-roles/{id}")
    public ResponseEntity<Void> deactivateRole(@PathVariable Long id) {
        careerRoleService.deactivateRole(id);
        return ResponseEntity.noContent().build();
    }
}