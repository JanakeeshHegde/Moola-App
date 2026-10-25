const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory Database
const users = [
    {
        id: "user_admin_01",
        name: "Admin User",
        phone: "9000000000",
        email: "admin@moola.com",
        role: "admin",
        preferredLanguage: "en",
        isActive: true,
        password: "admin@moola123"
    },
    {
        id: "user_seller_01",
        name: "Ramesh Seller",
        phone: "9000000001",
        email: "ramesh@seller.com",
        role: "seller",
        preferredLanguage: "en",
        isActive: true,
        password: "seller@123"
    },
    {
        id: "user_buyer_03",
        name: "Anita Buyer",
        phone: "9000000003",
        email: "anita@buyer.com",
        role: "buyer",
        preferredLanguage: "en",
        isActive: true,
        password: "buyer@123"
    }
];

const sellerProfiles = {
    "user_seller_01": {
        id: "seller_profile_01",
        userId: "user_seller_01",
        shopName: "Ramesh Organic Farm & Mandi",
        bio: "Direct from organic farmers to your doorstep.",
        rating: 4.8,
        totalSales: 1250,
        isVerifiedKyc: true,
        upiId: "ramesh@upi",
        address: "Green Valley, Village Road"
    }
};

const categories = [
    { id: "cat_1", name: "Organic Vegetables", icon: "vegetables" },
    { id: "cat_2", name: "Fresh Fruits", icon: "fruits" },
    { id: "cat_3", name: "Grains & Pulses", icon: "grains" },
    { id: "cat_4", name: "Dairy & Honey", icon: "dairy" },
    { id: "cat_5", name: "Handicrafts", icon: "handicrafts" }
];

const products = [
    {
        id: "prod_1",
        title: "Organic Desi Tomatoes",
        price: 45.0,
        unit: "kg",
        categoryId: "cat_1",
        categoryName: "Organic Vegetables",
        sellerId: "user_seller_01",
        sellerName: "Ramesh Organic Farm & Mandi",
        imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500",
        description: "Freshly harvested organic tomatoes grown without chemical fertilizers.",
        isOrganic: true,
        stockQuantity: 150
    },
    {
        id: "prod_2",
        title: "Alphonso Mangoes (Box)",
        price: 650.0,
        unit: "dozen",
        categoryId: "cat_2",
        categoryName: "Fresh Fruits",
        sellerId: "user_seller_01",
        sellerName: "Ramesh Organic Farm & Mandi",
        imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
        description: "Sweet and juicy Ratnagiri Alphonso mangoes.",
        isOrganic: true,
        stockQuantity: 40
    }
];

const orders = [
    {
        id: "ord_101",
        buyerId: "user_buyer_03",
        buyerName: "Anita Buyer",
        buyerPhone: "9000000003",
        sellerId: "user_seller_01",
        sellerName: "Ramesh Organic Farm & Mandi",
        items: [{ productId: "prod_1", title: "Organic Desi Tomatoes", quantity: 2, price: 45.0 }],
        totalAmount: 90.0,
        status: "CONFIRMED",
        paymentStatus: "VERIFIED",
        createdAt: new Date().toISOString()
    }
];

const notifications = [
    {
        id: "notif_1",
        userId: "user_buyer_03",
        title: "Welcome to Moola!",
        message: "Explore direct farm-to-table organic produce and artisan goods.",
        isRead: false,
        createdAt: new Date().toISOString()
    }
];

// Helper wrapper for API responses
function successResponse(data, message = "Success") {
    return {
        success: true,
        message: message,
        data: data
    };
}

function errorResponse(message, code = 400) {
    return {
        success: false,
        error: {
            code: code,
            message: message
        },
        message: message
    };
}

// Auth Middleware (Mock)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // For development convenience, default to buyer if no token supplied
        req.user = users[2];
        return next();
    }
    const found = users.find(u => u.id === token || "token_" + u.id === token);
    if (found) {
        req.user = found;
        next();
    } else {
        req.user = users[2]; // fallback
        next();
    }
}

// ROUTES

// 1. Auth Login
app.post('/api/v1/auth/login', (req, res) => {
    const { phone, password } = req.body;
    console.log(`Login attempt for phone: ${phone}`);

    const user = users.find(u => u.phone === phone);
    if (!user || user.password !== password) {
        return res.status(401).json(errorResponse("Invalid mobile number or password.", 401));
    }

    const sellerProfile = user.role === 'seller' ? (sellerProfiles[user.id] || null) : null;

    const authData = {
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            preferredLanguage: user.preferredLanguage,
            isActive: user.isActive
        },
        tokens: {
            accessToken: "token_" + user.id,
            refreshToken: "refresh_" + user.id
        },
        sellerProfile: sellerProfile
    };

    res.json(successResponse(authData, "Login successful"));
});

// 2. Auth Register
app.post('/api/v1/auth/register', (req, res) => {
    const { name, phone, password, role, shopName } = req.body;
    console.log(`Register attempt for phone: ${phone}, role: ${role}`);

    if (users.some(u => u.phone === phone)) {
        return res.status(400).json(errorResponse("Phone number already registered. Please login.", 400));
    }

    const newUser = {
        id: "user_" + Date.now(),
        name: name || "New User",
        phone: phone,
        email: phone + "@moola.com",
        role: role || "buyer",
        preferredLanguage: "en",
        isActive: true,
        password: password || "123456"
    };

    users.push(newUser);

    let sellerProf = null;
    if (newUser.role === 'seller') {
        sellerProf = {
            id: "seller_profile_" + Date.now(),
            userId: newUser.id,
            shopName: shopName || (name + "'s Shop"),
            bio: "Welcome to my shop!",
            rating: 5.0,
            totalSales: 0,
            isVerifiedKyc: true,
            upiId: phone + "@upi",
            address: "Local Hub"
        };
        sellerProfiles[newUser.id] = sellerProf;
    }

    const authData = {
        user: newUser,
        tokens: {
            accessToken: "token_" + newUser.id,
            refreshToken: "refresh_" + newUser.id
        },
        sellerProfile: sellerProf
    };

    res.json(successResponse(authData, "Registration successful"));
});

// 3. Get Me
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
    res.json(successResponse(req.user));
});

// 4. Categories
app.get('/api/v1/categories', (req, res) => {
    res.json(successResponse({ categories: categories }));
});

// 5. Products
app.get('/api/v1/products', (req, res) => {
    const { q, category } = req.query;
    let list = [...products];
    if (q) {
        list = list.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));
    }
    if (category) {
        list = list.filter(p => p.categoryId === category);
    }
    res.json(successResponse({ products: list, total: list.length }));
});

app.get('/api/v1/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id) || products[0];
    res.json(successResponse({ product: product, related: products }));
});

app.get('/api/v1/products/my', authenticateToken, (req, res) => {
    const list = products.filter(p => p.sellerId === req.user.id);
    res.json(successResponse({ products: list, total: list.length }));
});

app.post('/api/v1/products', authenticateToken, (req, res) => {
    const newProd = {
        id: "prod_" + Date.now(),
        ...req.body,
        sellerId: req.user.id,
        sellerName: req.user.name
    };
    products.push(newProd);
    res.json(successResponse(newProd, "Product created successfully"));
});

// 6. Orders
app.post('/api/v1/orders/request', authenticateToken, (req, res) => {
    const newOrder = {
        id: "ord_" + Date.now(),
        buyerId: req.user.id,
        buyerName: req.user.name,
        buyerPhone: req.user.phone,
        sellerId: req.body.sellerId || "user_seller_01",
        sellerName: "Ramesh Organic Farm & Mandi",
        items: req.body.items || [],
        totalAmount: req.body.totalAmount || 100.0,
        status: "PENDING",
        paymentStatus: "PENDING",
        createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    res.json(successResponse(newOrder, "Order requested successfully"));
});

app.get('/api/v1/orders/my', authenticateToken, (req, res) => {
    const list = orders.filter(o => o.buyerId === req.user.id);
    res.json(successResponse(list));
});

app.get('/api/v1/orders/seller', authenticateToken, (req, res) => {
    const list = orders.filter(o => o.sellerId === req.user.id || req.user.role === 'admin');
    res.json(successResponse(list));
});

app.get('/api/v1/orders/:id', authenticateToken, (req, res) => {
    const order = orders.find(o => o.id === req.params.id) || orders[0];
    res.json(successResponse(order));
});

// 7. Seller Portal
app.get('/api/v1/seller/profile', authenticateToken, (req, res) => {
    const profile = sellerProfiles[req.user.id] || sellerProfiles["user_seller_01"];
    res.json(successResponse(profile));
});

app.get('/api/v1/seller/analytics', authenticateToken, (req, res) => {
    res.json(successResponse({
        totalRevenue: 45200.0,
        totalOrdersCount: 142,
        pendingOrdersCount: 5,
        rating: 4.8
    }));
});

// 8. Admin Portal
app.get('/api/v1/admin/analytics', authenticateToken, (req, res) => {
    res.json(successResponse({
        totalUsers: users.length,
        totalBuyers: users.filter(u => u.role === 'buyer').length,
        totalSellers: users.filter(u => u.role === 'seller').length,
        totalVolume: 1250000.0
    }));
});

app.get('/api/v1/admin/buyers', authenticateToken, (req, res) => {
    res.json(successResponse(users.filter(u => u.role === 'buyer')));
});

app.get('/api/v1/admin/sellers', authenticateToken, (req, res) => {
    res.json(successResponse(Object.values(sellerProfiles)));
});

// 9. Buyer Dashboard
app.get('/api/v1/buyer/dashboard', authenticateToken, (req, res) => {
    res.json(successResponse({
        walletBalance: 250.0,
        activeOrdersCount: orders.filter(o => o.buyerId === req.user.id && o.status !== 'DELIVERED').length,
        featuredCategories: categories,
        featuredProducts: products
    }));
});

app.get('/api/v1/config/commerce', (req, res) => {
    res.json(successResponse({
        currencySymbol: "₹",
        supportPhone: "+91 9876543210",
        appVersion: "1.0.0",
        maintenanceMode: false
    }));
});

app.get('/api/v1/notifications', authenticateToken, (req, res) => {
    res.json(successResponse(notifications));
});

app.get('/api/v1/conversations', authenticateToken, (req, res) => {
    res.json(successResponse([]));
});

// Start Server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` Moola Mock Backend Server is running! `);
    console.log(` Port: ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`========================================`);
});
