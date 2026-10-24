package com.moola.backend.service;

import com.moola.backend.model.*;
import com.moola.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class DataSeedService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeedService.class);

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ComplaintRepository complaintRepository;
    private final CustomRequestRepository customRequestRepository;
    private final SeasonalCampaignRepository seasonalCampaignRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeedService(UserRepository userRepository,
                           SellerProfileRepository sellerProfileRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           OrderRepository orderRepository,
                           ComplaintRepository complaintRepository,
                           CustomRequestRepository customRequestRepository,
                           SeasonalCampaignRepository seasonalCampaignRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.complaintRepository = complaintRepository;
        this.customRequestRepository = customRequestRepository;
        this.seasonalCampaignRepository = seasonalCampaignRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Checking MOOLA database initialization...");

            if (userRepository.count() == 0) {
                seedAll();
            } else {
                log.info("MOOLA database already contains core data.");
            }
            seedSeasonalCampaignsIfEmpty();
            seedCustomRequestsIfEmpty();
        } catch (Exception e) {
            log.warn("Database connection notice: {} (will operate in memory or await connection)", e.getMessage());
        }
    }

    public void seedAll() {
        log.info("Seeding MOOLA core entities...");

        // 1. Admin
        User admin = new User();
        admin.setName("MOOLA Admin");
        admin.setPhone("9000000000");
        admin.setPasswordHash(passwordEncoder.encode("admin@moola123"));
        admin.setRole("admin");
        admin.setActive(true);
        admin = userRepository.save(admin);

        // 2. Sellers
        User seller1 = new User();
        seller1.setName("Ramesh Kumar");
        seller1.setPhone("9000000001");
        seller1.setPasswordHash(passwordEncoder.encode("seller@123"));
        seller1.setRole("seller");
        seller1.setLocation(new User.Location("Karnataka", "Kodagu", "571201"));
        seller1 = userRepository.save(seller1);

        SellerProfile profile1 = new SellerProfile();
        profile1.setUserId(seller1.getId());
        profile1.setShopName("Kodagu Forest Honey & Spices");
        profile1.setDescription("Pure unheated wild forest honey and estate-grown black pepper directly from the Western Ghats canopy.");
        profile1.setKycStatus("verified");
        profile1.setVerified(true);
        profile1.setVerifiedAt(Instant.now());
        profile1.setWhatsappNumber("+919000000001");
        profile1.setWhatsappVerified(true);
        profile1.setUpiId("ramesh.honey@okaxis");
        profile1.setPaymentInstructions("Pay via Google Pay or PhonePe to 9000000001. After payment, submit your UTR reference for immediate dispatch.");
        profile1.setAverageRating(4.9);
        profile1.setRatingCount(28);
        profile1.setTotalSales(154);
        profile1.setTotalRevenue(74200);
        sellerProfileRepository.save(profile1);

        User seller2 = new User();
        seller2.setName("Lakshmi Devi");
        seller2.setPhone("9000000002");
        seller2.setPasswordHash(passwordEncoder.encode("seller@123"));
        seller2.setRole("seller");
        seller2.setLocation(new User.Location("Karnataka", "Mysuru", "570001"));
        seller2 = userRepository.save(seller2);

        SellerProfile profile2 = new SellerProfile();
        profile2.setUserId(seller2.getId());
        profile2.setShopName("Lakshmi Homemade Pickles & Crisps");
        profile2.setDescription("Authentic heritage pickles cured in sesame and mustard oil with heirloom spices. Traditional grandma recipes, zero preservatives.");
        profile2.setKycStatus("verified");
        profile2.setVerified(true);
        profile2.setVerifiedAt(Instant.now());
        profile2.setWhatsappNumber("+919000000002");
        profile2.setWhatsappVerified(true);
        profile2.setUpiId("lakshmi.pickles@okhdfcbank");
        profile2.setPaymentInstructions("Pay via UPI to lakshmi.pickles@okhdfcbank or 9000000002. Submit UTR in app.");
        profile2.setAverageRating(4.8);
        profile2.setRatingCount(42);
        profile2.setTotalSales(210);
        profile2.setTotalRevenue(58900);
        sellerProfileRepository.save(profile2);

        // 3. Buyers
        User buyer1 = new User();
        buyer1.setName("Arjun Sharma");
        buyer1.setPhone("9000000003");
        buyer1.setPasswordHash(passwordEncoder.encode("buyer@123"));
        buyer1.setRole("buyer");
        buyer1.setLocation(new User.Location("Karnataka", "Bengaluru Urban", "560001"));
        buyer1 = userRepository.save(buyer1);

        User buyer2 = new User();
        buyer2.setName("Priya Naik");
        buyer2.setPhone("9000000004");
        buyer2.setPasswordHash(passwordEncoder.encode("buyer@123"));
        buyer2.setRole("buyer");
        buyer2.setLocation(new User.Location("Karnataka", "Bengaluru Urban", "560034"));
        userRepository.save(buyer2);

        // 4. Categories
        Category catChips = categoryRepository.save(new Category("chips", "Homemade Chips & Crisps", "ಮನೆಯ ಬಾಳೆಕಾಯಿ & ಹಲಸಿನ ಚಿಪ್ಸ್", "🥔", 1));
        Category catHoney = categoryRepository.save(new Category("honey", "Pure Honey & Jaggery", "ಕಾಡು ಜೇನು ಮತ್ತು ಬೆಲ್ಲ", "🍯", 2));
        Category catPickles = categoryRepository.save(new Category("pickles", "Traditional Pickles & Chutneys", "ಸಾಂಪ್ರದಾಯಿಕ ಉಪ್ಪಿನಕಾಯಿ", "🫙", 3));
        Category catSpices = categoryRepository.save(new Category("spices", "Organic Spices & Powders", "ಸಾವಯವ ಮಸಾಲೆ ಪುಡಿ", "🌶️", 4));
        Category catSnacks = categoryRepository.save(new Category("snacks", "Homemade Snacks & Papad", "ಸಾಂಪ್ರದಾಯಿಕ ತಿಂಡಿ & ಹಪ್ಪಳ", "🥟", 5));
        Category catOils = categoryRepository.save(new Category("oils", "Cold-Pressed Oils & Desi Ghee", "ಗಾಣದ ಎಣ್ಣೆ & ಹಸುವಿನ ತುಪ್ಪ", "🫒", 6));
        Category catMillets = categoryRepository.save(new Category("flours", "Native Millets & Flours", "ಸಿರಿಧಾನ್ಯ & ನಾಟಿ ಹಿಟ್ಟು", "🌾", 7));
        Category catHerbal = categoryRepository.save(new Category("herbal", "Herbal & Ayurvedic Foods", "ಔಷಧೀಯ ಸಾಂಪ್ರದಾಯಿಕ ಆಹಾರ", "🌿", 8));

        // 5. Products
        Product p1 = new Product();
        p1.setSellerId(seller2.getId());
        p1.setCategoryId(catChips.getId());
        p1.setName(new Product.LocalizedText("Malnad Raw Jackfruit Chips (Halasina Chips)", "ಮಲೆನಾಡಿನ ಗರಿಗರಿ ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್"));
        p1.setDescription(new Product.LocalizedText(
                "Authentic crispy jackfruit chips freshly prepared in pure wood-pressed coconut oil with natural rock salt. Sourced from wild Malnad jackfruits. No palm oil, zero chemical preservatives.",
                "ಶುದ್ಧ ಮರದ ಗಾಣದ ತೆಂಗಿನ ಎಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಮಲೆನಾಡಿನ ನೈಜ ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ತಾಳೆ ಎಣ್ಣೆ ಬಳಸಲಾಗಿಲ್ಲ."
        ));
        p1.setPrice(180.0);
        p1.setMrp(220.0);
        p1.setUnit("250g");
        p1.setQuantityAvailable(45);
        p1.setTags(Arrays.asList("chips", "jackfruit", "homemade", "malnad", "snack"));
        p1.setImages(Collections.singletonList("https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800"));
        p1.setThumbnailUrl("https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400");
        p1.setOrganic(true);
        p1.setCertified(true);
        p1.setCertificationDetails("PGS-India Organic Certified");
        p1.setActive(true);
        p1.setApproved(true);
        p1.setAverageRating(4.9);
        p1.setReviewCount(38);
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setSellerId(seller2.getId());
        p2.setCategoryId(catChips.getId());
        p2.setName(new Product.LocalizedText("Kerala Nendran Banana Chips in Coconut Oil", "ತೆಂಗಿನ ಎಣ್ಣೆಯ ನೇಂದ್ರ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್"));
        p2.setDescription(new Product.LocalizedText(
                "Crisp golden banana chips thinly sliced from freshly harvested Nendran bananas and fried in pure cold-pressed coconut oil with mild turmeric and rock salt.",
                "ಮರದ ಗಾಣದ ತೆಂಗಿನ ಎಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಶುದ್ಧ ಸಾಂಪ್ರದಾಯಿಕ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್."
        ));
        p2.setPrice(160.0);
        p2.setMrp(200.0);
        p2.setUnit("250g");
        p2.setQuantityAvailable(60);
        p2.setTags(Arrays.asList("chips", "banana", "nendran", "coconut-oil"));
        p2.setImages(Collections.singletonList("https://images.unsplash.com/photo-1621996346565-e3d5d6281745?w=800"));
        p2.setThumbnailUrl("https://images.unsplash.com/photo-1621996346565-e3d5d6281745?w=400");
        p2.setOrganic(true);
        p2.setActive(true);
        p2.setApproved(true);
        p2.setAverageRating(4.8);
        p2.setReviewCount(52);
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setSellerId(seller1.getId());
        p3.setCategoryId(catHoney.getId());
        p3.setName(new Product.LocalizedText("Western Ghats Wild Forest Raw Honey", "ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ನೈಜ ಕಾಡು ಜೇನುತುಪ್ಪ"));
        p3.setDescription(new Product.LocalizedText(
                "Unpasteurized, unprocessed multifloral forest honey ethically gathered from the pristine biodiversity forests of Kodagu and Coorg. Rich in enzymes and antioxidants.",
                "ಕೊಡಗಿನ ಕಾಡುಗಳಿಂದ ಸಂಗ್ರಹಿಸಿದ ಕಚ್ಚಾ ಶುದ್ಧ ಜೇನುತುಪ್ಪ. ಯಾವುದೇ ಕೃತಕ ಸಕ್ಕರೆ ಬೆರೆಸಲಾಗಿಲ್ಲ."
        ));
        p3.setPrice(450.0);
        p3.setMrp(550.0);
        p3.setUnit("500g");
        p3.setQuantityAvailable(30);
        p3.setTags(Arrays.asList("honey", "raw-honey", "forest", "wild", "ayurvedic"));
        p3.setImages(Collections.singletonList("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800"));
        p3.setThumbnailUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400");
        p3.setOrganic(true);
        p3.setCertified(true);
        p3.setActive(true);
        p3.setApproved(true);
        p3.setAverageRating(5.0);
        p3.setReviewCount(64);
        productRepository.save(p3);

        Product p4 = new Product();
        p4.setSellerId(seller2.getId());
        p4.setCategoryId(catPickles.getId());
        p4.setName(new Product.LocalizedText("Malnad Appe Midi Tender Mango Pickle", "ಮಲೆನಾಡಿನ ಅಪ್ಪೆಮಿಡಿ ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ"));
        p4.setDescription(new Product.LocalizedText(
                "The king of Indian pickles. Tiny wild Appe Midi baby mangoes marinated whole in cold-pressed mustard oil, sea salt, and hand-ground Byadgi chilli powder. Aged naturally in clay jars.",
                "ಮಲೆನಾಡಿನ ಅಪರೂಪದ ಅಪ್ಪೆಮಿಡಿ ಉಪ್ಪಿನಕಾಯಿ. ಮಣ್ಣಿನ ಭರಣಿಯಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ಪಕ್ವಗೊಳಿಸಲಾದ ಅದ್ಭುತ ರುಚಿ."
        ));
        p4.setPrice(340.0);
        p4.setMrp(400.0);
        p4.setUnit("400g");
        p4.setQuantityAvailable(25);
        p4.setTags(Arrays.asList("pickle", "appe-midi", "mango", "traditional", "malnad"));
        p4.setImages(Collections.singletonList("https://images.unsplash.com/photo-1589135233689-d64b09c5b292?w=800"));
        p4.setThumbnailUrl("https://images.unsplash.com/photo-1589135233689-d64b09c5b292?w=400");
        p4.setOrganic(true);
        p4.setActive(true);
        p4.setApproved(true);
        p4.setAverageRating(4.9);
        p4.setReviewCount(46);
        productRepository.save(p4);

        Product p5 = new Product();
        p5.setSellerId(seller1.getId());
        p5.setCategoryId(catSpices.getId());
        p5.setName(new Product.LocalizedText("Coorg Estate Whole Black Pepper (Malabar Grade)", "ಕೊಡಗಿನ ನಾಟಿ ಕಾಳುಮೆಣಸು"));
        p5.setDescription(new Product.LocalizedText(
                "Sun-dried, high-piperine Malabar black peppercorns harvested from shade-grown coffee estates in Coorg. Intense aroma and bold heat.",
                "ಕೊಡಗಿನ ತೋಟಗಳಲ್ಲಿ ಬೆಳೆದ ಉತ್ತಮ ಗುಣಮಟ್ಟದ ನಾಟಿ ಕಾಳುಮೆಣಸು."
        ));
        p5.setPrice(240.0);
        p5.setMrp(290.0);
        p5.setUnit("200g");
        p5.setQuantityAvailable(50);
        p5.setTags(Arrays.asList("spices", "pepper", "black-pepper", "coorg"));
        p5.setImages(Collections.singletonList("https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800"));
        p5.setThumbnailUrl("https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400");
        p5.setOrganic(true);
        p5.setActive(true);
        p5.setApproved(true);
        p5.setAverageRating(4.9);
        p5.setReviewCount(31);
        productRepository.save(p5);

        // 6. Sample Order
        Order sampleOrder = new Order();
        sampleOrder.setOrderNumber("ORD-849201");
        sampleOrder.setBuyerId(buyer1.getId());
        sampleOrder.setSellerId(seller2.getId());
        sampleOrder.getItems().add(new Order.OrderItem(p1.getId(), p1.getName().getEn(), 180.0, 2, "250g", p1.getThumbnailUrl()));
        sampleOrder.setSubtotal(360.0);
        sampleOrder.setShippingFee(40.0);
        sampleOrder.setTotal(400.0);
        sampleOrder.setStatus("SHIPPED");
        sampleOrder.setOrderStatus("SHIPPED");
        sampleOrder.setPaymentStatus("PAID");
        sampleOrder.setShipmentStatus("SHIPPED");
        sampleOrder.setCarrierName("India Post Speed Post");
        sampleOrder.setConsignmentNumber("EK982341902IN");
        sampleOrder.setTrackingUrl("https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx");
        sampleOrder.setPaymentReferenceUtr("UPI429012384729");
        sampleOrder.setShippingAddress(new Order.ShippingAddress());
        sampleOrder.getShippingAddress().setName("Arjun Sharma");
        sampleOrder.getShippingAddress().setPhone("9000000003");
        sampleOrder.getShippingAddress().setLine1("#14, 2nd Cross, Indiranagar");
        sampleOrder.getShippingAddress().setCity("Bengaluru");
        sampleOrder.getShippingAddress().setState("Karnataka");
        sampleOrder.getShippingAddress().setPincode("560038");
        sampleOrder.getStatusHistory().add(new Order.StatusHistoryItem("ORDER_REQUESTED", "Order placed"));
        sampleOrder.getStatusHistory().add(new Order.StatusHistoryItem("PAID", "Payment verified"));
        sampleOrder.getStatusHistory().add(new Order.StatusHistoryItem("SHIPPED", "Dispatched via Speed Post"));
        orderRepository.save(sampleOrder);

        log.info("Database seeding complete. {} categories, {} products created.",
                categoryRepository.count(), productRepository.count());
    }

    private void seedSeasonalCampaignsIfEmpty() {
        try {
            if (seasonalCampaignRepository.count() == 0) {
                log.info("Seeding authentic seasonal & festival pre-booking campaigns...");
                User seller1 = userRepository.findByPhone("9000000001").orElse(null);
                User seller2 = userRepository.findByPhone("9000000002").orElse(null);

                SeasonalCampaign c1 = new SeasonalCampaign();
                c1.setTitle("Western Ghats Raw Multifloral Wild Forest Honey (Harvest 2026)");
                c1.setDescription("Unheated, unfiltered wild honey gathered by traditional tribal collectors in the high canopies of Kodagu and Western Ghats. Pre-booking guarantees small-batch glass jar allocation before open market dispatch.");
                c1.setBannerImageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800");
                c1.setProductName("Pure Raw Forest Honey");
                c1.setUnit("500g Jar");
                c1.setPrice(420.0);
                c1.setMaxBookingCapacity(100);
                c1.setBookedQuantity(24);
                c1.setMaxQtyPerBuyer(4);
                c1.setExpectedDeliveryWindow("Dispatches Nov 01 – Nov 08, 2026 (Fresh Harvest Batch)");
                c1.setStartDate(Instant.now().minus(5, java.time.temporal.ChronoUnit.DAYS));
                c1.setBookingDeadline(Instant.now().plus(25, java.time.temporal.ChronoUnit.DAYS));
                c1.setExpectedHarvestDate(Instant.now().plus(28, java.time.temporal.ChronoUnit.DAYS));
                c1.setStatus("ACTIVE");
                c1.setActive(true);
                c1.setSellerId(seller1 != null ? seller1.getId() : "seller-001");
                c1.setSellerName(seller1 != null ? seller1.getName() : "Ramesh Kumar");
                c1.setSellerShopName("Kodagu Forest Honey & Spices");
                seasonalCampaignRepository.save(c1);

                SeasonalCampaign c2 = new SeasonalCampaign();
                c2.setTitle("Diwali Special: Pure Cow Ghee Holige & Malnad Crisps");
                c2.setDescription("Authentic Karnataka festive gift hampers containing traditional chana dal holige prepared with A2 cow ghee and jackfruit crisps fried in pure wood-pressed coconut oil.");
                c2.setBannerImageUrl("https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800");
                c2.setProductName("Heritage Festival Delicacy Box");
                c2.setUnit("1 kg Box");
                c2.setPrice(650.0);
                c2.setMaxBookingCapacity(60);
                c2.setBookedQuantity(16);
                c2.setMaxQtyPerBuyer(2);
                c2.setExpectedDeliveryWindow("Dispatches Oct 28 – Nov 02, 2026 (Fresh Diwali Batch)");
                c2.setStartDate(Instant.now().minus(2, java.time.temporal.ChronoUnit.DAYS));
                c2.setBookingDeadline(Instant.now().plus(20, java.time.temporal.ChronoUnit.DAYS));
                c2.setExpectedHarvestDate(Instant.now().plus(24, java.time.temporal.ChronoUnit.DAYS));
                c2.setStatus("ACTIVE");
                c2.setActive(true);
                c2.setSellerId(seller2 != null ? seller2.getId() : "seller-002");
                c2.setSellerName(seller2 != null ? seller2.getName() : "Lakshmi Devi");
                c2.setSellerShopName("Lakshmi Amma's Malnad Kitchen");
                seasonalCampaignRepository.save(c2);

                log.info("Seeded 2 seasonal campaigns.");
            }
        } catch (Exception e) {
            log.warn("Notice seeding seasonal campaigns: {}", e.getMessage());
        }
    }

    private void seedCustomRequestsIfEmpty() {
        try {
            if (customRequestRepository.count() == 0) {
                log.info("Seeding sample reverse marketplace custom request...");
                User buyer = userRepository.findByPhone("9000000003").orElse(null);
                User seller = userRepository.findByPhone("9000000001").orElse(null);

                CustomRequest req = new CustomRequest();
                req.setBuyerId(buyer != null ? buyer.getId() : "buyer-001");
                req.setBuyerName(buyer != null ? buyer.getName() : "Arjun Sharma");
                req.setBuyerPhone(buyer != null ? buyer.getPhone() : "9000000003");
                req.setTitle("5 kg Pure Homemade Organic Sugarcane Jaggery (Naati Bella)");
                req.setCategoryName("Homemade Pantry");
                req.setQuantity(5.0);
                req.setUnit("kg");
                req.setBudget(450.0);
                req.setDeliveryLocation("Indiranagar, Bengaluru, Karnataka");
                req.setDescription("Need 100% pure chemical-free, unbleached jaggery prepared from traditional sugarcane juice without artificial sodium hydrosulphite. Fresh small-batch harvest preferred.");
                req.setExpiresAt(Instant.now().plus(10, java.time.temporal.ChronoUnit.DAYS));
                req.setStatus("OFFERS_RECEIVED");

                CustomRequest.Offer offer1 = new CustomRequest.Offer();
                offer1.setId("off-demo-001");
                offer1.setSellerId(seller != null ? seller.getId() : "seller-001");
                offer1.setSellerName("Ramesh Kumar");
                offer1.setSellerShopName("Kodagu Forest Honey & Spices");
                offer1.setSellerRating(4.9);
                offer1.setPrice(425.0);
                offer1.setQuantity(5.0);
                offer1.setUnit("kg");
                offer1.setDeliveryEstimateDays(3);
                offer1.setMessage("We prepare unbleached jaggery blocks directly on our organic farm in Kodagu. Can dispatch within 48 hours via Speed Post.");
                offer1.setStatus("PENDING");
                offer1.setCreatedAt(Instant.now().minus(2, java.time.temporal.ChronoUnit.HOURS));

                req.getOffers().add(offer1);
                customRequestRepository.save(req);
                log.info("Seeded sample reverse marketplace request with seller offer.");
            }
        } catch (Exception e) {
            log.warn("Notice seeding custom requests: {}", e.getMessage());
        }
    }
}
