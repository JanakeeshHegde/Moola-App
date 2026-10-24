package com.moola.backend.controller;

import com.moola.backend.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/config/commerce")
public class CommerceConfigController {

    @Value("${moola.commerce.default-country:IN}")
    private String defaultCountry;

    @Value("${moola.commerce.supported-countries:IN,US,GB,AE,SG,CA,AU}")
    private String supportedCountries;

    @Value("${moola.commerce.default-currency:INR}")
    private String defaultCurrency;

    @Value("${moola.commerce.supported-currencies:INR,USD,EUR,GBP,AED}")
    private String supportedCurrencies;

    @Value("${moola.commerce.inr-to-usd-rate:0.012}")
    private double usdRate;

    @Value("${moola.commerce.inr-to-eur-rate:0.011}")
    private double eurRate;

    @Value("${moola.commerce.inr-to-gbp-rate:0.0095}")
    private double gbpRate;

    @Value("${moola.commerce.inr-to-aed-rate:0.044}")
    private double aedRate;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCommerceConfig() {
        Map<String, Object> data = new HashMap<>();

        data.put("defaultCountry", defaultCountry);
        data.put("supportedCountries", Arrays.asList(supportedCountries.split(",")));
        data.put("defaultCurrency", defaultCurrency);
        data.put("defaultCurrencySymbol", "₹");
        data.put("supportedCurrencies", Arrays.asList(supportedCurrencies.split(",")));

        Map<String, Object> currencyMeta = new HashMap<>();
        currencyMeta.put("INR", Map.of("symbol", "₹", "rate", 1.0, "name", "Indian Rupee", "settlementSupported", true));
        currencyMeta.put("USD", Map.of("symbol", "$", "rate", usdRate, "name", "US Dollar", "settlementSupported", true));
        currencyMeta.put("EUR", Map.of("symbol", "€", "rate", eurRate, "name", "Euro", "settlementSupported", false));
        currencyMeta.put("GBP", Map.of("symbol", "£", "rate", gbpRate, "name", "British Pound", "settlementSupported", false));
        currencyMeta.put("AED", Map.of("symbol", "AED", "rate", aedRate, "name", "UAE Dirham", "settlementSupported", false));
        data.put("currencies", currencyMeta);

        List<Map<String, Object>> carriers = List.of(
                Map.of("code", "INDIA_POST", "name", "India Post Speed Post", "domestic", true, "international", true, "trackingUrl", "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"),
                Map.of("code", "SHIPROCKET", "name", "Shiprocket", "domestic", true, "international", true, "trackingUrl", "https://www.shiprocket.in/shipment-tracking/"),
                Map.of("code", "DELHIVERY", "name", "Delhivery", "domestic", true, "international", false, "trackingUrl", "https://www.delhivery.com/track/package/"),
                Map.of("code", "DTDC", "name", "DTDC Courier", "domestic", true, "international", true, "trackingUrl", "https://www.dtdc.in/tracking.asp"),
                Map.of("code", "BLUE_DART", "name", "Blue Dart Express", "domestic", true, "international", true, "trackingUrl", "https://www.bluedart.com/tracking"),
                Map.of("code", "DHL", "name", "DHL Express Worldwide", "domestic", false, "international", true, "trackingUrl", "https://www.dhl.com/en/express/tracking.html")
        );
        data.put("supportedCarriers", carriers);

        data.put("paymentMethods", List.of(
                Map.of("id", "UPI", "name", "Direct UPI / QR Code", "currency", "INR", "status", "ACTIVE", "escrowSupported", false),
                Map.of("id", "BANK_TRANSFER", "name", "Direct NEFT / IMPS / SWIFT", "currency", "INR", "status", "ACTIVE", "escrowSupported", false),
                Map.of("id", "CARD_STRIPE", "name", "International Card (Stripe Gateway)", "currency", "USD", "status", "SANDBOX_READY", "escrowSupported", true)
        ));

        data.put("platformVersion", "2.4.0");
        data.put("serverStatus", "OPERATIONAL");

        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
