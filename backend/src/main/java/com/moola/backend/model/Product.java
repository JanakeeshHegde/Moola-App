package com.moola.backend.model;

public class Product {
    private String id;
    private String title;
    private Double price;
    private String unit;
    private String categoryId;
    private String categoryName;
    private String sellerId;
    private String sellerName;
    private String imageUrl;
    private String description;
    private Boolean isOrganic;
    private Integer stockQuantity;
    private String status;

    public Product() {}

    public Product(String id, String title, Double price, String unit, String categoryId, String categoryName, String sellerId, String sellerName, String imageUrl, String description, Boolean isOrganic, Integer stockQuantity) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.unit = unit;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.imageUrl = imageUrl;
        this.description = description;
        this.isOrganic = isOrganic;
        this.stockQuantity = stockQuantity;
        this.status = "APPROVED";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsOrganic() { return isOrganic; }
    public void setIsOrganic(Boolean isOrganic) { this.isOrganic = isOrganic; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
