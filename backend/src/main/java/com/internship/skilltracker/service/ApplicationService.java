package com.internship.skilltracker.service;

import com.internship.skilltracker.dto.InternshipApplicationRequest;
import com.internship.skilltracker.entity.ApplicationStatus;
import com.internship.skilltracker.entity.Company;
import com.internship.skilltracker.entity.InternshipApplication;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.BadRequestException;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.CompanyRepository;
import com.internship.skilltracker.repository.InternshipApplicationRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ApplicationService {
    private final InternshipApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public ApplicationService(InternshipApplicationRepository applicationRepository,
                              CompanyRepository companyRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    public List<InternshipApplication> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return applicationRepository.findByUser(user);
    }

    public InternshipApplication saveApplication(InternshipApplicationRequest request) {
        User user = currentUser();
        InternshipApplication application = new InternshipApplication();
        application.setUser(user);
        applyRequest(application, request, user);
        return applicationRepository.save(application);
    }

    public InternshipApplication updateApplication(Long id, InternshipApplicationRequest request) {
        InternshipApplication application = ownedApplication(id);
        applyRequest(application, request, currentUser());
        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        applicationRepository.delete(ownedApplication(id));
    }

    private void applyRequest(InternshipApplication application,
                              InternshipApplicationRequest request, User user) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        if (!company.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Company not found");
        }
        application.setCompany(company);
        application.setJobTitle(request.jobTitle().trim());
        application.setApplicationDate(request.applicationDate());
        application.setStatus(request.status() == null ? ApplicationStatus.APPLIED : request.status());
        application.setInternshipType(request.internshipType());
        application.setInterviewDate(request.interviewDate());
        application.setApplicationUrl(request.applicationUrl());
        application.setNotes(request.notes());
    }

    private InternshipApplication ownedApplication(Long id) {
        InternshipApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship application not found"));
        if (!application.getUser().getId().equals(currentUser().getId())) {
            throw new ResourceNotFoundException("Internship application not found");
        }
        return application;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
