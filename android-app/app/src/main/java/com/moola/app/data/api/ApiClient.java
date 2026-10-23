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

    // Default Android Emulator loopback to host machine port 5000
    // For physical devices (e.g. POCO M4 Pro over Wi-Fi), change this to your PC's LAN IP
    // or call ApiClient.setCustomBaseUrl(context, "http://192.168.1.X:5000/")
    public static final String DEFAULT_BASE_URL = "http://10.0.2.2:5000/";

    private static Retrofit retrofit = null;
    private static MoolaApiService apiService = null;

    public static String getBaseUrl(Context context) {
        if (context != null) {
            String savedUrl = SessionManager.getInstance(context).getServerUrl();
            if (savedUrl != null && !savedUrl.trim().isEmpty()) {
                return savedUrl.trim();
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
        if (apiService == null) {
            final SessionManager sessionManager = SessionManager.getInstance(context);
            String baseUrl = getBaseUrl(context);

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
