package com.moola.backend;

import com.moola.backend.config.JwtTokenProvider;
import com.moola.backend.dto.AuthDto;
import com.moola.backend.model.User;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import com.moola.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthSecurityTests {

    private UserRepository userRepository;
    private SellerProfileRepository sellerProfileRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider tokenProvider;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        sellerProfileRepository = Mockito.mock(SellerProfileRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        tokenProvider = new JwtTokenProvider(
                "3340c32cc1f56a698bada90e998703ee59a23f6fd514deb4a8f1d6b7488932a2",
                604800000L,
                2592000000L
        );
        authService = new AuthService(userRepository, sellerProfileRepository, passwordEncoder, tokenProvider);

        when(passwordEncoder.encode(any())).thenReturn("hashed_secret");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void testPublicRegistrationRejectsAdminRole() {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setName("Malicious User");
        req.setPhone("9999999999");
        req.setPassword("secret123");
        req.setRole("admin");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("admin"));
    }

    @Test
    void testPublicRegistrationRejectsArbitraryRoles() {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setName("Hacker");
        req.setPhone("9999999998");
        req.setPassword("secret123");
        req.setRole("superadmin");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void testPublicRegistrationPermitsBuyer() {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setName("Priya Naik");
        req.setPhone("9000000004");
        req.setPassword("buyer@123");
        req.setRole("buyer");

        AuthDto.AuthResponseData resp = authService.register(req);
        assertNotNull(resp);
        assertEquals("buyer", resp.getUser().getRole());
        assertNotNull(resp.getTokens().getAccessToken());
        assertNotNull(resp.getTokens().getRefreshToken());
    }

    @Test
    void testRefreshTokenWorkflow() {
        String refresh = tokenProvider.generateRefreshToken("user-100", "buyer");
        AuthDto.Tokens newTokens = authService.refreshToken(refresh);

        assertNotNull(newTokens);
        assertNotNull(newTokens.getAccessToken());
        assertNotNull(newTokens.getRefreshToken());
        assertEquals("user-100", tokenProvider.getUserIdFromToken(newTokens.getAccessToken()));
        assertEquals("buyer", tokenProvider.getRoleFromToken(newTokens.getAccessToken()));
    }

    @Test
    void testInvalidRefreshTokenRejected() {
        assertThrows(ResponseStatusException.class, () -> authService.refreshToken("invalid.malformed.token"));
    }
}
