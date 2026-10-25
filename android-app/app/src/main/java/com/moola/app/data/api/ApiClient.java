package com.moola.app.data.api;

import android.content.Context;
import android.os.Build;
import com.moola.app.data.storage.SessionManager;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class ApiClient {

    public static final String DEFAULT_PHYSICAL_URL = "http://localhost:5000";
    public static final String DEFAULT_EMULATOR_URL = "http://localhost:5000";
    public static final String DEFAULT_BASE_URL = DEFAULT_PHYSICAL_URL;

    private static Retrofit retrofit = null;
    private static MoolaApiService apiService = null;

    public static boolean isEmulator() {
        return (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.HARDWARE.contains("goldfish")
                || Build.HARDWARE.contains("ranchu")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.PRODUCT.contains("sdk_google")
                || Build.PRODUCT.contains("google_sdk")
                || Build.PRODUCT.contains("sdk")
                || Build.PRODUCT.contains("sdk_x86")
                || Build.PRODUCT.contains("vbox86p")
                || Build.PRODUCT.contains("emulator")
                || Build.PRODUCT.contains("simulator");
    }

    public static String getBaseUrl(Context context) {
        if (context != null) {
            String savedUrl = SessionManager.getInstance(context).getServerUrl();
            if (savedUrl != null && !savedUrl.trim().isEmpty()) {
                String trimmed = savedUrl.trim();
                return trimmed.endsWith("/") ? trimmed : trimmed + "/";
            }
        }
        if (isEmulator()) {
            return DEFAULT_EMULATOR_URL;
        }
        return DEFAULT_PHYSICAL_URL;
    }

    public static synchronized void setCustomBaseUrl(Context context, String newBaseUrl) {
        if (context != null) {
            SessionManager.getInstance(context).setServerUrl(newBaseUrl);
        }
        retrofit = null;
        apiService = null;
    }

    public static synchronized MoolaApiService getService(Context context) {
        String baseUrl = getBaseUrl(context);
        if (apiService == null || retrofit == null || !retrofit.baseUrl().toString().equals(baseUrl)) {
            final SessionManager sessionManager = SessionManager.getInstance(context);

            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(15, TimeUnit.SECONDS)
                    .writeTimeout(15, TimeUnit.SECONDS)
                    .addInterceptor(new Interceptor() {
                        @Override
                        public Response intercept(Chain chain) throws IOException {
                            Request original = chain.request();
                            Request.Builder builder = original.newBuilder();

                            String token = sessionManager.getToken();
                            if (token != null && !token.isEmpty()) {
                                builder.header("Authorization", "Bearer " + token);
                            }

                            builder.header("Accept", "application/json");
                            if (original.body() != null && original.body().contentType() != null) {
                                builder.header("Content-Type", original.body().contentType().toString());
                            } else if ("POST".equalsIgnoreCase(original.method()) || "PUT".equalsIgnoreCase(original.method()) || "PATCH".equalsIgnoreCase(original.method())) {
                                builder.header("Content-Type", "application/json");
                            }

                            return chain.proceed(builder.build());
                        }
                    })
                    .addInterceptor(logging)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

            apiService = retrofit.create(MoolaApiService.class);
        }
        return apiService;
    }
}
