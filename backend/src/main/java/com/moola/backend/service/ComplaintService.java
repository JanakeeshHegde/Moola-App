package com.moola.backend.service;

import com.moola.backend.dto.ComplaintDto;
import com.moola.backend.model.Complaint;
import com.moola.backend.model.User;
import com.moola.backend.repository.ComplaintRepository;
import com.moola.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    public Complaint submitComplaint(String userId, ComplaintDto.SubmitComplaintRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = String.format("%04d", new Random().nextInt(10000));
        String ticketId = "TKT-" + datePart + "-" + randomSuffix;

        Complaint complaint = new Complaint();
        complaint.setTicketId(ticketId);
        complaint.setUserId(userId);
        complaint.setUserName(user.getName());
        complaint.setUserPhone(user.getPhone());
        complaint.setCategory(req.getCategory());
        complaint.setSubject(req.getSubject());
        complaint.setDescription(req.getDescription());
        complaint.setOrderId(req.getOrderId());
        complaint.setStatus("SUBMITTED");
        complaint.setPriority(req.getPriority() != null ? req.getPriority() : "medium");

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getUserComplaints(String userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Complaint getByTicketId(String ticketId, String userId, boolean isAdmin) {
        Complaint complaint = complaintRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint ticket not found"));

        if (!isAdmin && !complaint.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return complaint;
    }

    public List<Complaint> adminListComplaints(String status) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return complaintRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        }
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Complaint adminUpdateComplaint(String ticketId, String adminId, ComplaintDto.AdminUpdateComplaintRequest req) {
        Complaint complaint = complaintRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint ticket not found"));

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            complaint.setStatus(req.getStatus().toUpperCase());
            if ("RESOLVED".equalsIgnoreCase(req.getStatus())) {
                complaint.setResolvedAt(Instant.now());
            } else if ("CLOSED".equalsIgnoreCase(req.getStatus())) {
                complaint.setClosedAt(Instant.now());
            }
        }
        if (req.getPriority() != null) complaint.setPriority(req.getPriority());
        if (req.getPublicResponse() != null) complaint.setPublicResponse(req.getPublicResponse());

        if (req.getInternalNote() != null && !req.getInternalNote().isBlank()) {
            String noteId = "NOTE-" + System.currentTimeMillis();
            User admin = userRepository.findById(adminId).orElse(null);
            String adminName = admin != null ? admin.getName() : "Admin";
            complaint.getInternalNotes().add(new Complaint.InternalNote(noteId, adminId, adminName, req.getInternalNote()));
        }

        complaint.setUpdatedAt(Instant.now());
        return complaintRepository.save(complaint);
    }
}
