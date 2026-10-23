package com.moola.app.data.storage;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.moola.app.data.model.SellerProfile;
import com.moola.app.data.model.User;

public class SessionManager {

    private static final String PREF_NAME = "moola_pref";
    private static final String KEY_TOKEN = "access_token";
    private static final String KEY_REFRESH_TOKEN = "refresh_token";
    private static final String KEY_USER = "current_user";
    private static final String KEY_SELLER = "current_seller_profile";

    private final SharedPreferences prefs;
    private final Gson gson;
    private static SessionManager instance;

    public SessionManager(Context context) {
        this.prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        this.gson = new Gson();
    }

    public static synchronized SessionManager getInstance(Context context) {
        if (instance == null) {
            instance = new SessionManager(context);
        }
        return instance;
    }

    public void saveAuth(String accessToken, String refreshToken, User user, SellerProfile profile) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_TOKEN, accessToken);
        editor.putString(KEY_REFRESH_TOKEN, refreshToken);
        if (user != null) {
            editor.putString(KEY_USER, gson.toJson(user));
        }
        if (profile != null) {
            editor.putString(KEY_SELLER, gson.toJson(profile));
        }
        editor.apply();
    }

    public void saveUser(String id, String phone, String name, String role) {
        User user = getUser();
        if (user == null) {
            user = new User();
        }
        user.setId(id);
        user.setPhone(phone);
        user.setName(name);
        user.setRole(role);
        prefs.edit().putString(KEY_USER, gson.toJson(user)).apply();
    }

    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public boolean isLoggedIn() {
        return getToken() != null && !getToken().isEmpty();
    }

    public User getUser() {
        String json = prefs.getString(KEY_USER, null);
        if (json != null) {
            return gson.fromJson(json, User.class);
        }
        return null;
    }

    public String getUserName() {
        User user = getUser();
        return user != null ? user.getName() : null;
    }

    public String getUserPhone() {
        User user = getUser();
        return user != null ? user.getPhone() : null;
    }

    public String getUserRole() {
        User user = getUser();
        return user != null ? user.getRole() : null;
    }

    public boolean isAdmin() {
        User user = getUser();
        return user != null && "admin".equalsIgnoreCase(user.getRole());
    }

    public SellerProfile getSellerProfile() {
        String json = prefs.getString(KEY_SELLER, null);
        if (json != null) {
            return gson.fromJson(json, SellerProfile.class);
        }
        return null;
    }

    public void clear() {
        prefs.edit().clear().apply();
    }
}
