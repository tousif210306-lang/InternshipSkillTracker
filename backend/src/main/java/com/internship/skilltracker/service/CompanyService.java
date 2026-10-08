package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.Company;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.BadRequestException;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.CompanyRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    public List<Company> getMyCompanies() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return companyRepository.findByUser(user);
    }

    public Company saveCompany(Company company) {
        User user = currentUser();
        company.setId(null);
        company.setUser(user);
        return companyRepository.save(company);
    }

    public Company updateCompany(Long id, Company values) {
        Company company = ownedCompany(id);
        company.setName(values.getName());
        company.setLocation(values.getLocation());
        company.setWebsite(values.getWebsite());
        company.setIndustry(values.getIndustry());
        company.setDescription(values.getDescription());
        return companyRepository.save(company);
    }

    public void deleteCompany(Long id) {
        Company company = ownedCompany(id);
        if (!company.getApplications().isEmpty()) {
            throw new BadRequestException("Remove this company's internship applications before deleting it.");
        }
        companyRepository.delete(company);
    }

    private Company ownedCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        if (!company.getUser().getId().equals(currentUser().getId())) {
            throw new ResourceNotFoundException("Company not found");
        }
        return company;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
