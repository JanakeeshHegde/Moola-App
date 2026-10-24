package com.moola.app.util;

import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

/**
 * Locale-aware international currency formatting utility for MOOLA marketplace.
 * Formats base INR amounts with accurate currency symbols and regional formatting.
 */
public class CurrencyFormatter {

    private static final Locale INDIA_LOCALE = new Locale("en", "IN");
    private static String activeCurrencyCode = "INR";

    public static void setActiveCurrency(String code) {
        if (code != null && !code.trim().isEmpty()) {
            activeCurrencyCode = code.trim().toUpperCase();
        }
    }

    public static String getActiveCurrency() {
        return activeCurrencyCode;
    }

    public static String format(double amountInInr) {
        return format(amountInInr, activeCurrencyCode);
    }

    public static String format(double amount, String currencyCode) {
        if (currencyCode == null || "INR".equalsIgnoreCase(currencyCode)) {
            // Standard Indian Rupee format with ₹ symbol
            return "₹" + Math.round(amount);
        } else if ("USD".equalsIgnoreCase(currencyCode)) {
            double converted = amount * 0.012;
            return String.format(Locale.US, "$%.2f", converted);
        } else if ("EUR".equalsIgnoreCase(currencyCode)) {
            double converted = amount * 0.011;
            return String.format(Locale.GERMANY, "€%.2f", converted);
        } else if ("GBP".equalsIgnoreCase(currencyCode)) {
            double converted = amount * 0.0095;
            return String.format(Locale.UK, "£%.2f", converted);
        } else if ("AED".equalsIgnoreCase(currencyCode)) {
            double converted = amount * 0.044;
            return String.format(Locale.US, "AED %.2f", converted);
        }

        return currencyCode + " " + Math.round(amount);
    }

    public static String formatPrecise(double amount) {
        return "₹" + String.format(Locale.US, "%.2f", amount);
    }
}
