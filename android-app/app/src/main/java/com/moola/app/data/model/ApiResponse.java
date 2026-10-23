package com.moola.app.data.model;

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private ErrorDetail error;

    public static class ErrorDetail {
        private String code;
        private String message;

        public String getCode() { return code; }
        public String getMessage() { return message; }
    }

    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public String getMessage() { return message; }
    public ErrorDetail getError() { return error; }
}
