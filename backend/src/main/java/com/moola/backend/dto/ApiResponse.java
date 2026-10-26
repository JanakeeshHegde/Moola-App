package com.moola.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private ApiError error;

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public ApiResponse(boolean success, String message, T data, ApiError error) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message, int code) {
        return new ApiResponse<>(false, message, null, new ApiError(code, message));
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public ApiError getError() { return error; }
    public void setError(ApiError error) { this.error = error; }

    public static class ApiError {
        private int code;
        private String message;

        public ApiError() {}
        public ApiError(int code, String message) {
            this.code = code;
            this.message = message;
        }

        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
