package com.moola.backend.model;

import java.util.List;

public class BuyerDashboardData {
    private Double walletBalance;
    private Integer activeOrdersCount;
    private List<Category> featuredCategories;
    private List<Product> featuredProducts;

    public BuyerDashboardData() {}

    public BuyerDashboardData(Double walletBalance, Integer activeOrdersCount, List<Category> featuredCategories, List<Product> featuredProducts) {
        this.walletBalance = walletBalance;
        this.activeOrdersCount = activeOrdersCount;
        this.featuredCategories = featuredCategories;
        this.featuredProducts = featuredProducts;
    }

    public Double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }
    public Integer getActiveOrdersCount() { return activeOrdersCount; }
    public void setActiveOrdersCount(Integer activeOrdersCount) { this.activeOrdersCount = activeOrdersCount; }
    public List<Category> getFeaturedCategories() { return featuredCategories; }
    public void setFeaturedCategories(List<Category> featuredCategories) { this.featuredCategories = featuredCategories; }
    public List<Product> getFeaturedProducts() { return featuredProducts; }
    public void setFeaturedProducts(List<Product> featuredProducts) { this.featuredProducts = featuredProducts; }
}
