package com.moola.app.data.model;

import java.io.Serializable;

public class User implements Serializable {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String role;
    private String preferredLanguage;
    private boolean isActive;

    public User() {}

    public User(String id, String name, String phone, String role) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.role = role;
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

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isSeller() {
        return "seller".equalsIgnoreCase(role);
    }

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }
}
