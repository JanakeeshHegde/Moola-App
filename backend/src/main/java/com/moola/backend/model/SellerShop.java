package com.moola.backend.model;

import java.util.List;

public class SellerShop {
    private PublicSellerProfile profile;
    private List<Product> products;

    public SellerShop() {}
    public SellerShop(PublicSellerProfile profile, List<Product> products) {
        this.profile = profile;
        this.products = products;
    }

    public PublicSellerProfile getProfile() { return profile; }
    public void setProfile(PublicSellerProfile profile) { this.profile = profile; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}
