package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "seller_follows")
@CompoundIndex(name = "buyer_seller_unique_idx", def = "{'buyerId': 1, 'sellerId': 1}", unique = true)
public class SellerFollow {

    @Id
    private String id;

    @Indexed
    private String buyerId;

    @Indexed
    private String sellerId;

    private String sellerShopName;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public SellerFollow() {}

    public SellerFollow(String buyerId, String sellerId, String sellerShopName) {
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.sellerShopName = sellerShopName;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerShopName() { return sellerShopName; }
    public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
