package com.moola.app.data.api;

import android.content.Context;
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

    // Default development API URL for POCO M4 Pro physical device over Wi-Fi
    // Can also be dynamically updated via SessionManager or ApiClient.setCustomBaseUrl()
    public static final String DEFAULT_BASE_URL = "http://192.168.1.40:5000/";

    private static Retrofit retrofit = null;
    private static MoolaApiService apiService = null;

    public static String getBaseUrl(Context context) {
        if (context != null) {
            String savedUrl = SessionManager.getInstance(context).getServerUrl();
            if (savedUrl != null && !savedUrl.trim().isEmpty()) {
                String trimmed = savedUrl.trim();
                return trimmed.endsWith("/") ? trimmed : trimmed + "/";
            }
        }
        return DEFAULT_BASE_URL;
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
                            builder.header("Content-Type", "application/json");

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
