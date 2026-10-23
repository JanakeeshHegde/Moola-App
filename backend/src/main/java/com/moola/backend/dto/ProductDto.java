package com.moola.backend.dto;

import com.moola.backend.model.Product;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class ProductDto {

    public static class CreateProductRequest {
        @NotBlank(message = "Category is required")
        private String categoryId;

        @NotBlank(message = "English name is required")
        private String nameEn;
        private String nameKn;

        @NotBlank(message = "English description is required")
        private String descriptionEn;
        private String descriptionKn;

        @NotNull(message = "Price is required")
        @Min(value = 1, message = "Price must be at least ₹1")
        private Double price;

        private Double mrp;

        @NotBlank(message = "Unit is required")
        private String unit;

        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantityAvailable = 0;

        private Integer minOrderQty = 1;
        private List<String> tags = new ArrayList<>();
        private List<String> images = new ArrayList<>();
        private Boolean isOrganic = false;
        private Boolean isCertified = false;
        private String certificationDetails;

        public String getCategoryId() { return categoryId; }
        public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

        public String getNameEn() { return nameEn; }
        public void setNameEn(String nameEn) { this.nameEn = nameEn; }

        public String getNameKn() { return nameKn; }
        public void setNameKn(String nameKn) { this.nameKn = nameKn; }

        public String getDescriptionEn() { return descriptionEn; }
        public void setDescriptionEn(String descriptionEn) { this.descriptionEn = descriptionEn; }

        public String getDescriptionKn() { return descriptionKn; }
        public void setDescriptionKn(String descriptionKn) { this.descriptionKn = descriptionKn; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Double getMrp() { return mrp; }
        public void setMrp(Double mrp) { this.mrp = mrp; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public Integer getQuantityAvailable() { return quantityAvailable; }
        public void setQuantityAvailable(Integer quantityAvailable) { this.quantityAvailable = quantityAvailable; }

        public Integer getMinOrderQty() { return minOrderQty; }
        public void setMinOrderQty(Integer minOrderQty) { this.minOrderQty = minOrderQty; }

        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }

        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }

        public Boolean getIsOrganic() { return isOrganic; }
        public void setIsOrganic(Boolean organic) { isOrganic = organic; }

        public Boolean getIsCertified() { return isCertified; }
        public void setIsCertified(Boolean certified) { isCertified = certified; }

        public String getCertificationDetails() { return certificationDetails; }
        public void setCertificationDetails(String certificationDetails) { this.certificationDetails = certificationDetails; }
    }

    public static class ProductDetailResponse {
        private Product product;
        private Object sellerProfile;

        public ProductDetailResponse() {}
        public ProductDetailResponse(Product product, Object sellerProfile) {
            this.product = product;
            this.sellerProfile = sellerProfile;
        }

        public Product getProduct() { return product; }
        public void setProduct(Product product) { this.product = product; }

        public Object getSellerProfile() { return sellerProfile; }
        public void setSellerProfile(Object sellerProfile) { this.sellerProfile = sellerProfile; }
    }
}
