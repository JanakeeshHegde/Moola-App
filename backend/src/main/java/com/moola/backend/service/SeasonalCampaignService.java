package com.moola.backend.service;

import com.moola.backend.model.Order;
import com.moola.backend.model.PreBooking;
import com.moola.backend.model.SeasonalCampaign;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.PreBookingRepository;
import com.moola.backend.repository.SeasonalCampaignRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class SeasonalCampaignService {

    private final SeasonalCampaignRepository campaignRepository;
    private final PreBookingRepository preBookingRepository;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;

    public SeasonalCampaignService(SeasonalCampaignRepository campaignRepository,
                                  PreBookingRepository preBookingRepository,
                                  UserRepository userRepository,
                                  SellerProfileRepository sellerProfileRepository) {
        this.campaignRepository = campaignRepository;
        this.preBookingRepository = preBookingRepository;
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
    }

    public List<SeasonalCampaign> getActiveCampaigns() {
        return campaignRepository.findByIsActiveTrueOrderByStartDateAsc();
    }

    public SeasonalCampaign getCampaignById(String id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seasonal campaign not found"));
    }

    public SeasonalCampaign createCampaign(String creatorId, boolean isAdmin, Map<String, Object> body) {
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String bannerImageUrl = (String) body.get("bannerImageUrl");
        String productName = (String) body.get("productName");
        String unit = (String) body.get("unit");
        Number priceNum = (Number) body.get("price");
        Number capacityNum = (Number) body.get("maxBookingCapacity");
        Number maxPerBuyerNum = (Number) body.get("maxQtyPerBuyer");
        String deliveryWindow = (String) body.get("expectedDeliveryWindow");

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campaign title is required");
        }
        if (priceNum == null || priceNum.doubleValue() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid price is required");
        }
        if (capacityNum == null || capacityNum.intValue() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking capacity is required");
        }

        SeasonalCampaign campaign = new SeasonalCampaign();
        campaign.setTitle(title.trim());
        campaign.setDescription(description != null ? description.trim() : "");
        campaign.setBannerImageUrl(bannerImageUrl != null ? bannerImageUrl : "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800");
        campaign.setProductName(productName != null ? productName : title);
        campaign.setUnit(unit != null ? unit : "kg");
        campaign.setPrice(priceNum.doubleValue());
        campaign.setMaxBookingCapacity(capacityNum.intValue());
        campaign.setBookedQuantity(0);
        campaign.setMaxQtyPerBuyer(maxPerBuyerNum != null ? maxPerBuyerNum.intValue() : 10);
        campaign.setExpectedDeliveryWindow(deliveryWindow != null ? deliveryWindow : "During festival harvest week");

        // Associated seller
        String sellerId = (String) body.get("sellerId");
        if (sellerId == null || sellerId.isBlank()) {
            sellerId = creatorId;
        }
        campaign.setSellerId(sellerId);

        User seller = userRepository.findById(sellerId).orElse(null);
        SellerProfile sp = sellerProfileRepository.findByUserId(sellerId).orElse(null);
        campaign.setSellerName(seller != null ? seller.getName() : "Artisan Producer");
        campaign.setSellerShopName(sp != null ? sp.getShopName() : "Organic Harvest");

        campaign.setStartDate(Instant.now());
        campaign.setBookingDeadline(Instant.now().plus(30, ChronoUnit.DAYS));
        campaign.setExpectedHarvestDate(Instant.now().plus(35, ChronoUnit.DAYS));
        campaign.setStatus("ACTIVE");
        campaign.setActive(true);

        return campaignRepository.save(campaign);
    }

    public synchronized PreBooking preBook(String campaignId, String buyerId, Map<String, Object> body) {
        SeasonalCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seasonal campaign not found"));

        if (!campaign.isActive() || !"ACTIVE".equals(campaign.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This seasonal campaign is not currently open for pre-booking");
        }

        if (campaign.getBookingDeadline() != null && Instant.now().isAfter(campaign.getBookingDeadline())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-booking deadline for this campaign has closed");
        }

        Number qtyNum = (Number) body.get("quantity");
        int qty = qtyNum != null ? qtyNum.intValue() : 1;
        if (qty <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        if (qty > campaign.getMaxQtyPerBuyer()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity exceeds limit of " + campaign.getMaxQtyPerBuyer() + " per customer");
        }

        int remainingCapacity = campaign.getMaxBookingCapacity() - campaign.getBookedQuantity();
        if (qty > remainingCapacity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient batch capacity remaining. Only " + remainingCapacity + " " + campaign.getUnit() + " available.");
        }

        // Atomic update of booked quantity
        campaign.setBookedQuantity(campaign.getBookedQuantity() + qty);
        if (campaign.getBookedQuantity() >= campaign.getMaxBookingCapacity()) {
            campaign.setStatus("SOLD_OUT");
        }
        campaignRepository.save(campaign);

        User buyer = userRepository.findById(buyerId).orElse(null);

        PreBooking booking = new PreBooking();
        booking.setBookingNumber("PB-" + (100000 + new Random().nextInt(900000)));
        booking.setCampaignId(campaign.getId());
        booking.setCampaignTitle(campaign.getTitle());
        booking.setBuyerId(buyerId);
        booking.setBuyerName(buyer != null ? buyer.getName() : "Valued Patron");
        booking.setBuyerPhone(buyer != null ? buyer.getPhone() : "");
        booking.setSellerId(campaign.getSellerId());
        booking.setSellerName(campaign.getSellerName());
        booking.setSellerShopName(campaign.getSellerShopName());
        booking.setProductName(campaign.getProductName());
        booking.setQuantity(qty);
        booking.setUnit(campaign.getUnit());
        booking.setUnitPrice(campaign.getPrice());
        booking.setTotalAmount(campaign.getPrice() * qty);

        Order.ShippingAddress addr = new Order.ShippingAddress();
        addr.setName(buyer != null ? buyer.getName() : "Customer");
        addr.setPhone(buyer != null ? buyer.getPhone() : "");
        addr.setLine1((String) body.getOrDefault("deliveryAddress", "Customer Residence"));
        addr.setCity("Karnataka");
        booking.setDeliveryAddress(addr);

        booking.setStatus("BOOKED");
        return preBookingRepository.save(booking);
    }

    public List<PreBooking> getBuyerBookings(String buyerId) {
        return preBookingRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<PreBooking> getSellerBookings(String sellerId) {
        return preBookingRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }
}
