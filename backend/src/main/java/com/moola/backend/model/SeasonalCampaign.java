package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "seasonal_campaigns")
public class SeasonalCampaign {

    @Id
    private String id;

    private String title;
    private String description;
    private String bannerImageUrl;

    @Indexed
    private String sellerId;
    private String sellerName;
    private String sellerShopName;

    private String productId;
    private String productName;
    private String categoryId;
    private String unit;
    private double price;

    private Instant startDate;
    private Instant bookingDeadline;
    private Instant expectedHarvestDate;
    private String expectedDeliveryWindow; // e.g. "Nov 10 – Nov 15, 2026 (Diwali dispatch)"

    private int maxBookingCapacity;
    private int bookedQuantity = 0;
    private int maxQtyPerBuyer = 10;

    // Status: UPCOMING, ACTIVE, SOLD_OUT, CLOSED
    @Indexed
    private String status = "ACTIVE";

    private boolean isActive = true;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public SeasonalCampaign() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBannerImageUrl() { return bannerImageUrl; }
    public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }

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

    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }

    public Instant getBookingDeadline() { return bookingDeadline; }
    public void setBookingDeadline(Instant bookingDeadline) { this.bookingDeadline = bookingDeadline; }

    public Instant getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(Instant expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
