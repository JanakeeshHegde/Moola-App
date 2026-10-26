package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.ChatMessage;
import com.moola.backend.model.Conversation;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/conversations")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Conversation>>> getConversations(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<Conversation> list = dataStore.getConversations().stream()
                .filter(c -> user.getId().equals(c.getBuyerId()) || user.getId().equals(c.getSellerId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Conversation>> startConversation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);
        String sellerId = (String) body.getOrDefault("sellerId", "user_seller_01");

        Optional<Conversation> existing = dataStore.getConversations().stream()
                .filter(c -> (c.getBuyerId().equals(user.getId()) && c.getSellerId().equals(sellerId)) ||
                             (c.getBuyerId().equals(sellerId) && c.getSellerId().equals(user.getId())))
                .findFirst();

        if (existing.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(existing.get()));
        }

        String convId = "conv_" + System.currentTimeMillis();
        Conversation conv = new Conversation(
                convId,
                user.getId(),
                user.getName(),
                sellerId,
                "Ramesh Organic Farm & Mandi",
                "Conversation started",
                Instant.now().toString(),
                0
        );
        dataStore.getConversations().add(conv);
        return ResponseEntity.ok(ApiResponse.success(conv));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(@PathVariable String id) {
        List<ChatMessage> list = dataStore.getMessagesMap().getOrDefault(id, Collections.emptyList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String msgId = "msg_" + System.currentTimeMillis();
        String content = (String) body.getOrDefault("content", "");

        ChatMessage msg = new ChatMessage(
                msgId,
                id,
                user.getId(),
                user.getName(),
                content,
                Instant.now().toString(),
                false
        );

        dataStore.getMessagesMap().computeIfAbsent(id, k -> new ArrayList<>()).add(msg);

        // Update conversation last message
        dataStore.getConversations().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .ifPresent(c -> {
                    c.setLastMessage(content);
                    c.setLastMessageTime(msg.getTimestamp());
                });

        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markConversationRead(@PathVariable String id) {
        List<ChatMessage> msgs = dataStore.getMessagesMap().get(id);
        if (msgs != null) {
            msgs.forEach(m -> m.setRead(true));
        }
        return ResponseEntity.ok(ApiResponse.success("Read", "Conversation marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadChatCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);

        long count = dataStore.getMessagesMap().values().stream()
                .flatMap(List::stream)
                .filter(m -> !m.getSenderId().equals(user.getId()) && Boolean.FALSE.equals(m.getRead()))
                .count();

        Map<String, Long> map = new HashMap<>();
        map.put("count", count);
        return ResponseEntity.ok(ApiResponse.success(map));
    }
}
