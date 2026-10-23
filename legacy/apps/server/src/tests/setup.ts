// Test setup — configure test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/moola_test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_jest_minimum_20_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_jest_minimum_20_chars';
process.env.PORT = '5001';
process.env.RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX';
process.env.RAZORPAY_KEY_SECRET = 'test_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.AUTH_RATE_LIMIT_MAX = '100'; // Higher for tests
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.SHIPROCKET_EMAIL = 'test@test.com';
process.env.SHIPROCKET_PASSWORD = 'test';
