package com.moola.backend.service;

import com.moola.backend.model.ChatMessage;
import com.moola.backend.model.Conversation;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.ChatMessageRepository;
import com.moola.backend.repository.ConversationRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ConversationRepository conversationRepository,
                       ChatMessageRepository messageRepository,
                       UserRepository userRepository,
                       SellerProfileRepository sellerProfileRepository,
                       NotificationService notificationService,
                       SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Conversation> getUserConversations(String userId) {
        return conversationRepository.findByParticipantsContainingOrderByLastMessageAtDesc(userId);
    }

    public Conversation getConversationById(String conversationId, String userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!conv.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }
        return conv;
    }

    public Conversation startConversation(String userId, Map<String, Object> body) {
        String participantId = (String) body.get("participantId");
        if (participantId == null || participantId.isBlank()) {
            participantId = (String) body.get("other_user_id");
        }
        if (participantId == null || participantId.isBlank()) {
            participantId = (String) body.get("partnerId");
        }
        if (participantId == null || participantId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Participant ID is required");
        }
        if (userId.equals(participantId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot chat with yourself");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User recipient = userRepository.findById(participantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

        String orderId = (String) body.get("orderId");
        String orderNumber = (String) body.get("orderNumber");
        String productId = (String) body.get("productId");
        String productName = (String) body.get("productName");
        String customRequestId = (String) body.get("customRequestId");
        String customRequestTitle = (String) body.get("customRequestTitle");

        // Check if an existing conversation between these participants already exists
        List<Conversation> existing = conversationRepository.findByParticipantsContainingOrderByLastMessageAtDesc(userId);
        for (Conversation c : existing) {
            if (c.getParticipants().contains(participantId)) {
                // Specific context matches
                if (orderId != null && orderId.equals(c.getOrderId())) {
                    return c;
                }
                if (customRequestId != null && customRequestId.equals(c.getCustomRequestId())) {
                    return c;
                }
                if (productId != null && productId.equals(c.getProductId())) {
                    return c;
                }
                // General conversation match if no specific context was requested
                if (orderId == null && customRequestId == null && productId == null &&
                        c.getOrderId() == null && c.getCustomRequestId() == null && c.getProductId() == null) {
                    return c;
                }
            }
        }

        // If no strict context match, check if any conversation between the two users exists to reuse
        for (Conversation c : existing) {
            if (c.getParticipants().contains(participantId)) {
                // Update conversation with new context if prior context is empty
                boolean modified = false;
                if (orderId != null && c.getOrderId() == null) {
                    c.setOrderId(orderId);
                    c.setOrderNumber(orderNumber);
                    modified = true;
                }
                if (customRequestId != null && c.getCustomRequestId() == null) {
                    c.setCustomRequestId(customRequestId);
                    c.setCustomRequestTitle(customRequestTitle);
                    modified = true;
                }
                if (productId != null && c.getProductId() == null) {
                    c.setProductId(productId);
                    c.setProductName(productName);
                    modified = true;
                }
                if (modified) {
                    conversationRepository.save(c);
                }
                return c;
            }
        }

        Conversation conv = new Conversation();
        conv.setParticipants(Arrays.asList(userId, participantId));

        if ("seller".equalsIgnoreCase(sender.getRole())) {
            conv.setSellerId(sender.getId());
            conv.setSellerName(sender.getName());
            conv.setBuyerId(recipient.getId());
            conv.setBuyerName(recipient.getName());
        } else {
            conv.setBuyerId(sender.getId());
            conv.setBuyerName(sender.getName());
            conv.setSellerId(recipient.getId());
            conv.setSellerName(recipient.getName());
        }

        SellerProfile sp = sellerProfileRepository.findByUserId(conv.getSellerId()).orElse(null);
        if (sp != null) {
            conv.setSellerShopName(sp.getShopName());
        }

        conv.setOrderId(orderId);
        conv.setOrderNumber(orderNumber);
        conv.setProductId(productId);
        conv.setProductName(productName);
        conv.setCustomRequestId(customRequestId);
        conv.setCustomRequestTitle(customRequestTitle);
        conv.setLastMessage("Conversation started");
        conv.setLastMessageAt(Instant.now());

        return conversationRepository.save(conv);
    }

    public List<ChatMessage> getMessages(String conversationId, String userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        if (!conv.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }

        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark unread messages as read
        boolean updated = false;
        for (ChatMessage msg : messages) {
            if (!userId.equals(msg.getSenderId()) && !msg.isRead()) {
                msg.setRead(true);
                msg.setReadAt(Instant.now());
                messageRepository.save(msg);
                updated = true;
            }
        }

        if (updated) {
            if (userId.equals(conv.getBuyerId())) {
                conv.setBuyerUnreadCount(0);
            } else {
                conv.setSellerUnreadCount(0);
            }
            conversationRepository.save(conv);

            // Broadcast read receipt
            try {
                messagingTemplate.convertAndSend("/topic/conversations." + conversationId + ".read",
                        Map.of("conversationId", conversationId, "readBy", userId));
            } catch (Exception e) {
                log.warn("Failed to broadcast read event: {}", e.getMessage());
            }
        }

        return messages;
    }

    public ChatMessage sendMessage(String conversationId, String userId, Map<String, Object> body) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        if (!conv.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }

        String content = (String) body.get("content");
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content is required");
        }
        if (content.length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message exceeds 2000 characters");
        }

        User sender = userRepository.findById(userId).orElse(null);
        String senderName = sender != null ? sender.getName() : "User";
        String senderRole = sender != null ? sender.getRole() : "buyer";

        ChatMessage msg = new ChatMessage(conversationId, userId, senderName, senderRole, content.trim());
        String type = (String) body.get("type");
        if (type != null) msg.setType(type);
        String mediaUrl = (String) body.get("mediaUrl");
        if (mediaUrl != null) msg.setMediaUrl(mediaUrl);

        msg = messageRepository.save(msg);

        // Update conversation summary and unread counts
        conv.setLastMessage(content.trim());
        conv.setLastMessageAt(Instant.now());
        conv.setLastMessageSenderId(userId);

        String recipientId = null;
        for (String p : conv.getParticipants()) {
            if (!p.equals(userId)) {
                recipientId = p;
                break;
            }
        }

        if (recipientId != null) {
            if (recipientId.equals(conv.getSellerId())) {
                conv.setSellerUnreadCount(conv.getSellerUnreadCount() + 1);
            } else {
                conv.setBuyerUnreadCount(conv.getBuyerUnreadCount() + 1);
            }
        }

        conversationRepository.save(conv);

        // 1. Create persistent in-app notification for the recipient
        if (recipientId != null) {
            String preview = content.trim().length() > 60 ? content.trim().substring(0, 57) + "..." : content.trim();
            notificationService.createNotification(
                    recipientId,
                    "New message from " + senderName,
                    preview,
                    "CHAT",
                    conversationId,
                    "CONVERSATION"
            );
        }

        // 2. Real-time broadcast to STOMP topic
        try {
            messagingTemplate.convertAndSend("/topic/conversations." + conversationId, msg);
            if (recipientId != null) {
                messagingTemplate.convertAndSendToUser(recipientId, "/queue/messages", msg);
            }
        } catch (Exception e) {
            log.warn("Failed to broadcast real-time message: {}", e.getMessage());
        }

        return msg;
    }

    public void markConversationRead(String conversationId, String userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!conv.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        List<ChatMessage> unreadMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        boolean changed = false;
        for (ChatMessage m : unreadMessages) {
            if (!userId.equals(m.getSenderId()) && !m.isRead()) {
                m.setRead(true);
                m.setReadAt(Instant.now());
                messageRepository.save(m);
                changed = true;
            }
        }

        if (userId.equals(conv.getBuyerId())) {
            conv.setBuyerUnreadCount(0);
        } else {
            conv.setSellerUnreadCount(0);
        }
        conversationRepository.save(conv);

        if (changed) {
            try {
                messagingTemplate.convertAndSend("/topic/conversations." + conversationId + ".read",
                        Map.of("conversationId", conversationId, "readBy", userId));
            } catch (Exception ignored) {}
        }
    }

    public long getUnreadMessageCount(String userId) {
        List<Conversation> list = conversationRepository.findByParticipantsContainingOrderByLastMessageAtDesc(userId);
        long count = 0;
        for (Conversation c : list) {
            if (userId.equals(c.getBuyerId())) {
                count += c.getBuyerUnreadCount();
            } else if (userId.equals(c.getSellerId())) {
                count += c.getSellerUnreadCount();
            }
        }
        return count;
    }

    public void broadcastTyping(String conversationId, String userId, boolean isTyping) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!conv.getParticipants().contains(userId)) {
            return;
        }

        try {
            messagingTemplate.convertAndSend("/topic/conversations." + conversationId + ".typing",
                    Map.of("conversationId", conversationId, "userId", userId, "isTyping", isTyping));
        } catch (Exception ignored) {}
    }
}
