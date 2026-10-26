package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Notification;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<Notification> list = dataStore.getNotifications().stream()
                .filter(n -> user.getId().equals(n.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadNotificationCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        long count = dataStore.getNotifications().stream()
                .filter(n -> user.getId().equals(n.getUserId()) && Boolean.FALSE.equals(n.getIsRead()))
                .count();

        Map<String, Long> map = new HashMap<>();
        map.put("count", count);
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markNotificationRead(@PathVariable String id) {
        Notification notif = dataStore.getNotifications().stream()
                .filter(n -> n.getId().equals(id))
                .findFirst().orElse(null);
        if (notif != null) {
            notif.setIsRead(true);
        }
        return ResponseEntity.ok(ApiResponse.success(notif));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllNotificationsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        dataStore.getNotifications().stream()
                .filter(n -> user.getId().equals(n.getUserId()))
                .forEach(n -> n.setIsRead(true));
        return ResponseEntity.ok(ApiResponse.success("Success", "All notifications marked as read"));
    }
}
