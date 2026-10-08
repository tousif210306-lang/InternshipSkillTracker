package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.Project;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.ProjectRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<Project> getMyProjects() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return projectRepository.findByUser(user);
    }

    public Project saveProject(Project project) {
        User user = currentUser();
        project.setId(null);
        project.setUser(user);
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project values) {
        Project project = ownedProject(id);
        project.setTitle(values.getTitle());
        project.setDescription(values.getDescription());
        project.setTechnologies(values.getTechnologies());
        project.setGithubUrl(values.getGithubUrl());
        project.setLiveDemoUrl(values.getLiveDemoUrl());
        project.setStartDate(values.getStartDate());
        project.setEndDate(values.getEndDate());
        project.setStatus(values.getStatus());
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.delete(ownedProject(id));
    }

    private Project ownedProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getUser().getId().equals(currentUser().getId())) {
            throw new ResourceNotFoundException("Project not found");
        }
        return project;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
