package com.internship.skilltracker.controller;

import com.internship.skilltracker.dto.ApiResponse;
import com.internship.skilltracker.dto.AuthRequest;
import com.internship.skilltracker.dto.JwtResponse;
import com.internship.skilltracker.dto.RegisterRequest;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.ok(new ApiResponse("User registered successfully", user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.login(request.getEmail(), request.getPassword()));
    }
}
