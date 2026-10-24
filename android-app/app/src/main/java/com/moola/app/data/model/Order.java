package com.moola.app.data.model;

import java.io.Serializable;
import java.util.List;

public class Order implements Serializable {
    private String id;
    private String orderNumber;
    private String buyerId;
    private String sellerId;
    private List<OrderItem> items;
    private String status;
    private String orderStatus;
    private String paymentStatus;
    private String shipmentStatus;
    private ShippingAddress shippingAddress;
    private double subtotal;
    private double shippingFee;
    private double total;

    private String paymentReferenceUtr;
    private String carrierName;
    private String consignmentNumber;
    private String trackingUrl;
    private String dispatchNotes;
    private int currentStep = 1;
    private Integer rating;
    private String reviewNote;
    private String deliveredAt;
    private String cancellationReason;
    private List<StatusHistoryItem> statusHistory;

    private String buyerName;
    private String buyerPhone;
    private String sellerName;
    private String sellerShopName;
    private String sellerWhatsApp;
    private String sellerUpiId;

    public static class StatusHistoryItem implements Serializable {
        private String status;
        private String updatedAt;
        private String note;

        public StatusHistoryItem() {}
        public String getStatus() { return status; }
        public String getUpdatedAt() { return updatedAt; }
        public String getNote() { return note; }
    }

    public static class OrderItem implements Serializable {
        private String productId;
        private String name;
        private double price;
        private int qty;
        private String unit;
        private String imageUrl;

        public String getProductId() { return productId; }
        public String getName() { return name; }
        public double getPrice() { return price; }
        public int getQty() { return qty; }
        public String getUnit() { return unit; }
        public String getImageUrl() { return imageUrl; }
    }

    public static class ShippingAddress implements Serializable {
        private String name;
        private String phone;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pincode;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getLine1() { return line1; }
        public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; }
        public void setLine2(String line2) { this.line2 = line2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public String getFormattedAddress() {
            return line1 + (line2 != null && !line2.isBlank() ? ", " + line2 : "") + ", " + city + ", " + state + " - " + pincode;
        }
    }

    public String getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public String getBuyerId() { return buyerId; }
    public String getSellerId() { return sellerId; }
    public List<OrderItem> getItems() { return items; }
    public String getStatus() { return status; }
    public String getOrderStatus() { return orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getShipmentStatus() { return shipmentStatus; }
    public ShippingAddress getShippingAddress() { return shippingAddress; }
    public double getSubtotal() { return subtotal; }
    public double getShippingFee() { return shippingFee; }
    public double getTotal() { return total; }
    public String getPaymentReferenceUtr() { return paymentReferenceUtr; }
    public String getPaymentUtr() { return paymentReferenceUtr; }
    public String getCarrierName() { return carrierName; }
    public String getConsignmentNumber() { return consignmentNumber; }
    public String getTrackingUrl() { return trackingUrl; }
    public String getConsignmentUrl() { return trackingUrl; }
    public String getDispatchNotes() { return dispatchNotes; }
    public String getCancellationReason() { return cancellationReason; }

    public String getBuyerName() { return buyerName; }
    public String getBuyerPhone() { return buyerPhone; }
    public String getSellerName() { return sellerName; }
    public String getSellerShopName() { return sellerShopName; }
    public String getSellerWhatsApp() { return sellerWhatsApp; }
    public String getSellerUpiId() { return sellerUpiId; }
    public String getDeliveryAddress() { return shippingAddress != null ? shippingAddress.getFormattedAddress() : null; }

    public int getCurrentStep() { return currentStep; }
    public void setCurrentStep(int currentStep) { this.currentStep = currentStep; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public String getDeliveredAt() { return deliveredAt; }
    public List<StatusHistoryItem> getStatusHistory() { return statusHistory; }
}
