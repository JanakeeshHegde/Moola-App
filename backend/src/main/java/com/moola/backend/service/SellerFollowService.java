package com.moola.backend.service;

import com.moola.backend.dto.PublicSellerProfileDto;
import com.moola.backend.dto.SellerShopDto;
import com.moola.backend.model.Product;
import com.moola.backend.model.SeasonalCampaign;
import com.moola.backend.model.SellerFollow;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SellerFollowService {

    private final SellerFollowRepository sellerFollowRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SeasonalCampaignRepository seasonalCampaignRepository;

    public SellerFollowService(SellerFollowRepository sellerFollowRepository,
                               SellerProfileRepository sellerProfileRepository,
                               UserRepository userRepository,
                               ProductRepository productRepository,
                               SeasonalCampaignRepository seasonalCampaignRepository) {
        this.sellerFollowRepository = sellerFollowRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.seasonalCampaignRepository = seasonalCampaignRepository;
    }

    public Map<String, Object> followSeller(String buyerId, String sellerId) {
        if (buyerId.equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot follow your own shop");
        }

        SellerProfile sellerProfile = sellerProfileRepository.findByUserId(sellerId)
                .orElse(null);
        String shopName = sellerProfile != null ? sellerProfile.getShopName() : "Artisan Kitchen";

        if (!sellerFollowRepository.existsByBuyerIdAndSellerId(buyerId, sellerId)) {
            SellerFollow follow = new SellerFollow(buyerId, sellerId, shopName);
            sellerFollowRepository.save(follow);
        }

        long count = sellerFollowRepository.countBySellerId(sellerId);
        return Map.of("isFollowing", true, "followerCount", count);
    }

    public Map<String, Object> unfollowSeller(String buyerId, String sellerId) {
        sellerFollowRepository.deleteByBuyerIdAndSellerId(buyerId, sellerId);
        long count = sellerFollowRepository.countBySellerId(sellerId);
        return Map.of("isFollowing", false, "followerCount", count);
    }

    public Map<String, Object> getFollowStatus(String buyerId, String sellerId) {
        boolean isFollowing = buyerId != null && sellerFollowRepository.existsByBuyerIdAndSellerId(buyerId, sellerId);
        long count = sellerFollowRepository.countBySellerId(sellerId);
        return Map.of("isFollowing", isFollowing, "followerCount", count);
    }

    public List<SellerProfile> getFollowedSellers(String buyerId) {
        List<SellerFollow> follows = sellerFollowRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        List<SellerProfile> list = new ArrayList<>();
        for (SellerFollow f : follows) {
            sellerProfileRepository.findByUserId(f.getSellerId()).ifPresent(p -> list.add(sanitizeProfile(p)));
        }
        return list;
    }

    public List<Product> getFollowedSellersFeed(String buyerId) {
        List<SellerFollow> follows = sellerFollowRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        if (follows.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> sellerIds = follows.stream().map(SellerFollow::getSellerId).collect(Collectors.toList());
        List<Product> products = new ArrayList<>();
        for (String sId : sellerIds) {
            List<Product> pList = productRepository.findBySellerIdOrderByCreatedAtDesc(sId);
            for (Product p : pList) {
                if (p.isActive() && p.isApproved()) {
                    products.add(p);
                }
            }
        }
        products.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return products;
    }

    public List<PublicSellerProfileDto> getPublicSellers(String search) {
        List<SellerProfile> profiles = sellerProfileRepository.findAll();
        List<PublicSellerProfileDto> results = new ArrayList<>();

        String query = (search != null) ? search.trim().toLowerCase() : "";

        for (SellerProfile p : profiles) {
            String shopName = p.getShopName() != null ? p.getShopName() : "Artisan Kitchen";
            String desc = p.getDescription() != null ? p.getDescription() : "";
            String slug = PublicSellerProfileDto.generateSlug(shopName);

            // Filter if query is provided
            if (!query.isEmpty()) {
                boolean matches = shopName.toLowerCase().contains(query)
                        || desc.toLowerCase().contains(query)
                        || slug.contains(query);
                if (!matches) continue;
            }

            String sellerId = p.getUserId();
            long followerCount = sellerFollowRepository.countBySellerId(sellerId);
            long productCount = productRepository.countBySellerIdAndIsActiveAndIsApproved(sellerId, true, true);

            List<Product> top = productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                    .stream()
                    .filter(prod -> prod.isActive() && prod.isApproved())
                    .limit(3)
                    .collect(Collectors.toList());

            PublicSellerProfileDto dto = new PublicSellerProfileDto(
                    sellerId,
                    shopName,
                    "@" + slug,
                    desc,
                    p.getLogo(),
                    p.isVerified(),
                    p.isVerified() ? "verified" : "pending",
                    p.getAverageRating() > 0 ? p.getAverageRating() : 4.8,
                    p.getRatingCount(),
                    followerCount,
                    productCount
            );
            dto.setTopProducts(top);
            results.add(dto);
        }

        // Sort verified and highest follower count first
        results.sort((a, b) -> {
            if (a.isVerified() != b.isVerified()) {
                return a.isVerified() ? -1 : 1;
            }
            return Long.compare(b.getFollowerCount(), a.getFollowerCount());
        });

        return results;
    }

    public SellerShopDto getSellerShop(String sellerId, String currentBuyerId) {
        SellerProfile rawProfile = sellerProfileRepository.findByUserId(sellerId).orElse(null);
        User user = userRepository.findById(sellerId).orElse(null);

        String sellerName = user != null ? user.getName() : "Artisan Maker";
        SellerProfile profile;
        if (rawProfile == null) {
            profile = new SellerProfile();
            profile.setUserId(sellerId);
            profile.setShopName(sellerName + "'s Kitchen");
            profile.setDescription("Authentic homemade products directly from the maker.");
            profile.setVerified(true);
            profile.setKycStatus("verified");
            profile.setAverageRating(4.9);
        } else {
            profile = sanitizeProfile(rawProfile);
        }

        long followerCount = sellerFollowRepository.countBySellerId(sellerId);
        boolean isFollowing = currentBuyerId != null && sellerFollowRepository.existsByBuyerIdAndSellerId(currentBuyerId, sellerId);

        List<Product> products = productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .filter(p -> p.isActive() && p.isApproved())
                .collect(Collectors.toList());

        List<SeasonalCampaign> campaigns = seasonalCampaignRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .filter(SeasonalCampaign::isActive)
                .collect(Collectors.toList());

        String slug = PublicSellerProfileDto.generateSlug(profile.getShopName());
        PublicSellerProfileDto publicProfile = new PublicSellerProfileDto(
                sellerId,
                profile.getShopName(),
                "@" + slug,
                profile.getDescription(),
                profile.getLogo(),
                profile.isVerified(),
                profile.isVerified() ? "verified" : "pending",
                profile.getAverageRating() > 0 ? profile.getAverageRating() : 4.8,
                profile.getRatingCount(),
                followerCount,
                products.size()
        );
        publicProfile.setTopProducts(products.stream().limit(3).collect(Collectors.toList()));

        SellerShopDto shopDto = new SellerShopDto(sellerId, sellerName, profile, followerCount, isFollowing, products, campaigns);
        shopDto.setPublicProfile(publicProfile);
        shopDto.setShareUrl("https://moola.market/shop?id=" + sellerId);

        return shopDto;
    }

    /**
     * Strips all private fields (KYC documents, bank/UPI, phone, sales/revenue figures)
     * before exposing the profile object to buyers or visitors.
     */
    private SellerProfile sanitizeProfile(SellerProfile raw) {
        if (raw == null) return null;
        SellerProfile safe = new SellerProfile();
        safe.setId(raw.getId());
        safe.setUserId(raw.getUserId());
        safe.setShopName(raw.getShopName());
        safe.setDescription(raw.getDescription());
        safe.setLogo(raw.getLogo());
        safe.setVerified(raw.isVerified());
        safe.setKycStatus(raw.isVerified() ? "verified" : "pending");
        safe.setAverageRating(raw.getAverageRating() > 0 ? raw.getAverageRating() : 4.8);
        safe.setRatingCount(raw.getRatingCount());
        safe.setCreatedAt(raw.getCreatedAt());

        // Private fields explicitly erased
        safe.setWhatsappNumber(null);
        safe.setUpiId(null);
        safe.setPaymentInstructions(null);
        safe.setKycDocuments(new ArrayList<>());
        safe.setRejectionReason(null);
        safe.setTotalRevenue(0);
        safe.setTotalSales(0);

        return safe;
    }
}
