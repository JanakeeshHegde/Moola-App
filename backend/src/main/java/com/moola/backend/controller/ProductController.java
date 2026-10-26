package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Product;
import com.moola.backend.model.User;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean isOrganic,
            @RequestParam(required = false) String sort) {

        List<Product> list = dataStore.getProducts().stream().filter(p -> {
            if (q != null && !q.isBlank()) {
                if (p.getTitle() == null || !p.getTitle().toLowerCase().contains(q.toLowerCase())) {
                    return false;
                }
            }
            if (category != null && !category.isBlank()) {
                if (!category.equalsIgnoreCase(p.getCategoryId())) {
                    return false;
                }
            }
            if (minPrice != null && p.getPrice() != null && p.getPrice() < minPrice) {
                return false;
            }
            if (maxPrice != null && p.getPrice() != null && p.getPrice() > maxPrice) {
                return false;
            }
            if (isOrganic != null && !isOrganic.equals(p.getIsOrganic())) {
                return false;
            }
            return true;
        }).collect(Collectors.toList());

        Map<String, Object> map = new HashMap<>();
        map.put("products", list);
        map.put("total", list.size());
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductDetail(@PathVariable String id) {
        Product product = dataStore.getProducts().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(dataStore.getProducts().isEmpty() ? null : dataStore.getProducts().get(0));

        Map<String, Object> map = new HashMap<>();
        map.put("product", product);
        map.put("related", dataStore.getProducts());
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProducts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = dataStore.resolveUserFromToken(authHeader);
        List<Product> list = dataStore.getProducts().stream()
                .filter(p -> user.getId().equals(p.getSellerId()))
                .collect(Collectors.toList());

        Map<String, Object> map = new HashMap<>();
        map.put("products", list);
        map.put("total", list.size());
        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        User user = dataStore.resolveUserFromToken(authHeader);

        String id = "prod_" + System.currentTimeMillis();
        String title = (String) body.getOrDefault("title", "New Product");
        Double price = body.get("price") != null ? Double.valueOf(body.get("price").toString()) : 0.0;
        String unit = (String) body.getOrDefault("unit", "kg");
        String categoryId = (String) body.getOrDefault("categoryId", "cat_1");
        String categoryName = (String) body.getOrDefault("categoryName", "General");
        String imageUrl = (String) body.getOrDefault("imageUrl", "");
        String description = (String) body.getOrDefault("description", "");
        Boolean isOrganic = body.get("isOrganic") != null ? Boolean.valueOf(body.get("isOrganic").toString()) : true;
        Integer stockQuantity = body.get("stockQuantity") != null ? Integer.valueOf(body.get("stockQuantity").toString()) : 100;

        Product newProd = new Product(id, title, price, unit, categoryId, categoryName, user.getId(), user.getName(), imageUrl, description, isOrganic, stockQuantity);
        dataStore.getProducts().add(newProd);

        return ResponseEntity.ok(ApiResponse.success(newProd, "Product created successfully"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Product product = dataStore.getProducts().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst().orElse(null);

        if (product != null) {
            if (body.containsKey("title")) product.setTitle((String) body.get("title"));
            if (body.containsKey("price")) product.setPrice(Double.valueOf(body.get("price").toString()));
            if (body.containsKey("description")) product.setDescription((String) body.get("description"));
            if (body.containsKey("stockQuantity")) product.setStockQuantity(Integer.valueOf(body.get("stockQuantity").toString()));
        }
        return ResponseEntity.ok(ApiResponse.success(product, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        dataStore.getProducts().removeIf(p -> p.getId().equals(id));
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
