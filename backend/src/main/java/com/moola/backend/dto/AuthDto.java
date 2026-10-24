package com.moola.backend.dto;

import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public static class LoginRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
        private String phone;

        @NotBlank(message = "Password is required")
        private String password;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String role = "buyer"; // buyer or seller

        private String email;
        private String preferredLanguage = "en";
        private String shopName; // required if role == seller

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPreferredLanguage() { return preferredLanguage; }
        public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

        public String getShopName() { return shopName; }
        public void setShopName(String shopName) { this.shopName = shopName; }
    }

    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;

        public RefreshTokenRequest() {}
        public RefreshTokenRequest(String refreshToken) { this.refreshToken = refreshToken; }

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class Tokens {
        private String accessToken;
        private String refreshToken;

        public Tokens() {}
        public Tokens(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class AuthResponseData {
        private User user;
        private Tokens tokens;
        private SellerProfile sellerProfile;

        public AuthResponseData() {}
        public AuthResponseData(User user, Tokens tokens, SellerProfile sellerProfile) {
            this.user = user;
            this.tokens = tokens;
            this.sellerProfile = sellerProfile;
        }

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }

        public Tokens getTokens() { return tokens; }
        public void setTokens(Tokens tokens) { this.tokens = tokens; }

        public SellerProfile getSellerProfile() { return sellerProfile; }
        public void setSellerProfile(SellerProfile sellerProfile) { this.sellerProfile = sellerProfile; }
    }

    public static class ProfileUpdateRequest {
        private String name;
        private String email;
        private String preferredLanguage;
        private String avatar;
        private User.Location location;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPreferredLanguage() { return preferredLanguage; }
        public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public User.Location getLocation() { return location; }
        public void setLocation(User.Location location) { this.location = location; }
    }
}
