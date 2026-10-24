package com.moola.backend.config;

import com.moola.backend.model.Conversation;
import com.moola.backend.repository.ConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final ConversationRepository conversationRepository;

    public WebSocketConfig(JwtTokenProvider jwtTokenProvider, ConversationRepository conversationRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.conversationRepository = conversationRepository;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket endpoint
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*");

        // SockJS fallback endpoint
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader == null || authHeader.isBlank()) {
                        authHeader = accessor.getFirstNativeHeader("token");
                    }

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        authHeader = authHeader.substring(7);
                    }

                    if (authHeader != null && !authHeader.isBlank() && jwtTokenProvider.validateToken(authHeader)) {
                        String userId = jwtTokenProvider.getUserIdFromToken(authHeader);
                        String role = jwtTokenProvider.getRoleFromToken(authHeader);
                        if (role == null) role = "BUYER";

                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        );
                        accessor.setUser(auth);
                        log.info("STOMP user authenticated: userId={}, role={}", userId, role);
                    } else {
                        log.warn("STOMP connect attempt without valid token");
                    }
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    Principal principal = accessor.getUser();
                    String userId = principal != null ? principal.getName() : null;

                    if (destination != null && destination.startsWith("/topic/conversations.")) {
                        String conversationId = destination.substring("/topic/conversations.".length());
                        // Strip any sub-topic like .typing
                        if (conversationId.contains(".")) {
                            conversationId = conversationId.substring(0, conversationId.indexOf("."));
                        }

                        if (userId == null) {
                            throw new AccessDeniedException("Authentication required to subscribe to conversation");
                        }

                        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
                        if (convOpt.isEmpty() || !convOpt.get().getParticipants().contains(userId)) {
                            log.warn("Access denied: user {} attempted to subscribe to private conversation {}", userId, conversationId);
                            throw new AccessDeniedException("Access denied to conversation");
                        }
                    }
                }

                return message;
            }
        });
    }
}
