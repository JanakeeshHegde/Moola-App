package com.moola.backend.model;

public class SeasonalCampaign {
    private String id;
    private String title;
    private String bannerUrl;
    private String description;
    private Double discountPercentage;
    private String startDate;
    private String endDate;
    private Boolean active;

    public SeasonalCampaign() {}

    public SeasonalCampaign(String id, String title, String bannerUrl, String description, Double discountPercentage, String startDate, String endDate, Boolean active) {
        this.id = id;
        this.title = title;
        this.bannerUrl = bannerUrl;
        this.description = description;
        this.discountPercentage = discountPercentage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
