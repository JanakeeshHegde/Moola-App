package com.moola.backend.model;

public class PublicSellerProfile {
    private String id;
    private String userId;
    private String shopName;
    private String bio;
    private Double rating;
    private Integer totalSales;
    private Boolean isVerifiedKyc;
    private String upiId;
    private String address;
    private Integer followerCount;
    private Boolean isFollowing;

    public PublicSellerProfile() {}

    public PublicSellerProfile(SellerProfile profile, Integer followerCount, Boolean isFollowing) {
        if (profile != null) {
            this.id = profile.getId();
            this.userId = profile.getUserId();
            this.shopName = profile.getShopName();
            this.bio = profile.getBio();
            this.rating = profile.getRating();
            this.totalSales = profile.getTotalSales();
            this.isVerifiedKyc = profile.getIsVerifiedKyc();
            this.upiId = profile.getUpiId();
            this.address = profile.getAddress();
        }
        this.followerCount = followerCount != null ? followerCount : 0;
        this.isFollowing = isFollowing != null ? isFollowing : false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getTotalSales() { return totalSales; }
    public void setTotalSales(Integer totalSales) { this.totalSales = totalSales; }
    public Boolean getIsVerifiedKyc() { return isVerifiedKyc; }
    public void setIsVerifiedKyc(Boolean isVerifiedKyc) { this.isVerifiedKyc = isVerifiedKyc; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Integer getFollowerCount() { return followerCount; }
    public void setFollowerCount(Integer followerCount) { this.followerCount = followerCount; }
    public Boolean getIsFollowing() { return isFollowing; }
    public void setIsFollowing(Boolean isFollowing) { this.isFollowing = isFollowing; }
}
