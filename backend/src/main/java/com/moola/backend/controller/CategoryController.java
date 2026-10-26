package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import com.moola.backend.model.Category;
import com.moola.backend.service.DataStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private DataStoreService dataStore;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCategories() {
        Map<String, Object> map = new HashMap<>();
        map.put("categories", dataStore.getCategories());
        return ResponseEntity.ok(ApiResponse.success(map));
    }
}
