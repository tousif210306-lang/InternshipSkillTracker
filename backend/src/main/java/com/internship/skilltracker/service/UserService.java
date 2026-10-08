package com.internship.skilltracker.service;

import com.internship.skilltracker.dto.JwtResponse;
import com.internship.skilltracker.dto.ProfileUpdateRequest;
import com.internship.skilltracker.dto.RegisterRequest;
import com.internship.skilltracker.dto.UserDto;
import com.internship.skilltracker.entity.Role;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.BadRequestException;
import com.internship.skilltracker.exception.ConflictException;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.UserRepository;
import com.internship.skilltracker.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public User register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public JwtResponse login(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(normalizedEmail, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtils.generateToken(authentication);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new JwtResponse(token, mapToDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(ProfileUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getUniversity() != null) user.setUniversity(request.getUniversity());
        if (request.getDegree() != null) user.setDegree(request.getDegree());
        if (request.getGraduationYear() != null) user.setGraduationYear(request.getGraduationYear());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getCareerObjective() != null) user.setCareerObjective(request.getCareerObjective());
        if (request.getCertifications() != null) user.setCertifications(request.getCertifications());
        if (request.getAchievements() != null) user.setAchievements(request.getAchievements());
        if (request.getResumeUrl() != null) user.setResumeUrl(request.getResumeUrl());

        userRepository.save(user);
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public void setAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setUniversity(user.getUniversity());
        dto.setDegree(user.getDegree());
        dto.setGraduationYear(user.getGraduationYear());
        dto.setLocation(user.getLocation());
        dto.setBio(user.getBio());
        dto.setLinkedinUrl(user.getLinkedinUrl());
        dto.setGithubUrl(user.getGithubUrl());
        dto.setCareerObjective(user.getCareerObjective());
        dto.setCertifications(user.getCertifications());
        dto.setAchievements(user.getAchievements());
        dto.setResumeUrl(user.getResumeUrl());
        if (user.getCareerRole() != null) {
            dto.setCareerRoleId(user.getCareerRole().getId());
            dto.setCareerRoleName(user.getCareerRole().getName());
            dto.setDepartmentId(user.getCareerRole().getDepartment().getId());
            dto.setDepartmentName(user.getCareerRole().getDepartment().getName());
        }
        return dto;
    }
}
