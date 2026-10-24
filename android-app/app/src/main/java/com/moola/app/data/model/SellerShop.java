package com.moola.app.data.model;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

public class SellerShop {

    @SerializedName("sellerId")
    private String sellerId;

    @SerializedName("sellerName")
    private String sellerName;

    @SerializedName("profile")
    private SellerProfile profile;

    @SerializedName("publicProfile")
    private PublicSellerProfile publicProfile;

    @SerializedName("followerCount")
    private long followerCount;

    @SerializedName("isFollowing")
    private boolean isFollowing;

    @SerializedName("shareUrl")
    private String shareUrl;

    @SerializedName("products")
    private List<Product> products = new ArrayList<>();

    @SerializedName("seasonalCampaigns")
    private List<SeasonalCampaign> seasonalCampaigns = new ArrayList<>();

    public SellerShop() {}

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public SellerProfile getProfile() { return profile; }
    public void setProfile(SellerProfile profile) { this.profile = profile; }

    public PublicSellerProfile getPublicProfile() { return publicProfile; }
    public void setPublicProfile(PublicSellerProfile publicProfile) { this.publicProfile = publicProfile; }

    public long getFollowerCount() { return followerCount; }
    public void setFollowerCount(long followerCount) { this.followerCount = followerCount; }

    public boolean isFollowing() { return isFollowing; }
    public void setFollowing(boolean following) { isFollowing = following; }

    public String getShareUrl() { return shareUrl != null ? shareUrl : ("https://moola.market/shop?id=" + sellerId); }
    public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    public List<SeasonalCampaign> getSeasonalCampaigns() { return seasonalCampaigns; }
    public void setSeasonalCampaigns(List<SeasonalCampaign> seasonalCampaigns) { this.seasonalCampaigns = seasonalCampaigns; }
}
