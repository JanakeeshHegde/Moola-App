package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Category;
import com.moola.backend.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listCategories() {
        List<Category> categories;
        try {
            categories = categoryRepository.findByIsActiveOrderBySortOrderAsc(true);
        } catch (Exception e) {
            categories = java.util.Collections.emptyList();
        }
        if (categories == null || categories.isEmpty()) {
            categories = List.of(
                    new Category("cat-honey", "Wild Forest Honey", "ಕಾಡು ಜೇನುತುಪ್ಪ", "🍯", 1),
                    new Category("cat-chips", "Chips & Snacks", "ಚಿಪ್ಸ್ ಮತ್ತು ತಿಂಡಿಗಳು", "🍌", 2),
                    new Category("cat-pickles", "Heritage Pickles", "ಸಾಂಪ್ರದಾಯಿಕ ಉಪ್ಪಿನಕಾಯಿ", "🏺", 3),
                    new Category("cat-spices", "Artisanal Spices", "ಮಸಾಲೆ ಪದಾರ್ಥಗಳು", "🌶️", 4),
                    new Category("cat-sweets", "Traditional Sweets", "ಮನೆ ಸಿಹಿತಿಂಡಿಗಳು", "🍬", 5)
            );
        }
        Map<String, Object> data = new HashMap<>();
        data.put("categories", categories);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
