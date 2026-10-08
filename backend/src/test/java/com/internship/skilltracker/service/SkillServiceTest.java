package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.Skill;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.SkillRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {
    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SkillService skillService;

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doesNotDeleteAnotherUsersSkill() {
        User owner = new User();
        owner.setId(1L);
        Skill skill = new Skill();
        skill.setId(7L);
        skill.setUser(owner);

        User signedInUser = new User();
        signedInUser.setId(2L);
        signedInUser.setEmail("student@example.invalid");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@example.invalid", "n/a"));
        when(skillRepository.findById(7L)).thenReturn(Optional.of(skill));
        when(userRepository.findByEmail("student@example.invalid")).thenReturn(Optional.of(signedInUser));

        assertThrows(ResourceNotFoundException.class, () -> skillService.deleteSkill(7L));
        verify(skillRepository, never()).delete(skill);
    }
}
