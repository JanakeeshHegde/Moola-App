package com.moola.backend.repository;

import com.moola.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    List<User> findByRole(String role);
    List<User> findByRoleOrderByCreatedAtDesc(String role);
    long countByRole(String role);
}
