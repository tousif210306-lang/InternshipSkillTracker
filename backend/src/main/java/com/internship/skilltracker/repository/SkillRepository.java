package com.internship.skilltracker.repository;

import com.internship.skilltracker.entity.Skill;
import com.internship.skilltracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByUser(User user);
}
