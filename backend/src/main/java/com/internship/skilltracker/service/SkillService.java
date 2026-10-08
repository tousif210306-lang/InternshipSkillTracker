package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.Skill;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.SkillRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SkillService {
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public SkillService(SkillRepository skillRepository, UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    public List<Skill> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return skillRepository.findByUser(user);
    }

    public Skill saveSkill(Skill skill) {
        User user = currentUser();
        skill.setId(null);
        skill.setUser(user);
        return skillRepository.save(skill);
    }

    public Skill updateSkill(Long id, Skill values) {
        Skill skill = ownedSkill(id);
        skill.setName(values.getName());
        skill.setCategory(values.getCategory());
        skill.setProficiency(values.getProficiency());
        skill.setYearsOfExperience(values.getYearsOfExperience());
        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id) {
        skillRepository.delete(ownedSkill(id));
    }

    private Skill ownedSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        if (!skill.getUser().getId().equals(currentUser().getId())) {
            throw new ResourceNotFoundException("Skill not found");
        }
        return skill;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
