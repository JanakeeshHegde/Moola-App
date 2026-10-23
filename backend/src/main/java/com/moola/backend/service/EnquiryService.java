package com.moola.backend.service;

import com.moola.backend.dto.EnquiryDto;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.model.WhatsAppEnquiry;
import com.moola.backend.repository.ProductRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import com.moola.backend.repository.WhatsAppEnquiryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class EnquiryService {

    private final WhatsAppEnquiryRepository enquiryRepository;
    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    public EnquiryService(WhatsAppEnquiryRepository enquiryRepository,
                          ProductRepository productRepository,
                          SellerProfileRepository sellerProfileRepository,
                          UserRepository userRepository) {
        this.enquiryRepository = enquiryRepository;
        this.productRepository = productRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.userRepository = userRepository;
    }

    public WhatsAppEnquiry createEnquiry(String buyerId, EnquiryDto.CreateEnquiryRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        SellerProfile sellerProfile = sellerProfileRepository.findByUserId(product.getSellerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller profile not found"));

        String rawPhone = sellerProfile.getWhatsappNumber();
        if (rawPhone == null || rawPhone.isBlank()) {
            rawPhone = "9000000001";
        }
        String cleanPhone = rawPhone.replaceAll("[^0-9]", "");
        if (!cleanPhone.startsWith("91") && cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }

        User buyer = buyerId != null ? userRepository.findById(buyerId).orElse(null) : null;
        String buyerName = buyer != null ? buyer.getName() : "Customer";
        String buyerPhone = buyer != null ? buyer.getPhone() : "";

        String prefilledText = String.format(
                "Namaskara, I am interested in ordering %d x %s (%s) listed on MOOLA at ₹%.0f each. Please let me know how soon it can be shipped.",
                req.getQuantity(),
                product.getName().getEn(),
                product.getUnit(),
                product.getPrice()
        );

        String encodedMessage = URLEncoder.encode(prefilledText, StandardCharsets.UTF_8);
        String clickToChatUrl = "https://wa.me/" + cleanPhone + "?text=" + encodedMessage;

        WhatsAppEnquiry enquiry = new WhatsAppEnquiry();
        enquiry.setBuyerId(buyerId);
        enquiry.setBuyerName(buyerName);
        enquiry.setBuyerPhone(buyerPhone);
        enquiry.setSellerId(product.getSellerId());
        enquiry.setSellerName(sellerProfile.getShopName());
        enquiry.setProductId(product.getId());
        enquiry.setProductName(product.getName().getEn());
        enquiry.setQuantity(req.getQuantity());
        enquiry.setUnit(product.getUnit());
        enquiry.setPrice(product.getPrice());
        enquiry.setSellerWhatsAppNumber("+" + cleanPhone);
        enquiry.setPrefilledMessage(prefilledText);
        enquiry.setClickToChatUrl(clickToChatUrl);
        enquiry.setStatus("initiated");
        enquiry.setNotes(req.getNotes());

        return enquiryRepository.save(enquiry);
    }

    public List<WhatsAppEnquiry> getSellerEnquiries(String sellerId) {
        return enquiryRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    public List<WhatsAppEnquiry> getBuyerEnquiries(String buyerId) {
        return enquiryRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public WhatsAppEnquiry updateStatus(String enquiryId, String status) {
        WhatsAppEnquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enquiry not found"));
        enquiry.setStatus(status);
        return enquiryRepository.save(enquiry);
    }
}
