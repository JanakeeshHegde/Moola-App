package com.moola.app.data.model;

import java.io.Serializable;

public class SellerProfile implements Serializable {
    private String id;
    private String userId;
    private String shopName;
    private String description;
    private String logo;
    private String kycStatus;
    private boolean isVerified;
    private String whatsappNumber;
    private String upiId;
    private String paymentInstructions;
    private double averageRating;
    private int ratingCount;
    private int totalSales;
    private double totalRevenue;
    private String fssaiNumber;

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getShopName() { return shopName; }
    public String getDescription() { return description; }
    public String getLogo() { return logo; }
    public String getKycStatus() { return kycStatus; }
    public boolean isVerified() { return isVerified; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public String getUpiId() { return upiId; }
    public String getPaymentInstructions() { return paymentInstructions; }
    public double getAverageRating() { return averageRating; }
    public double getRating() { return averageRating; }
    public int getRatingCount() { return ratingCount; }
    public int getTotalSales() { return totalSales; }
    public double getTotalRevenue() { return totalRevenue; }
    public String getFssaiNumber() { return fssaiNumber; }
}
