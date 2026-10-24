package com.moola.app.data.model;

import java.io.Serializable;

public class SeasonalCampaign implements Serializable {

    private String id;
    private String title;
    private String description;
    private String bannerImageUrl;
    private String sellerId;
    private String sellerName;
    private String sellerShopName;
    private String productId;
    private String productName;
    private String categoryId;
    private String unit;
    private double price;
    private String startDate;
    private String bookingDeadline;
    private String expectedHarvestDate;
    private String expectedDeliveryWindow;
    private int maxBookingCapacity;
    private int bookedQuantity;
    private int maxQtyPerBuyer;
    private String status; // ACTIVE, SOLD_OUT, CLOSED
    private boolean isActive;

    public SeasonalCampaign() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBannerImageUrl() { return bannerImageUrl; }
    public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }
    public String getImageUrl() { return bannerImageUrl; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerShopName() { return sellerShopName; }
    public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getBookingDeadline() { return bookingDeadline; }
    public void setBookingDeadline(String bookingDeadline) { this.bookingDeadline = bookingDeadline; }

    public String getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(String expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }

    public String getExpectedDeliveryWindow() { return expectedDeliveryWindow; }
    public void setExpectedDeliveryWindow(String expectedDeliveryWindow) { this.expectedDeliveryWindow = expectedDeliveryWindow; }

    public int getMaxBookingCapacity() { return maxBookingCapacity; }
    public void setMaxBookingCapacity(int maxBookingCapacity) { this.maxBookingCapacity = maxBookingCapacity; }

    public int getBookedQuantity() { return bookedQuantity; }
    public void setBookedQuantity(int bookedQuantity) { this.bookedQuantity = bookedQuantity; }

    public int getMaxQtyPerBuyer() { return maxQtyPerBuyer; }
    public void setMaxQtyPerBuyer(int maxQtyPerBuyer) { this.maxQtyPerBuyer = maxQtyPerBuyer; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
