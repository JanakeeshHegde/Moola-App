package com.moola.backend.model;

public class User {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String role;
    private String preferredLanguage;
    private Boolean isActive;
    private String password;

    public User() {}

    public User(String id, String name, String phone, String email, String role, String preferredLanguage, Boolean isActive, String password) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.role = role;
        this.preferredLanguage = preferredLanguage;
        this.isActive = isActive;
        this.password = password;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
