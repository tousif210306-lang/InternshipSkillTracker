package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.*;
import com.internship.skilltracker.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final InternshipApplicationRepository applicationRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(UserRepository userRepository,
                           SkillRepository skillRepository,
                           ProjectRepository projectRepository,
                           CompanyRepository companyRepository,
                           InternshipApplicationRepository applicationRepository,
                           LearningGoalRepository learningGoalRepository,
                           TaskRepository taskRepository,
                           NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.companyRepository = companyRepository;
        this.applicationRepository = applicationRepository;
        this.learningGoalRepository = learningGoalRepository;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
    }

    public Map<String, Object> getDashboardData(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("totalSkills", skillRepository.findByUser(user).size());
        data.put("totalProjects", projectRepository.findByUser(user).size());
        data.put("totalCompanies", companyRepository.findByUser(user).size());
        data.put("totalApplications", applicationRepository.findByUser(user).size());
        data.put("totalGoals", learningGoalRepository.findByUser(user).size());
        data.put("totalTasks", taskRepository.findByUser(user).size());
        data.put("unreadNotifications", notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user).size());
        data.put("totalUsers", userRepository.count());
        return data;
    }
}
