package com.moola.backend.dto;

import com.moola.backend.model.Order;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderDto {

    public static class DirectOrderRequest {
        @NotBlank(message = "Product ID is required")
        private String productId;

        private int qty = 1;

        @NotNull(message = "Shipping address is required")
        private Order.ShippingAddress shippingAddress;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public int getQty() { return qty; }
        public void setQty(int qty) { this.qty = qty; }

        public Order.ShippingAddress getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(Order.ShippingAddress shippingAddress) { this.shippingAddress = shippingAddress; }
    }

    public static class CartOrderRequest {
        @NotEmpty(message = "Order must contain at least one item")
        private List<Order.OrderItem> items;

        @NotBlank(message = "Seller ID is required")
        private String sellerId;

        @NotNull(message = "Shipping address is required")
        private Order.ShippingAddress shippingAddress;

        public List<Order.OrderItem> getItems() { return items; }
        public void setItems(List<Order.OrderItem> items) { this.items = items; }

        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }

        public Order.ShippingAddress getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(Order.ShippingAddress shippingAddress) { this.shippingAddress = shippingAddress; }
    }

    public static class VerifyPaymentRequest {
        @NotBlank(message = "Payment reference UTR is required")
        private String utr;

        public String getUtr() { return utr; }
        public void setUtr(String utr) { this.utr = utr; }
    }

    public static class ShipmentRequest {
        @NotBlank(message = "Carrier name is required")
        private String carrierName; // India Post, DTDC, Blue Dart, etc.

        @NotBlank(message = "Consignment/AWB number is required")
        private String consignmentNumber;

        private String trackingUrl;
        private String dispatchNotes;

        public String getCarrierName() { return carrierName; }
        public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

        public String getConsignmentNumber() { return consignmentNumber; }
        public void setConsignmentNumber(String consignmentNumber) { this.consignmentNumber = consignmentNumber; }

        public String getTrackingUrl() { return trackingUrl; }
        public void setTrackingUrl(String trackingUrl) { this.trackingUrl = trackingUrl; }

        public String getDispatchNotes() { return dispatchNotes; }
        public void setDispatchNotes(String dispatchNotes) { this.dispatchNotes = dispatchNotes; }
    }

    public static class OrderStatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;

        private String note;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }
}
