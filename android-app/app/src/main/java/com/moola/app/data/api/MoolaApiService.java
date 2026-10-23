package com.moola.app.data.api;

import com.moola.app.data.model.*;
import retrofit2.Call;
import retrofit2.http.*;

import java.util.List;
import java.util.Map;

public interface MoolaApiService {

    // Auth
    @POST("api/v1/auth/login")
    Call<ApiResponse<AuthModels.AuthData>> login(@Body AuthModels.LoginRequest request);

    @POST("api/v1/auth/register")
    Call<ApiResponse<AuthModels.AuthData>> register(@Body AuthModels.RegisterRequest request);

    @GET("api/v1/auth/me")
    Call<ApiResponse<User>> getMe();

    // Products
    @GET("api/v1/products")
    Call<ApiResponse<Map<String, Object>>> getProducts(
            @Query("q") String query,
            @Query("category") String categoryId,
            @Query("minPrice") Double minPrice,
            @Query("maxPrice") Double maxPrice,
            @Query("isOrganic") Boolean isOrganic,
            @Query("sort") String sort
    );

    @GET("api/v1/products/{id}")
    Call<ApiResponse<Map<String, Object>>> getProductDetail(@Path("id") String id);

    @GET("api/v1/products/my")
    Call<ApiResponse<Map<String, Object>>> getMyProducts();

    @POST("api/v1/products")
    Call<ApiResponse<Product>> createProduct(@Body Map<String, Object> productData);

    @PATCH("api/v1/products/{id}")
    Call<ApiResponse<Product>> updateProduct(@Path("id") String id, @Body Map<String, Object> productData);

    @DELETE("api/v1/products/{id}")
    Call<ApiResponse<Void>> deleteProduct(@Path("id") String id);

    // Categories
    @GET("api/v1/categories")
    Call<ApiResponse<Map<String, Object>>> getCategories();

    // Orders
    @POST("api/v1/orders/request")
    Call<ApiResponse<Order>> directOrderRequest(@Body Map<String, Object> requestData);

    @GET("api/v1/orders/my")
    Call<ApiResponse<List<Order>>> getBuyerOrders();

    @GET("api/v1/orders/seller")
    Call<ApiResponse<List<Order>>> getSellerOrders();

    @GET("api/v1/orders/{id}")
    Call<ApiResponse<Order>> getOrderById(@Path("id") String id);

    @POST("api/v1/orders/{id}/confirm")
    Call<ApiResponse<Order>> confirmOrder(@Path("id") String id);

    @POST("api/v1/orders/{id}/decline")
    Call<ApiResponse<Order>> declineOrder(@Path("id") String id, @Body Map<String, String> body);

    @POST("api/v1/orders/{id}/shipment")
    Call<ApiResponse<Order>> recordShipment(@Path("id") String id, @Body Map<String, Object> body);

    @PATCH("api/v1/orders/{id}/verify-payment")
    Call<ApiResponse<Order>> verifyPayment(@Path("id") String id);

    @POST("api/v1/orders/{id}/utr")
    Call<ApiResponse<Order>> submitPaymentUtr(@Path("id") String id, @Body Map<String, String> body);

    @POST("api/v1/orders/{id}/cancel")
    Call<ApiResponse<Order>> cancelOrder(@Path("id") String id, @Body Map<String, String> body);

    // WhatsApp Enquiries
    @POST("api/v1/enquiries")
    Call<ApiResponse<WhatsAppEnquiry>> createEnquiry(@Body Map<String, Object> enquiryData);

    @GET("api/v1/enquiries/seller")
    Call<ApiResponse<List<WhatsAppEnquiry>>> getSellerEnquiries();

    @GET("api/v1/enquiries/buyer")
    Call<ApiResponse<List<WhatsAppEnquiry>>> getBuyerEnquiries();

    // Seller Portal
    @GET("api/v1/seller/profile")
    Call<ApiResponse<SellerProfile>> getSellerProfile();

    @PATCH("api/v1/seller/profile")
    Call<ApiResponse<SellerProfile>> updateSellerProfile(@Body Map<String, Object> body);

    @POST("api/v1/seller/apply")
    Call<ApiResponse<SellerProfile>> applyForSeller(@Body Map<String, String> body);

    @GET("api/v1/seller/analytics")
    Call<ApiResponse<Map<String, Object>>> getSellerAnalytics();

    // Admin Portal
    @GET("api/v1/admin/analytics")
    Call<ApiResponse<Map<String, Object>>> getAdminAnalytics();

    @GET("api/v1/admin/buyers")
    Call<ApiResponse<List<User>>> getAdminBuyers();

    @PATCH("api/v1/admin/buyers/{id}/status")
    Call<ApiResponse<User>> updateBuyerStatus(@Path("id") String id, @Body Map<String, Boolean> body);

    @GET("api/v1/admin/sellers")
    Call<ApiResponse<List<SellerProfile>>> getAdminSellers();

    @PUT("api/v1/admin/sellers/{id}/kyc")
    Call<ApiResponse<SellerProfile>> reviewSellerKyc(@Path("id") String id, @Body Map<String, String> body);

    @PUT("api/v1/admin/products/{id}/moderate")
    Call<ApiResponse<Product>> moderateProduct(@Path("id") String id, @Body Map<String, Object> body);

    // Customer Complaints
    @POST("api/v1/complaints")
    Call<ApiResponse<Complaint>> submitComplaint(@Body Map<String, Object> body);

    @GET("api/v1/complaints/my")
    Call<ApiResponse<List<Complaint>>> getMyComplaints();

    @GET("api/v1/complaints/my/{ticketId}")
    Call<ApiResponse<Complaint>> getMyComplaint(@Path("ticketId") String ticketId);

    @GET("api/v1/complaints/admin")
    Call<ApiResponse<List<Complaint>>> adminListComplaints(@Query("status") String status);

    @PATCH("api/v1/complaints/admin/{ticketId}")
    Call<ApiResponse<Complaint>> adminUpdateComplaint(@Path("ticketId") String ticketId, @Body Map<String, Object> body);

    // Account Deletion
    @POST("api/v1/account-deletion/request")
    Call<ApiResponse<AccountDeletionRequest>> requestAccountDeletion(@Body Map<String, String> body);

    @GET("api/v1/account-deletion/my")
    Call<ApiResponse<AccountDeletionRequest>> getMyDeletionStatus();

    @GET("api/v1/account-deletion/admin")
    Call<ApiResponse<List<AccountDeletionRequest>>> adminListDeletionRequests();

    @PATCH("api/v1/account-deletion/admin/{requestId}/process")
    Call<ApiResponse<AccountDeletionRequest>> adminProcessDeletionRequest(
            @Path("requestId") String requestId, @Body Map<String, String> body);
}
