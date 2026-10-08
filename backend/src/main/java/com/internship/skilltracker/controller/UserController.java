package com.internship.skilltracker.controller;

import com.internship.skilltracker.dto.ApiResponse;
import com.internship.skilltracker.dto.ProfileUpdateRequest;
import com.internship.skilltracker.dto.UserDto;
import com.internship.skilltracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/admin/users/{userId}/make-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> setAdmin(@PathVariable Long userId) {
        userService.setAdmin(userId);
        return ResponseEntity.ok(new ApiResponse("User promoted to admin"));
    }
}
