package com.moola.backend.repository;

import com.moola.backend.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByIsActiveOrderBySortOrderAsc(boolean isActive);
    List<Category> findAllByOrderBySortOrderAsc();
}
