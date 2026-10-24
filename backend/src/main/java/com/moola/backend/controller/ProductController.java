package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.dto.ProductDto;
import com.moola.backend.model.Product;
import com.moola.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean isOrganic,
            @RequestParam(defaultValue = "newest") String sort) {
        List<Product> products = productService.listProducts(q, category, minPrice, maxPrice, isOrganic, sort);

        Map<String, Object> data = new HashMap<>();
        data.put("data", products);
        data.put("products", products);
        data.put("total", products.size());

        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProducts(Authentication authentication) {
        String sellerId = (String) authentication.getPrincipal();
        List<Product> products = productService.getSellerProducts(sellerId);
        Map<String, Object> data = new HashMap<>();
        data.put("data", products);
        data.put("products", products);
        data.put("total", products.size());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto.ProductDetailResponse>> getProductById(@PathVariable String id) {
        ProductDto.ProductDetailResponse resp = productService.getProductDetail(id);
        return ResponseEntity.ok(ApiResponse.ok(resp));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProduct(Authentication authentication,
                                                              @Valid @RequestBody ProductDto.CreateProductRequest req) {
        String sellerId = (String) authentication.getPrincipal();
        Product product = productService.createProduct(sellerId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(product, "Product listed successfully"));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(Authentication authentication,
                                                              @PathVariable String id,
                                                              @RequestBody ProductDto.CreateProductRequest req) {
        String userId = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Product product = productService.updateProduct(id, userId, isAdmin, req);
        return ResponseEntity.ok(ApiResponse.ok(product, "Product updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(Authentication authentication,
                                                           @PathVariable String id) {
        String userId = (String) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        productService.deleteProduct(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(null, "Product removed"));
    }
}
