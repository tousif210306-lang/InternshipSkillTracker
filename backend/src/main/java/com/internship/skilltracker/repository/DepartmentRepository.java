package com.internship.skilltracker.repository;

import com.internship.skilltracker.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findAllByActiveTrueOrderByNameAsc();
    Optional<Department> findByCodeIgnoreCase(String code);
}