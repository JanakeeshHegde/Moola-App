package com.moola.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class MoolaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoolaBackendApplication.class, args);
    }
}
