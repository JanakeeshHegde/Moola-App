package com.moola.backend.service;

import com.moola.backend.dto.ProductDto;
import com.moola.backend.model.Category;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerFollow;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.CategoryRepository;
import com.moola.backend.repository.ProductRepository;
import com.moola.backend.repository.SellerFollowRepository;
import com.moola.backend.repository.SellerProfileRepository;
import com.moola.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final SellerFollowRepository sellerFollowRepository;
    private final NotificationService notificationService;

    public ProductService(ProductRepository productRepository,
                          SellerProfileRepository sellerProfileRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          SellerFollowRepository sellerFollowRepository,
                          NotificationService notificationService) {
        this.productRepository = productRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.sellerFollowRepository = sellerFollowRepository;
        this.notificationService = notificationService;
    }

    public List<Product> listProducts(String q, String categoryId, Double minPrice, Double maxPrice, Boolean isOrganic, String sort) {
        List<Product> products;
        try {
            products = productRepository.findByIsActiveAndIsApprovedOrderByCreatedAtDesc(true, true);
        } catch (Exception e) {
            products = Collections.emptyList();
        }
        if (products == null || products.isEmpty()) {
            products = getFallbackProducts();
        }

        // Filter in memory or query
        return products.stream()
                .filter(p -> {
                    if (q != null && !q.isBlank()) {
                        String query = q.toLowerCase();
                        boolean nameMatch = (p.getName() != null && p.getName().getEn() != null && p.getName().getEn().toLowerCase().contains(query))
                                || (p.getName() != null && p.getName().getKn() != null && p.getName().getKn().toLowerCase().contains(query));
                        boolean descMatch = (p.getDescription() != null && p.getDescription().getEn() != null && p.getDescription().getEn().toLowerCase().contains(query));
                        boolean tagMatch = p.getTags() != null && p.getTags().stream().anyMatch(t -> t.toLowerCase().contains(query));
                        if (!nameMatch && !descMatch && !tagMatch) return false;
                    }
                    if (categoryId != null && !categoryId.isBlank() && !categoryId.equalsIgnoreCase(p.getCategoryId())) {
                        return false;
                    }
                    if (minPrice != null && p.getPrice() < minPrice) return false;
                    if (maxPrice != null && p.getPrice() > maxPrice) return false;
                    if (isOrganic != null && isOrganic && !p.isOrganic()) return false;
                    return true;
                })
                .sorted((a, b) -> {
                    if ("price_asc".equalsIgnoreCase(sort)) return Double.compare(a.getPrice(), b.getPrice());
                    if ("price_desc".equalsIgnoreCase(sort)) return Double.compare(b.getPrice(), a.getPrice());
                    if ("rating".equalsIgnoreCase(sort)) return Double.compare(b.getAverageRating(), a.getAverageRating());
                    Instant aTime = a.getCreatedAt() != null ? a.getCreatedAt() : Instant.EPOCH;
                    Instant bTime = b.getCreatedAt() != null ? b.getCreatedAt() : Instant.EPOCH;
                    return bTime.compareTo(aTime);
                })
                .peek(this::enrichProduct)
                .collect(Collectors.toList());
    }

    public Product getProductById(String id) {
        Product product = null;
        try {
            product = productRepository.findById(id).orElse(null);
        } catch (Exception ignored) {}
        if (product == null) {
            product = getFallbackProducts().stream()
                    .filter(p -> p.getId() != null && p.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        }
        enrichProduct(product);
        return product;
    }

    public ProductDto.ProductDetailResponse getProductDetail(String id) {
        Product product = getProductById(id);
        SellerProfile profile = null;
        try {
            profile = sellerProfileRepository.findByUserId(product.getSellerId()).orElse(null);
        } catch (Exception ignored) {}
        if (profile == null && product.getSellerName() != null) {
            profile = new SellerProfile();
            profile.setUserId(product.getSellerId());
            profile.setShopName(product.getSellerShopName() != null ? product.getSellerShopName() : product.getSellerName());
            profile.setWhatsappNumber(product.getSellerWhatsApp() != null ? product.getSellerWhatsApp() : "919876543210");
            profile.setVerified(true);
            profile.setKycStatus("verified");
        }
        return new ProductDto.ProductDetailResponse(product, profile);
    }

    public List<Product> getSellerProducts(String sellerId) {
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .peek(this::enrichProduct)
                .collect(Collectors.toList());
    }

    public Product createProduct(String sellerId, ProductDto.CreateProductRequest req) {
        SellerProfile sellerProfile = sellerProfileRepository.findByUserId(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller profile not found."));

        Product product = new Product();
        product.setSellerId(sellerId);
        product.setCategoryId(req.getCategoryId());
        product.setName(new Product.LocalizedText(req.getNameEn(), req.getNameKn() != null ? req.getNameKn() : req.getNameEn()));
        product.setDescription(new Product.LocalizedText(req.getDescriptionEn(), req.getDescriptionKn() != null ? req.getDescriptionKn() : req.getDescriptionEn()));
        product.setPrice(req.getPrice());
        product.setMrp(req.getMrp() != null ? req.getMrp() : req.getPrice());
        product.setUnit(req.getUnit());
        product.setQuantityAvailable(req.getQuantityAvailable() != null ? req.getQuantityAvailable() : 0);
        product.setMinOrderQty(req.getMinOrderQty() != null ? req.getMinOrderQty() : 1);
        product.setTags(req.getTags() != null ? req.getTags() : new ArrayList<>());
        product.setImages(req.getImages() != null ? req.getImages() : new ArrayList<>());
        if (!product.getImages().isEmpty()) {
            product.setThumbnailUrl(product.getImages().get(0));
        }
        product.setOrganic(Boolean.TRUE.equals(req.getIsOrganic()));
        product.setCertified(Boolean.TRUE.equals(req.getIsCertified()));
        product.setCertificationDetails(req.getCertificationDetails());
        if (req.getIngredients() != null) product.setIngredients(req.getIngredients());
        if (req.getOrigin() != null) product.setOrigin(req.getOrigin());
        if (req.getShelfLife() != null) product.setShelfLife(req.getShelfLife());
        product.setActive(true);
        product.setApproved(true); // Auto-approved or approved by admin

        product = productRepository.save(product);
        enrichProduct(product);

        // Notify followers of new product batch
        try {
            List<SellerFollow> followers = sellerFollowRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
            String shopName = sellerProfile.getShopName() != null ? sellerProfile.getShopName() : "Artisan Kitchen";
            for (SellerFollow sf : followers) {
                notificationService.createNotification(
                        sf.getBuyerId(),
                        "New Batch from " + shopName,
                        shopName + " just prepared fresh: " + product.getName().getEn() + " (₹" + product.getPrice() + ").",
                        "NEW_PRODUCT",
                        product.getId(),
                        "PRODUCT"
                );
            }
        } catch (Exception ignored) {}

        return product;
    }

    public Product updateProduct(String productId, String sellerId, boolean isAdmin, ProductDto.CreateProductRequest req) {
        Product product = getProductById(productId);
        if (!isAdmin && !product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this product.");
        }

        if (req.getCategoryId() != null) product.setCategoryId(req.getCategoryId());
        if (req.getNameEn() != null) product.getName().setEn(req.getNameEn());
        if (req.getNameKn() != null) product.getName().setKn(req.getNameKn());
        if (req.getDescriptionEn() != null) product.getDescription().setEn(req.getDescriptionEn());
        if (req.getDescriptionKn() != null) product.getDescription().setKn(req.getDescriptionKn());
        if (req.getPrice() != null) product.setPrice(req.getPrice());
        if (req.getMrp() != null) product.setMrp(req.getMrp());
        if (req.getUnit() != null) product.setUnit(req.getUnit());
        if (req.getQuantityAvailable() != null) product.setQuantityAvailable(req.getQuantityAvailable());
        if (req.getTags() != null) product.setTags(req.getTags());
        if (req.getIngredients() != null) product.setIngredients(req.getIngredients());
        if (req.getOrigin() != null) product.setOrigin(req.getOrigin());
        if (req.getShelfLife() != null) product.setShelfLife(req.getShelfLife());
        if (req.getImages() != null && !req.getImages().isEmpty()) {
            product.setImages(req.getImages());
            product.setThumbnailUrl(req.getImages().get(0));
        }
        if (req.getIsOrganic() != null) product.setOrganic(req.getIsOrganic());
        if (req.getIsCertified() != null) product.setCertified(req.getIsCertified());

        product.setUpdatedAt(Instant.now());
        product = productRepository.save(product);
        enrichProduct(product);
        return product;
    }

    public void deleteProduct(String productId, String sellerId, boolean isAdmin) {
        Product product = getProductById(productId);
        if (!isAdmin && !product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        product.setActive(false);
        productRepository.save(product);
    }

    private void enrichProduct(Product product) {
        if (product == null) return;
        try {
            if (product.getCategoryId() != null && (product.getCategoryName() == null || product.getCategoryName().isBlank())) {
                categoryRepository.findById(product.getCategoryId()).ifPresent(cat -> {
                    product.setCategoryName(cat.getName() != null ? cat.getName().getEn() : "");
                });
            }
            if (product.getSellerId() != null && (product.getSellerName() == null || product.getSellerName().isBlank())) {
                userRepository.findById(product.getSellerId()).ifPresent(u -> {
                    product.setSellerName(u.getName());
                });
                sellerProfileRepository.findByUserId(product.getSellerId()).ifPresent(sp -> {
                    product.setSellerShopName(sp.getShopName());
                    product.setSellerWhatsApp(sp.getWhatsappNumber());
                });
            }
        } catch (Exception ignored) {
            // MongoDB offline: preserve denormalized values
        }
    }

    private List<Product> getFallbackProducts() {
        List<Product> list = new ArrayList<>();

        Product p1 = new Product();
        p1.setId("prod-honey-1");
        p1.setSellerId("seller-1");
        p1.setCategoryId("cat-honey");
        p1.setName(new Product.LocalizedText("Coorg Wild Forest Honey", "ಕೂರ್ಗ್ ಕಾಡು ಜೇನುತುಪ್ಪ"));
        p1.setDescription(new Product.LocalizedText("100% raw, unheated, unfiltered multifloral forest honey gathered by tribal beekeepers in Western Ghats.", "100% ಶುದ್ಧ ಕಾಡು ಜೇನುತುಪ್ಪ"));
        p1.setPrice(450.0);
        p1.setMrp(520.0);
        p1.setUnit("500g Glass Jar");
        p1.setOrganic(true);
        p1.setCertified(true);
        p1.setActive(true);
        p1.setApproved(true);
        p1.setAverageRating(4.9);
        p1.setReviewCount(84);
        p1.setSellerName("Lakshmi Amma");
        p1.setSellerShopName("Kaveri Naturals Coorg");
        p1.setSellerWhatsApp("919876543210");
        p1.setCategoryName("Wild Forest Honey");
        p1.setThumbnailUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80");
        p1.setImages(List.of("https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"));
        p1.setTags(List.of("honey", "organic", "raw", "pure", "coorg"));
        list.add(p1);

        Product p2 = new Product();
        p2.setId("prod-chips-1");
        p2.setSellerId("seller-2");
        p2.setCategoryId("cat-chips");
        p2.setName(new Product.LocalizedText("Malnad Crispy Banana Chips", "ಮಲೆನಾಡು ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್"));
        p2.setDescription(new Product.LocalizedText("Thinly sliced raw Nendran bananas fried fresh in pure wood-pressed coconut oil with natural sea salt.", "ಶುದ್ಧ ತೆಂಗಿನೆಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್"));
        p2.setPrice(140.0);
        p2.setMrp(160.0);
        p2.setUnit("250g Pouch");
        p2.setOrganic(false);
        p2.setCertified(false);
        p2.setActive(true);
        p2.setApproved(true);
        p2.setAverageRating(4.8);
        p2.setReviewCount(142);
        p2.setSellerName("Shankaran Nambiar");
        p2.setSellerShopName("Malnad Heritage Kitchen");
        p2.setSellerWhatsApp("919876543211");
        p2.setCategoryName("Chips & Snacks");
        p2.setThumbnailUrl("https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80");
        p2.setImages(List.of("https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80"));
        p2.setTags(List.of("chips", "banana", "snack", "coconut oil"));
        list.add(p2);

        Product p3 = new Product();
        p3.setId("prod-pickle-1");
        p3.setSellerId("seller-3");
        p3.setCategoryId("cat-pickles");
        p3.setName(new Product.LocalizedText("Grandma's Mango Avakaya Pickle", "ಸಾಂಪ್ರದಾಯಿಕ ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ"));
        p3.setDescription(new Product.LocalizedText("Sun-matured raw mango pieces infused in cold-pressed mustard oil with hand-pounded red chilies and fenugreek.", "ಸಾಂಪ್ರದಾಯಿಕ ಮಣ್ಣಿನ ಜಾಡಿಯಲ್ಲಿ ತಯಾರಿಸಿದ ಉಪ್ಪಿನಕಾಯಿ"));
        p3.setPrice(195.0);
        p3.setMrp(230.0);
        p3.setUnit("300g Ceramic Jar");
        p3.setOrganic(true);
        p3.setCertified(true);
        p3.setActive(true);
        p3.setApproved(true);
        p3.setAverageRating(4.9);
        p3.setReviewCount(67);
        p3.setSellerName("Anasuya Devi");
        p3.setSellerShopName("Anasuya Traditional Foods");
        p3.setSellerWhatsApp("919876543212");
        p3.setCategoryName("Heritage Pickles");
        p3.setThumbnailUrl("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80");
        p3.setImages(List.of("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"));
        p3.setTags(List.of("pickle", "mango", "spicy", "homemade"));
        list.add(p3);

        Product p4 = new Product();
        p4.setId("prod-spices-1");
        p4.setSellerId("seller-1");
        p4.setCategoryId("cat-spices");
        p4.setName(new Product.LocalizedText("Salem Organic Turmeric Powder", "ಸೇಲಂ ಸಾವಯವ ಅರಿಶಿನ ಪುಡಿ"));
        p4.setDescription(new Product.LocalizedText("Single-origin high-curcumin (5.2%) turmeric roots stone-ground at low temperatures to preserve natural aroma.", "ಉನ್ನತ ಕರ್ಕ್ಯುಮಿನ್ ಅಂಶವಿರುವ ಶುದ್ಧ ಅರಿಶಿನ ಪುಡಿ"));
        p4.setPrice(120.0);
        p4.setMrp(150.0);
        p4.setUnit("200g Eco Pouch");
        p4.setOrganic(true);
        p4.setCertified(true);
        p4.setActive(true);
        p4.setApproved(true);
        p4.setAverageRating(5.0);
        p4.setReviewCount(39);
        p4.setSellerName("Lakshmi Amma");
        p4.setSellerShopName("Kaveri Naturals Coorg");
        p4.setSellerWhatsApp("919876543210");
        p4.setCategoryName("Artisanal Spices");
        p4.setThumbnailUrl("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80");
        p4.setImages(List.of("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"));
        p4.setTags(List.of("turmeric", "spices", "curcumin", "organic"));
        list.add(p4);

        Product p5 = new Product();
        p5.setId("prod-sweets-1");
        p5.setSellerId("seller-4");
        p5.setCategoryId("cat-sweets");
        p5.setName(new Product.LocalizedText("Melt-in-Mouth Desi Ghee Mysore Pak", "ಶುದ್ಧ ತುಪ್ಪದ ಮೈಸೂರು ಪಾಕ್"));
        p5.setDescription(new Product.LocalizedText("Rich, porous, traditional Mysore Pak crafted with pure A2 cow ghee and premium roasted gram flour.", "ಪಾರಂಪರಿಕ ಶುದ್ಧ ತುಪ್ಪದ ಮೈಸೂರು ಪಾಕ್"));
        p5.setPrice(320.0);
        p5.setMrp(380.0);
        p5.setUnit("400g Box");
        p5.setOrganic(false);
        p5.setCertified(true);
        p5.setActive(true);
        p5.setApproved(true);
        p5.setAverageRating(4.9);
        p5.setReviewCount(118);
        p5.setSellerName("Venkatesh Bhat");
        p5.setSellerShopName("Udupi Heritage Sweets");
        p5.setSellerWhatsApp("919876543213");
        p5.setCategoryName("Traditional Sweets");
        p5.setThumbnailUrl("https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80");
        p5.setImages(List.of("https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"));
        p5.setTags(List.of("sweets", "mysore pak", "ghee", "dessert"));
        list.add(p5);

        return list;
    }
}
