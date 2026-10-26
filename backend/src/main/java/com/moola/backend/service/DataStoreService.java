package com.moola.backend.service;

import com.moola.backend.model.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class DataStoreService {

    private final List<User> users = new CopyOnWriteArrayList<>();
    private final Map<String, SellerProfile> sellerProfiles = new ConcurrentHashMap<>();
    private final List<Category> categories = new CopyOnWriteArrayList<>();
    private final List<Product> products = new CopyOnWriteArrayList<>();
    private final List<Order> orders = new CopyOnWriteArrayList<>();
    private final List<Notification> notifications = new CopyOnWriteArrayList<>();
    private final List<Complaint> complaints = new CopyOnWriteArrayList<>();
    private final List<AccountDeletionRequest> deletionRequests = new CopyOnWriteArrayList<>();
    private final List<CustomRequest> customRequests = new CopyOnWriteArrayList<>();
    private final List<SeasonalCampaign> campaigns = new CopyOnWriteArrayList<>();
    private final List<PreBooking> preBookings = new CopyOnWriteArrayList<>();
    private final List<Conversation> conversations = new CopyOnWriteArrayList<>();
    private final Map<String, List<ChatMessage>> messagesMap = new ConcurrentHashMap<>();
    private final List<WhatsAppEnquiry> enquiries = new CopyOnWriteArrayList<>();
    private final Map<String, Set<String>> sellerFollowers = new ConcurrentHashMap<>(); // sellerUserId -> set of buyerIds

    public DataStoreService() {
        initInitialData();
    }

    private void initInitialData() {
        // Users
        User admin = new User("user_admin_01", "Admin User", "9000000000", "admin@moola.com", "admin", "en", true, "admin@moola123");
        User seller = new User("user_seller_01", "Ramesh Seller", "9000000001", "ramesh@seller.com", "seller", "en", true, "seller@123");
        User buyer = new User("user_buyer_03", "Anita Buyer", "9000000003", "anita@buyer.com", "buyer", "en", true, "buyer@123");
        users.addAll(Arrays.asList(admin, seller, buyer));

        // Seller Profile
        SellerProfile sp = new SellerProfile("seller_profile_01", "user_seller_01", "Ramesh Organic Farm & Mandi", "Direct from organic farmers to your doorstep.", 4.8, 1250, true, "ramesh@upi", "Green Valley, Village Road");
        sellerProfiles.put("user_seller_01", sp);

        // Categories
        categories.add(new Category("cat_1", "Organic Vegetables", "vegetables"));
        categories.add(new Category("cat_2", "Fresh Fruits", "fruits"));
        categories.add(new Category("cat_3", "Grains & Pulses", "grains"));
        categories.add(new Category("cat_4", "Dairy & Honey", "dairy"));
        categories.add(new Category("cat_5", "Handicrafts", "handicrafts"));

        // Products
        Product p1 = new Product("prod_1", "Organic Desi Tomatoes", 45.0, "kg", "cat_1", "Organic Vegetables", "user_seller_01", "Ramesh Organic Farm & Mandi", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500", "Freshly harvested organic tomatoes grown without chemical fertilizers.", true, 150);
        Product p2 = new Product("prod_2", "Alphonso Mangoes (Box)", 650.0, "dozen", "cat_2", "Fresh Fruits", "user_seller_01", "Ramesh Organic Farm & Mandi", "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500", "Sweet and juicy Ratnagiri Alphonso mangoes.", true, 40);
        products.addAll(Arrays.asList(p1, p2));

        // Orders
        Order.OrderItem item1 = new Order.OrderItem("prod_1", "Organic Desi Tomatoes", 2, 45.0);
        Order o1 = new Order("ord_101", "user_buyer_03", "Anita Buyer", "9000000003", "user_seller_01", "Ramesh Organic Farm & Mandi", Collections.singletonList(item1), 90.0, "CONFIRMED", "VERIFIED", Instant.now().toString());
        orders.add(o1);

        // Notifications
        Notification n1 = new Notification("notif_1", "user_buyer_03", "Welcome to Moola!", "Explore direct farm-to-table organic produce and artisan goods.", false, Instant.now().toString());
        notifications.add(n1);

        // Campaigns
        SeasonalCampaign c1 = new SeasonalCampaign("camp_1", "Mango Harvest Special", "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500", "Pre-book fresh Alphonsos at early bird rates!", 15.0, "2025-04-01", "2025-05-30", true);
        campaigns.add(c1);
    }

    public List<User> getUsers() { return users; }
    public Map<String, SellerProfile> getSellerProfiles() { return sellerProfiles; }
    public List<Category> getCategories() { return categories; }
    public List<Product> getProducts() { return products; }
    public List<Order> getOrders() { return orders; }
    public List<Notification> getNotifications() { return notifications; }
    public List<Complaint> getComplaints() { return complaints; }
    public List<AccountDeletionRequest> getDeletionRequests() { return deletionRequests; }
    public List<CustomRequest> getCustomRequests() { return customRequests; }
    public List<SeasonalCampaign> getCampaigns() { return campaigns; }
    public List<PreBooking> getPreBookings() { return preBookings; }
    public List<Conversation> getConversations() { return conversations; }
    public Map<String, List<ChatMessage>> getMessagesMap() { return messagesMap; }
    public List<WhatsAppEnquiry> getEnquiries() { return enquiries; }
    public Map<String, Set<String>> getSellerFollowers() { return sellerFollowers; }

    public User resolveUserFromToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            // Default to buyer
            return users.stream().filter(u -> u.getId().equals("user_buyer_03")).findFirst().orElse(users.get(0));
        }
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        return users.stream()
                .filter(u -> u.getId().equals(token) || ("token_" + u.getId()).equals(token))
                .findFirst()
                .orElse(users.stream().filter(u -> u.getId().equals("user_buyer_03")).findFirst().orElse(users.get(0)));
    }
}
