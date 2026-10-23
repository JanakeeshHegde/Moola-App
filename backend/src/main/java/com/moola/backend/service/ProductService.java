package com.moola.backend.service;

import com.moola.backend.dto.ProductDto;
import com.moola.backend.model.Category;
import com.moola.backend.model.Product;
import com.moola.backend.model.SellerProfile;
import com.moola.backend.model.User;
import com.moola.backend.repository.CategoryRepository;
import com.moola.backend.repository.ProductRepository;
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

    public ProductService(ProductRepository productRepository,
                          SellerProfileRepository sellerProfileRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<Product> listProducts(String q, String categoryId, Double minPrice, Double maxPrice, Boolean isOrganic, String sort) {
        List<Product> products = productRepository.findByIsActiveAndIsApprovedOrderByCreatedAtDesc(true, true);

        // Filter in memory or query
        return products.stream()
                .filter(p -> {
                    if (q != null && !q.isBlank()) {
                        String query = q.toLowerCase();
                        boolean nameMatch = (p.getName().getEn() != null && p.getName().getEn().toLowerCase().contains(query))
                                || (p.getName().getKn() != null && p.getName().getKn().toLowerCase().contains(query));
                        boolean descMatch = (p.getDescription().getEn() != null && p.getDescription().getEn().toLowerCase().contains(query));
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
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .peek(this::enrichProduct)
                .collect(Collectors.toList());
    }

    public Product getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        enrichProduct(product);
        return product;
    }

    public ProductDto.ProductDetailResponse getProductDetail(String id) {
        Product product = getProductById(id);
        SellerProfile profile = sellerProfileRepository.findByUserId(product.getSellerId()).orElse(null);
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
        product.setActive(true);
        product.setApproved(true); // Auto-approved or approved by admin

        product = productRepository.save(product);
        enrichProduct(product);
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
        if (product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId()).ifPresent(cat -> {
                product.setCategoryName(cat.getName() != null ? cat.getName().getEn() : "");
            });
        }
        if (product.getSellerId() != null) {
            userRepository.findById(product.getSellerId()).ifPresent(u -> {
                product.setSellerName(u.getName());
            });
            sellerProfileRepository.findByUserId(product.getSellerId()).ifPresent(sp -> {
                product.setSellerShopName(sp.getShopName());
                product.setSellerWhatsApp(sp.getWhatsappNumber());
            });
        }
    }
}
