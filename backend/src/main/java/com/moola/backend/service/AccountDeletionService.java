package com.moola.backend.service;

import com.moola.backend.dto.AccountDeletionDto;
import com.moola.backend.model.AccountDeletionRequest;
import com.moola.backend.model.User;
import com.moola.backend.repository.AccountDeletionRepository;
import com.moola.backend.repository.ComplaintRepository;
import com.moola.backend.repository.OrderRepository;
import com.moola.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountDeletionService {

    private final AccountDeletionRepository deletionRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ComplaintRepository complaintRepository;

    public AccountDeletionService(AccountDeletionRepository deletionRepository,
                                  UserRepository userRepository,
                                  OrderRepository orderRepository,
                                  ComplaintRepository complaintRepository) {
        this.deletionRepository = deletionRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.complaintRepository = complaintRepository;
    }

    public AccountDeletionRequest requestDeletion(String userId, AccountDeletionDto.DeletionRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Optional<AccountDeletionRequest> existing = deletionRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (existing.isPresent() && "PENDING".equalsIgnoreCase(existing.get().getStatus())) {
            return existing.get();
        }

        // Count active orders and unresolved complaints
        long activeOrders = orderRepository.countByBuyerIdAndStatusNotIn(userId, Arrays.asList("DELIVERED", "CANCELLED", "delivered", "cancelled"));
        long openComplaints = complaintRepository.countByUserIdAndStatusNotIn(userId, Arrays.asList("RESOLVED", "CLOSED"));

        AccountDeletionRequest request = new AccountDeletionRequest();
        request.setRequestId("DEL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        request.setUserId(userId);
        request.setUserName(user.getName());
        request.setUserPhone(user.getPhone());
        request.setUserRole(user.getRole());
        request.setReason(req.getReason());
        request.setStatus("PENDING");
        request.setVerificationState("authenticated_session");
        request.setActiveOrdersCount((int) activeOrders);
        request.setUnresolvedComplaintsCount((int) openComplaints);

        return deletionRepository.save(request);
    }

    public AccountDeletionRequest publicDeletionRequest(AccountDeletionDto.PublicDeletionRequest req) {
        User user = userRepository.findByPhone(req.getPhone()).orElse(null);

        AccountDeletionRequest request = new AccountDeletionRequest();
        request.setRequestId("DEL-PUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        request.setUserId(user != null ? user.getId() : "UNREGISTERED");
        request.setUserName(req.getName() != null ? req.getName() : (user != null ? user.getName() : "Guest"));
        request.setUserPhone(req.getPhone());
        request.setUserRole(user != null ? user.getRole() : "buyer");
        request.setReason(req.getReason());
        request.setStatus("PENDING");
        request.setVerificationState("web_requested_pending_verification");

        return deletionRepository.save(request);
    }

    public AccountDeletionRequest getMyStatus(String userId) {
        return deletionRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);
    }

    public List<AccountDeletionRequest> adminListRequests() {
        return deletionRepository.findAllByOrderByCreatedAtDesc();
    }

    public AccountDeletionRequest adminProcessRequest(String requestId, String adminId, AccountDeletionDto.ProcessDeletionRequest req) {
        AccountDeletionRequest request = deletionRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deletion request not found"));

        if ("approve".equalsIgnoreCase(req.getAction())) {
            request.setStatus("COMPLETED");
            request.setCompletionReason(req.getReason() != null ? req.getReason() : "Account deletion completed by administrator.");
            request.setProcessedBy(adminId);
            request.setProcessedAt(Instant.now());

            // Deactivate and anonymize user
            userRepository.findById(request.getUserId()).ifPresent(user -> {
                user.setActive(false);
                user.setName("Deleted User");
                user.setEmail(null);
                userRepository.save(user);
            });
        } else {
            request.setStatus("REJECTED");
            request.setRejectionReason(req.getReason() != null ? req.getReason() : "Deletion request rejected.");
            request.setProcessedBy(adminId);
            request.setProcessedAt(Instant.now());
        }

        request.setUpdatedAt(Instant.now());
        return deletionRepository.save(request);
    }
}
