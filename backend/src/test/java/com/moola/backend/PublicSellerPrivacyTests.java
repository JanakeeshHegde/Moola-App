package com.moola.backend;

import com.moola.backend.dto.PublicSellerProfileDto;
import com.moola.backend.dto.SellerShopDto;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.*;
import com.moola.backend.service.SellerFollowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class PublicSellerPrivacyTests {

    private SellerFollowRepository sellerFollowRepository;
    private SellerProfileRepository sellerProfileRepository;
    private UserRepository userRepository;
    private ProductRepository productRepository;
    private SeasonalCampaignRepository seasonalCampaignRepository;
    private SellerFollowService sellerFollowService;

    @BeforeEach
    void setUp() {
        sellerFollowRepository = Mockito.mock(SellerFollowRepository.class);
        sellerProfileRepository = Mockito.mock(SellerProfileRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        seasonalCampaignRepository = Mockito.mock(SeasonalCampaignRepository.class);

        sellerFollowService = new SellerFollowService(
                sellerFollowRepository,
                sellerProfileRepository,
                userRepository,
                productRepository,
                seasonalCampaignRepository
        );
    }

    @Test
    void testPublicShopSanitizesPrivateSellerData() {
        SellerProfile raw = new SellerProfile();
        raw.setUserId("seller-123");
        raw.setShopName("Malnad Pure Honey");
        raw.setDescription("Wild honey from Western Ghats");
        raw.setVerified(true);
        raw.setAverageRating(4.9);
        raw.setRatingCount(28);

        // Sensitive private data that MUST NOT leak to public visitors
        raw.setWhatsappNumber("+919999988888");
        raw.setUpiId("secret.maker@okaxis");
        raw.setPaymentInstructions("Pay to 9999988888");
        raw.setTotalRevenue(54000.0);
        raw.setTotalSales(120);
        raw.setKycDocuments(List.of(new SellerProfile.KycDocument("AADHAAR", "https://s3.amazonaws.com/private/aadhaar.pdf")));

        User user = new User();
        user.setName("Ramesh Maker");

        when(sellerProfileRepository.findByUserId("seller-123")).thenReturn(Optional.of(raw));
        when(userRepository.findById("seller-123")).thenReturn(Optional.of(user));
        when(productRepository.findBySellerIdOrderByCreatedAtDesc("seller-123")).thenReturn(Collections.emptyList());
        when(seasonalCampaignRepository.findBySellerIdOrderByCreatedAtDesc("seller-123")).thenReturn(Collections.emptyList());
        when(sellerFollowRepository.countBySellerId("seller-123")).thenReturn(45L);

        SellerShopDto shop = sellerFollowService.getSellerShop("seller-123", null);

        assertNotNull(shop);
        assertEquals("Malnad Pure Honey", shop.getProfile().getShopName());
        assertEquals(45L, shop.getFollowerCount());
        assertNotNull(shop.getShareUrl());
        assertTrue(shop.getShareUrl().contains("seller-123"));

        // Verify privacy enforcement: sensitive fields are completely erased in public response
        assertNull(shop.getProfile().getWhatsappNumber(), "WhatsApp number must not leak in public profile");
        assertNull(shop.getProfile().getUpiId(), "UPI ID must not leak in public profile");
        assertNull(shop.getProfile().getPaymentInstructions(), "Payment instructions must not leak in public profile");
        assertTrue(shop.getProfile().getKycDocuments().isEmpty(), "KYC documents must not leak in public profile");
        assertEquals(0.0, shop.getProfile().getTotalRevenue(), "Total revenue must not leak in public profile");
        assertEquals(0, shop.getProfile().getTotalSales(), "Total sales must not leak in public profile");

        // Verify public DTO contains slug and public metrics
        PublicSellerProfileDto publicDto = shop.getPublicProfile();
        assertNotNull(publicDto);
        assertEquals("seller-123", publicDto.getSellerId());
        assertTrue(publicDto.getSlug().startsWith("@"));
        assertEquals(45L, publicDto.getFollowerCount());
    }

    @Test
    void testPublicSellersListingExcludesPrivateFields() {
        SellerProfile p1 = new SellerProfile();
        p1.setUserId("s-1");
        p1.setShopName("Coorg Spices");
        p1.setDescription("Black pepper & cardamom");
        p1.setVerified(true);
        p1.setWhatsappNumber("+918888877777");
        p1.setUpiId("private.coorg@upi");

        when(sellerProfileRepository.findAll()).thenReturn(List.of(p1));
        when(sellerFollowRepository.countBySellerId("s-1")).thenReturn(10L);
        when(productRepository.findBySellerIdOrderByCreatedAtDesc("s-1")).thenReturn(Collections.emptyList());

        List<PublicSellerProfileDto> list = sellerFollowService.getPublicSellers(null);

        assertEquals(1, list.size());
        PublicSellerProfileDto dto = list.get(0);
        assertEquals("Coorg Spices", dto.getShopName());
        assertEquals("@coorg-spices", dto.getSlug());
        assertEquals(10L, dto.getFollowerCount());
        assertTrue(dto.isVerified());
    }
}
