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
        List<Category> categories = categoryRepository.findByIsActiveOrderBySortOrderAsc(true);
        Map<String, Object> data = new HashMap<>();
        data.put("categories", categories);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
