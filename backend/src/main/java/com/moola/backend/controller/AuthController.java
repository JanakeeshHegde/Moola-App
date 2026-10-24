package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.AuthDto;
import com.moola.backend.model.User;
import com.moola.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponseData>> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        AuthDto.AuthResponseData data = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponseData>> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        AuthDto.AuthResponseData data = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok(data, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthDto.Tokens>> refreshToken(@Valid @RequestBody AuthDto.RefreshTokenRequest req) {
        AuthDto.Tokens tokens = authService.refreshToken(req.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(tokens, "Token refreshed successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMe(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        User user = authService.getMe(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(Authentication authentication,
                                                           @RequestBody AuthDto.ProfileUpdateRequest req) {
        String userId = (String) authentication.getPrincipal();
        User user = authService.updateProfile(userId, req);
        return ResponseEntity.ok(ApiResponse.ok(user, "Profile updated"));
    }
}
