package com.moola.app.data.model;

import java.io.Serializable;

public class AuthModels {

    public static class LoginRequest {
        private String phone;
        private String password;

        public LoginRequest(String phone, String password) {
            this.phone = phone;
            this.password = password;
        }

        public String getPhone() { return phone; }
        public String getPassword() { return password; }
    }

    public static class RegisterRequest {
        private String name;
        private String phone;
        private String password;
        private String role;
        private String shopName;

        public RegisterRequest(String name, String phone, String password, String role, String shopName) {
            this.name = name;
            this.phone = phone;
            this.password = password;
            this.role = role;
            this.shopName = shopName;
        }

        public String getName() { return name; }
        public String getPhone() { return phone; }
        public String getPassword() { return password; }
        public String getRole() { return role; }
        public String getShopName() { return shopName; }
    }

    public static class Tokens implements Serializable {
        private String accessToken;
        private String refreshToken;

        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
    }

    public static class AuthData implements Serializable {
        private User user;
        private Tokens tokens;
        private SellerProfile sellerProfile;

        public User getUser() { return user; }
        public Tokens getTokens() { return tokens; }
        public SellerProfile getSellerProfile() { return sellerProfile; }
    }
}
