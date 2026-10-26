package com.moola.backend.dto;

import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;

public class AuthModels {

    public static class LoginRequest {
        private String phone;
        private String password;

        public LoginRequest() {}

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String name;
        private String phone;
        private String password;
        private String role;
        private String shopName;

        public RegisterRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getShopName() { return shopName; }
        public void setShopName(String shopName) { this.shopName = shopName; }
    }

    public static class AuthData {
        private User user;
        private Tokens tokens;
        private SellerProfile sellerProfile;

        public AuthData() {}
        public AuthData(User user, Tokens tokens, SellerProfile sellerProfile) {
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
}
