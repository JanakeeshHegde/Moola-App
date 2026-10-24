package com.moola.backend.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNumber;

    @Indexed
    private String buyerId;

    @Indexed
    private String sellerId;

    private List<OrderItem> items = new ArrayList<>();

    // Status: ORDER_REQUESTED, ORDER_CONFIRMED, PAYMENT_PENDING, PAYMENT_VERIFICATION_PENDING, PAID, PROCESSING, PACKED, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    private String status = "ORDER_REQUESTED";
    private String orderStatus = "ORDER_REQUESTED";
    private String paymentStatus = "PAYMENT_PENDING";
    private String shipmentStatus = "NOT_SHIPPED";

    private ShippingAddress shippingAddress;

    private double subtotal;
    private double shippingFee = 0;
    private double discount = 0;
    private double total;

    // Payment details
    private String paymentReferenceUtr;
    private Instant paymentReferenceSubmittedAt;

    // Consignment / Shipment details
    private String carrierName;
    private String consignmentNumber;
    private Instant dispatchDate;
    private String trackingUrl;
    private String dispatchNotes;
    private int currentStep = 1; // 1: Confirmed, 2: Packed, 3: Handed to Courier, 4: In Transit, 5: Delivered
    private Instant deliveredAt;
    private Integer rating;
    private String reviewNote;

    private String cancellationReason;
    private List<StatusHistoryItem> statusHistory = new ArrayList<>();

    // Transient or denormalized names
    private String buyerName;
    private String buyerPhone;
    private String sellerName;
    private String sellerShopName;
    private String sellerWhatsApp;
    private String sellerUpiId;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public static class OrderItem {
        private String productId;
        private String name;
        private double price;
        private int qty;
        private String unit;
        private String imageUrl;

        public OrderItem() {}
        public OrderItem(String productId, String name, double price, int qty, String unit, String imageUrl) {
            this.productId = productId;
            this.name = name;
            this.price = price;
            this.qty = qty;
            this.unit = unit;
            this.imageUrl = imageUrl;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public int getQty() { return qty; }
        public void setQty(int qty) { this.qty = qty; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class ShippingAddress {
        private String name;
        private String phone;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pincode;

        public ShippingAddress() {}

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
    }

    public static class StatusHistoryItem {
        private String status;
        private Instant updatedAt = Instant.now();
        private String note;

        public StatusHistoryItem() {}
        public StatusHistoryItem(String status, String note) {
            this.status = status;
            this.note = note;
            this.updatedAt = Instant.now();
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(String shipmentStatus) { this.shipmentStatus = shipmentStatus; }

    public ShippingAddress getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(ShippingAddress shippingAddress) { this.shippingAddress = shippingAddress; }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }

    public double getShippingFee() { return shippingFee; }
    public void setShippingFee(double shippingFee) { this.shippingFee = shippingFee; }

    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getPaymentReferenceUtr() { return paymentReferenceUtr; }
    public void setPaymentReferenceUtr(String paymentReferenceUtr) { this.paymentReferenceUtr = paymentReferenceUtr; }

    public Instant getPaymentReferenceSubmittedAt() { return paymentReferenceSubmittedAt; }
    public void setPaymentReferenceSubmittedAt(Instant paymentReferenceSubmittedAt) { this.paymentReferenceSubmittedAt = paymentReferenceSubmittedAt; }

    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

    public String getConsignmentNumber() { return consignmentNumber; }
    public void setConsignmentNumber(String consignmentNumber) { this.consignmentNumber = consignmentNumber; }

    public Instant getDispatchDate() { return dispatchDate; }
    public void setDispatchDate(Instant dispatchDate) { this.dispatchDate = dispatchDate; }

    public String getTrackingUrl() { return trackingUrl; }
    public void setTrackingUrl(String trackingUrl) { this.trackingUrl = trackingUrl; }

    public String getDispatchNotes() { return dispatchNotes; }
    public void setDispatchNotes(String dispatchNotes) { this.dispatchNotes = dispatchNotes; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public List<StatusHistoryItem> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistoryItem> statusHistory) { this.statusHistory = statusHistory; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerShopName() { return sellerShopName; }
    public void setSellerShopName(String sellerShopName) { this.sellerShopName = sellerShopName; }

    public String getSellerWhatsApp() { return sellerWhatsApp; }
    public void setSellerWhatsApp(String sellerWhatsApp) { this.sellerWhatsApp = sellerWhatsApp; }

    public String getSellerUpiId() { return sellerUpiId; }
    public void setSellerUpiId(String sellerUpiId) { this.sellerUpiId = sellerUpiId; }

    public int getCurrentStep() { return currentStep; }
    public void setCurrentStep(int currentStep) { this.currentStep = currentStep; }

    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
