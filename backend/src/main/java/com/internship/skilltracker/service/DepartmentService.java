package com.internship.skilltracker.service;

import com.internship.skilltracker.dto.DepartmentDto;
import com.internship.skilltracker.entity.Department;
import com.internship.skilltracker.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    public DepartmentDto toDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setCode(department.getCode());
        dto.setName(department.getName());
        return dto;
    }
}