package com.moola.backend.dto;

import com.moola.backend.model.CustomRequest;
import com.moola.backend.model.Order;
import com.moola.backend.model.User;

import java.util.ArrayList;
import java.util.List;

public class BuyerDashboardDto {

    private User user;
    private long activeOrdersCount;
    private long totalOrdersCount;
    private List<Order> recentOrders = new ArrayList<>();

    private long activeDemandsCount;
    private long totalDemandsCount;
    private List<CustomRequest> recentDemands = new ArrayList<>();

    private long followedShopsCount;
    private List<PublicSellerProfileDto> followedShops = new ArrayList<>();

    private long unreadMessagesCount;
    private long unreadNotificationsCount;

    public BuyerDashboardDto() {}

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public long getActiveOrdersCount() { return activeOrdersCount; }
    public void setActiveOrdersCount(long activeOrdersCount) { this.activeOrdersCount = activeOrdersCount; }

    public long getTotalOrdersCount() { return totalOrdersCount; }
    public void setTotalOrdersCount(long totalOrdersCount) { this.totalOrdersCount = totalOrdersCount; }

    public List<Order> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<Order> recentOrders) { this.recentOrders = recentOrders; }

    public long getActiveDemandsCount() { return activeDemandsCount; }
    public void setActiveDemandsCount(long activeDemandsCount) { this.activeDemandsCount = activeDemandsCount; }

    public long getTotalDemandsCount() { return totalDemandsCount; }
    public void setTotalDemandsCount(long totalDemandsCount) { this.totalDemandsCount = totalDemandsCount; }

    public List<CustomRequest> getRecentDemands() { return recentDemands; }
    public void setRecentDemands(List<CustomRequest> recentDemands) { this.recentDemands = recentDemands; }

    public long getFollowedShopsCount() { return followedShopsCount; }
    public void setFollowedShopsCount(long followedShopsCount) { this.followedShopsCount = followedShopsCount; }

    public List<PublicSellerProfileDto> getFollowedShops() { return followedShops; }
    public void setFollowedShops(List<PublicSellerProfileDto> followedShops) { this.followedShops = followedShops; }

    public long getUnreadMessagesCount() { return unreadMessagesCount; }
    public void setUnreadMessagesCount(long unreadMessagesCount) { this.unreadMessagesCount = unreadMessagesCount; }

    public long getUnreadNotificationsCount() { return unreadNotificationsCount; }
    public void setUnreadNotificationsCount(long unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }
}
