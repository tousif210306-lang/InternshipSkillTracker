package com.internship.skilltracker.service;

import com.internship.skilltracker.dto.CareerRoleDto;
import com.internship.skilltracker.dto.CareerRoleRequest;
import com.internship.skilltracker.entity.CareerRole;
import com.internship.skilltracker.entity.Department;
import com.internship.skilltracker.exception.ConflictException;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.CareerRoleRepository;
import com.internship.skilltracker.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CareerRoleService {
    private final CareerRoleRepository careerRoleRepository;
    private final DepartmentRepository departmentRepository;

    public CareerRoleService(CareerRoleRepository careerRoleRepository, DepartmentRepository departmentRepository) {
        this.careerRoleRepository = careerRoleRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<CareerRoleDto> getAvailableRoles() {
        return careerRoleRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CareerRoleDto> getAllRoles() {
        return careerRoleRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CareerRoleDto createRole(CareerRoleRequest request) {
        String name = request.getName().trim();
        if (careerRoleRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("A career role with this name already exists");
        }
        CareerRole role = new CareerRole();
        applyRequest(role, request, name);
        return toDto(careerRoleRepository.save(role));
    }

    @Transactional
    public CareerRoleDto updateRole(Long id, CareerRoleRequest request) {
        CareerRole role = careerRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found"));
        String name = request.getName().trim();
        CareerRole duplicate = careerRoleRepository.findByNameIgnoreCase(name).orElse(null);
        if (duplicate != null && !duplicate.getId().equals(id)) {
            throw new ConflictException("A career role with this name already exists");
        }
        applyRequest(role, request, name);
        return toDto(careerRoleRepository.save(role));
    }

    @Transactional
    public void deactivateRole(Long id) {
        CareerRole role = careerRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found"));
        role.setActive(false);
        careerRoleRepository.save(role);
    }

    @Transactional(readOnly = true)
    public CareerRole getActiveRole(Long id) {
        CareerRole role = careerRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found"));
        if (!role.isActive()) {
            throw new ResourceNotFoundException("Career role is no longer available");
        }
        return role;
    }

    @Transactional(readOnly = true)
    public CareerRoleDto toDto(CareerRole role) {
        CareerRoleDto dto = new CareerRoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setDepartmentId(role.getDepartment().getId());
        dto.setDepartmentCode(role.getDepartment().getCode());
        dto.setDepartmentName(role.getDepartment().getName());
        dto.setSkillsPreview(List.copyOf(role.getSkillsPreview()));
        dto.setActive(role.isActive());
        return dto;
    }

    private void applyRequest(CareerRole role, CareerRoleRequest request, String name) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (!department.isActive()) {
            throw new ResourceNotFoundException("Department is no longer available");
        }
        role.setName(name);
        role.setDescription(request.getDescription().trim());
        role.setDepartment(department);
        role.setSkillsPreview(request.getSkillsPreview() == null ? List.of() :
                request.getSkillsPreview().stream().map(String::trim).filter(value -> !value.isEmpty()).distinct().toList());
        if (request.getActive() != null) {
            role.setActive(request.getActive());
        }
    }
}