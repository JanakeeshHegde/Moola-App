package com.moola.backend.model;

public class SellerProfile {
    private String id;
    private String userId;
    private String shopName;
    private String bio;
    private Double rating;
    private Integer totalSales;
    private Boolean isVerifiedKyc;
    private String upiId;
    private String address;

    public SellerProfile() {}

    public SellerProfile(String id, String userId, String shopName, String bio, Double rating, Integer totalSales, Boolean isVerifiedKyc, String upiId, String address) {
        this.id = id;
        this.userId = userId;
        this.shopName = shopName;
        this.bio = bio;
        this.rating = rating;
        this.totalSales = totalSales;
        this.isVerifiedKyc = isVerifiedKyc;
        this.upiId = upiId;
        this.address = address;
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
}
