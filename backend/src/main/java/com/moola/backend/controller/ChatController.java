package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.ChatMessage;
import com.moola.backend.model.Conversation;
import com.moola.backend.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/conversations")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Conversation>>> getConversations(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<Conversation> list = chatService.getUserConversations(userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        long count = chatService.getUnreadMessageCount(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unreadCount", count)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Conversation>> startConversation(Authentication authentication,
                                                                       @RequestBody Map<String, Object> body) {
        String userId = (String) authentication.getPrincipal();
        Conversation conv = chatService.startConversation(userId, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(conv, "Conversation ready"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Conversation>> getConversation(Authentication authentication,
                                                                     @PathVariable String id) {
        String userId = (String) authentication.getPrincipal();
        Conversation conv = chatService.getConversationById(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(conv));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(Authentication authentication,
                                                                      @PathVariable String id) {
        String userId = (String) authentication.getPrincipal();
        List<ChatMessage> list = chatService.getMessages(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(Authentication authentication,
                                                                @PathVariable String id,
                                                                @RequestBody Map<String, Object> body) {
        String userId = (String) authentication.getPrincipal();
        ChatMessage msg = chatService.sendMessage(id, userId, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(msg, "Message sent"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markRead(Authentication authentication,
                                                        @PathVariable String id) {
        String userId = (String) authentication.getPrincipal();
        chatService.markConversationRead(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read"));
    }

    // ==========================================
    // STOMP Message Mappings for WebSockets
    // ==========================================

    @MessageMapping("/chat.send")
    public void handleStompMessage(Principal principal, @Payload Map<String, Object> payload) {
        if (principal == null) return;
        String userId = principal.getName();
        String conversationId = (String) payload.get("conversationId");
        if (conversationId != null) {
            chatService.sendMessage(conversationId, userId, payload);
        }
    }

    @MessageMapping("/chat.typing")
    public void handleStompTyping(Principal principal, @Payload Map<String, Object> payload) {
        if (principal == null) return;
        String userId = principal.getName();
        String conversationId = (String) payload.get("conversationId");
        Boolean isTyping = (Boolean) payload.get("isTyping");
        if (conversationId != null && isTyping != null) {
            chatService.broadcastTyping(conversationId, userId, isTyping);
        }
    }
}
