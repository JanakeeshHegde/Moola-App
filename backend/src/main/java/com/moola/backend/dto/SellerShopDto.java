package com.moola.backend.dto;

import com.moola.backend.model.Product;
import com.moola.backend.model.SeasonalCampaign;
import com.moola.backend.model.SellerProfile;

import java.util.ArrayList;
import java.util.List;

public class SellerShopDto {

    private String sellerId;
    private String sellerName;
    private PublicSellerProfileDto publicProfile;
    private SellerProfile profile;
    private long followerCount;
    private boolean isFollowing;
    private String shareUrl;
    private List<Product> products = new ArrayList<>();
    private List<SeasonalCampaign> seasonalCampaigns = new ArrayList<>();

    public SellerShopDto() {}

    public SellerShopDto(String sellerId, String sellerName, SellerProfile profile,
                         long followerCount, boolean isFollowing,
                         List<Product> products, List<SeasonalCampaign> seasonalCampaigns) {
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.profile = profile;
        this.followerCount = followerCount;
        this.isFollowing = isFollowing;
        this.products = products != null ? products : new ArrayList<>();
        this.seasonalCampaigns = seasonalCampaigns != null ? seasonalCampaigns : new ArrayList<>();
    }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public PublicSellerProfileDto getPublicProfile() { return publicProfile; }
    public void setPublicProfile(PublicSellerProfileDto publicProfile) { this.publicProfile = publicProfile; }

    public SellerProfile getProfile() { return profile; }
    public void setProfile(SellerProfile profile) { this.profile = profile; }

    public long getFollowerCount() { return followerCount; }
    public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }

    public boolean isFollowing() { return isFollowing; }
    public void setFollowing(boolean following) { isFollowing = following; }

    public String getShareUrl() { return shareUrl; }
    public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    public List<SeasonalCampaign> getSeasonalCampaigns() { return seasonalCampaigns; }
    public void setSeasonalCampaigns(List<SeasonalCampaign> seasonalCampaigns) { this.seasonalCampaigns = seasonalCampaigns; }
}
