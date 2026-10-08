package com.internship.skilltracker.repository;

import com.internship.skilltracker.entity.CareerRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CareerRoleRepository extends JpaRepository<CareerRole, Long> {
    List<CareerRole> findAllByActiveTrueOrderByNameAsc();
    List<CareerRole> findAllByOrderByNameAsc();
    Optional<CareerRole> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}