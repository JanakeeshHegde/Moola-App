package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.AuthModels;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private DataStoreService dataStore;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthModels.AuthData>> login(@RequestBody AuthModels.LoginRequest request) {
        System.out.println("Login attempt for phone: " + request.getPhone());
        Optional<User> userOpt = dataStore.getUsers().stream()
                .filter(u -> u.getPhone() != null && u.getPhone().equals(request.getPhone()))
                .findFirst();

        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid mobile number or password.", 401));
        }

        User user = userOpt.get();
        SellerProfile sellerProfile = "seller".equalsIgnoreCase(user.getRole()) ? dataStore.getSellerProfiles().get(user.getId()) : null;

        AuthModels.AuthData authData = new AuthModels.AuthData(
                user,
                new AuthModels.Tokens("token_" + user.getId(), "refresh_" + user.getId()),
                sellerProfile
        );

        return ResponseEntity.ok(ApiResponse.success(authData, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthModels.AuthData>> register(@RequestBody AuthModels.RegisterRequest request) {
        System.out.println("Register attempt for phone: " + request.getPhone() + ", role: " + request.getRole());
        boolean exists = dataStore.getUsers().stream()
                .anyMatch(u -> u.getPhone() != null && u.getPhone().equals(request.getPhone()));

        if (exists) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Phone number already registered. Please login.", 400));
        }

        String userId = "user_" + System.currentTimeMillis();
        User newUser = new User(
                userId,
                request.getName() != null ? request.getName() : "New User",
                request.getPhone(),
                request.getPhone() + "@moola.com",
                request.getRole() != null ? request.getRole() : "buyer",
                "en",
                true,
                request.getPassword() != null ? request.getPassword() : "123456"
        );
        dataStore.getUsers().add(newUser);

        SellerProfile sellerProfile = null;
        if ("seller".equalsIgnoreCase(newUser.getRole())) {
            sellerProfile = new SellerProfile(
                    "seller_profile_" + System.currentTimeMillis(),
                    newUser.getId(),
                    request.getShopName() != null ? request.getShopName() : newUser.getName() + "'s Shop",
                    "Welcome to my shop!",
                    5.0,
                    0,
                    true,
                    newUser.getPhone() + "@upi",
                    "Local Hub"
            );
            dataStore.getSellerProfiles().put(newUser.getId(), sellerProfile);
        }

        AuthModels.AuthData authData = new AuthModels.AuthData(
                newUser,
                new AuthModels.Tokens("token_" + newUser.getId(), "refresh_" + newUser.getId()),
                sellerProfile
        );

        return ResponseEntity.ok(ApiResponse.success(authData, "Registration successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
