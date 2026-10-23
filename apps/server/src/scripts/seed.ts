/**
 * MOOLA Database Seed Script
 * Usage: npm run seed
 *
 * Creates: admin user, 2 sellers, 2 buyers, categories, sample products, sample campaign
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User';
import { SellerProfile } from '../models/SellerProfile';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { SeasonalCampaign } from '../models/Campaign';
import { connectDB, disconnectDB } from '../config/database';

async function seed() {
  console.log('🌱 Starting seed...');
  await connectDB();

  // Clear existing seed data
  await User.deleteMany({ phone: { $in: ['9000000001', '9000000002', '9000000003', '9000000004', '9000000000'] } });
  await Category.deleteMany({});
  console.log('🗑️  Cleared existing seed data');

  // ── Create Admin ────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin@moola123', 12);
  const admin = await User.create({
    name: 'MOOLA Admin',
    phone: '9000000000',
    passwordHash: adminPassword,
    role: 'admin',
    isActive: true,
  });
  console.log('✅ Admin created: phone=9000000000, password=admin@moola123');

  // ── Create Sellers ──────────────────────────────────────────
  const sellerPassword = await bcrypt.hash('seller@123', 12);

  const seller1 = await User.create({
    name: 'Ramesh Kumar',
    phone: '9000000001',
    passwordHash: sellerPassword,
    role: 'seller',
    preferredLanguage: 'kn',
    location: { state: 'Karnataka', district: 'Kodagu', pincode: '571201' },
    isActive: true,
  });

  await SellerProfile.create({
    userId: seller1._id,
    shopName: 'Kodagu Forest Honey',
    description: 'Pure wild forest honey from the Western Ghats. No additives, no heating.',
    kycStatus: 'verified',
    isVerified: true,
    verifiedAt: new Date(),
    whatsappNumber: '+919000000001',
    whatsappVerified: true,
    upiId: 'ramesh.honey@okaxis',
    paymentInstructions: 'Google Pay or PhonePe to 9000000001. After payment, send reference on WhatsApp for quick confirmation.',
    totalRating: 47,
    ratingCount: 10,
    averageRating: 4.7,
    totalSales: 124,
    totalRevenue: 62000,
  });

  const seller2 = await User.create({
    name: 'Lakshmi Devi',
    phone: '9000000002',
    passwordHash: sellerPassword,
    role: 'seller',
    preferredLanguage: 'kn',
    location: { state: 'Karnataka', district: 'Mysuru', pincode: '570001' },
    isActive: true,
  });

  await SellerProfile.create({
    userId: seller2._id,
    shopName: 'Lakshmi Homemade Pickles & Chips',
    description: 'Traditional Karnataka pickles and homemade chips made with grandma recipes. Zero chemical preservatives.',
    kycStatus: 'verified',
    isVerified: true,
    verifiedAt: new Date(),
    whatsappNumber: '+919000000002',
    whatsappVerified: true,
    upiId: 'lakshmi.pickles@okhdfcbank',
    paymentInstructions: 'Pay via UPI to 9000000002. Please share screenshot / transaction reference on WhatsApp.',
    totalRating: 38,
    ratingCount: 8,
    averageRating: 4.8,
  });

  console.log('✅ Sellers created: phone=9000000001,9000000002, password=seller@123');

  // ── Create Buyers ───────────────────────────────────────────
  const buyerPassword = await bcrypt.hash('buyer@123', 12);

  await User.create({
    name: 'Arjun Sharma',
    phone: '9000000003',
    passwordHash: buyerPassword,
    role: 'buyer',
    location: { state: 'Karnataka', district: 'Bengaluru Urban', pincode: '560001' },
    isActive: true,
  });

  await User.create({
    name: 'Priya Naik',
    phone: '9000000004',
    passwordHash: buyerPassword,
    role: 'buyer',
    location: { state: 'Karnataka', district: 'Bengaluru Urban', pincode: '560034' },
    isActive: true,
  });

  console.log('✅ Buyers created: phone=9000000003,9000000004, password=buyer@123');

  // ── Create Categories ───────────────────────────────────────
  const categories = await Category.insertMany([
    { name: { en: 'Homemade Chips & Crisps', kn: 'ಮನೆಯ ಬಾಳೆಕಾಯಿ & ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್' }, slug: 'chips', icon: '🥔', sortOrder: 1 },
    { name: { en: 'Pure Honey & Jaggery', kn: 'ಕಾಡು ಜೇನು ಮತ್ತು ಬೆಲ್ಲ' }, slug: 'honey', icon: '🍯', sortOrder: 2 },
    { name: { en: 'Traditional Pickles & Chutneys', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಪ್ಪಿನಕಾಯಿ & ಚಟ್ನಿ' }, slug: 'pickles', icon: '🫙', sortOrder: 3 },
    { name: { en: 'Organic Spices & Powders', kn: 'ಸಾವಯವ ಮಸಾಲೆಗಳು & ಸಾಂಬಾರ್ ಪುಡಿ' }, slug: 'spices', icon: '🌶️', sortOrder: 4 },
    { name: { en: 'Homemade Snacks & Papad', kn: 'ಮನೆಯ ಸಾಂಪ್ರದಾಯಿಕ ತಿಂಡಿ & ಹಪ್ಪಳ' }, slug: 'snacks', icon: '🥟', sortOrder: 5 },
    { name: { en: 'Cold-Pressed Oils & Desi Ghee', kn: 'ಗಾಣದ ಎಣ್ಣೆ & ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ' }, slug: 'oils', icon: '🫒', sortOrder: 6 },
    { name: { en: 'Native Millets & Flours', kn: 'ಸಿರಿಧಾನ್ಯ & ನಾಟಿ ಹಿಟ್ಟುಗಳು' }, slug: 'flours', icon: '🌾', sortOrder: 7 },
    { name: { en: 'Herbal & Ayurvedic Foods', kn: 'ಆರೋಗ್ಯಕರ ಔಷಧೀಯ ಆಹಾರ' }, slug: 'herbal', icon: '🌿', sortOrder: 8 },
  ]);

  console.log(`✅ Created ${categories.length} categories`);


  // ── Create Products ─────────────────────────────────────────
  const chipsCategory = categories.find((c) => c.slug === 'chips')!;
  const honeyCategory = categories.find((c) => c.slug === 'honey')!;
  const picklesCategory = categories.find((c) => c.slug === 'pickles')!;

  await Product.insertMany([
    {
      sellerId: seller2._id,
      categoryId: chipsCategory._id,
      name: { en: 'Malnad Raw Jackfruit Chips (Halasina Chips)', kn: 'ಮಲೆನಾಡಿನ ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್' },
      description: {
        en: 'Crispy deep-fried jackfruit chips prepared in pure cold-pressed coconut oil with rock salt. Traditional Malnad snack without palm oil or artificial preservatives.',
        kn: 'ಶುದ್ಧ ತೆಂಗಿನ ಎಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಮಲೆನಾಡಿನ ಗರಿಗರಿ ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ತಾಳೆ ಎಣ್ಣೆ ಬಳಸಲಾಗಿಲ್ಲ.',
      },
      images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
      price: 180,
      mrp: 220,
      unit: '250g',
      quantityAvailable: 45,
      minOrderQty: 1,
      tags: ['chips', 'jackfruit', 'homemade', 'snack', 'malnad'],
      isOrganic: true,
      isActive: true,
      isApproved: true,
      averageRating: 4.9,
      reviewCount: 38,
    },
    {
      sellerId: seller2._id,
      categoryId: chipsCategory._id,
      name: { en: 'Kerala Nendran Banana Chips in Coconut Oil', kn: 'ತೆಂಗಿನ ಎಣ್ಣೆಯ ನೇಂದ್ರ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್' },
      description: {
        en: 'Authentic homemade raw banana chips made from farm-harvested Nendran bananas, thinly sliced and crisp fried in wood-pressed coconut oil with mild turmeric.',
        kn: 'ಮನೆಯಲ್ಲೇ ತಯಾರಿಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್. ಮರದ ಗಾಣದ ತೆಂಗಿನ ಎಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಗರಿಗರಿ ಚಿಪ್ಸ್.',
      },
      images: ['https://images.unsplash.com/photo-1621996346565-e3d5d6281745?w=800'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281745?w=400',
      price: 160,
      mrp: 200,
      unit: '250g',
      quantityAvailable: 60,
      minOrderQty: 1,
      tags: ['chips', 'banana', 'coconut-oil', 'homemade'],
      isOrganic: true,
      isActive: true,
      isApproved: true,
      averageRating: 4.8,
      reviewCount: 52,
    },
    {

      sellerId: seller1._id,
      categoryId: honeyCategory._id,
      name: { en: 'Wild Forest Honey', kn: 'ಕಾಡು ಜೇನುತುಪ್ಪ' },
      description: {
        en: 'Pure wild honey collected from Western Ghats forests. Rich in antioxidants, natural enzymes. Never heated or processed.',
        kn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಾಡಿನಿಂದ ಸಂಗ್ರಹಿಸಿದ ಶುದ್ಧ ಕಾಡು ಜೇನು. ಎಂದಿಗೂ ಬಿಸಿ ಮಾಡಲಾಗಿಲ್ಲ.',
      },
      images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
      price: 450,
      mrp: 550,
      unit: '500g',
      quantityAvailable: 50,
      minOrderQty: 1,
      tags: ['honey', 'forest', 'organic', 'raw'],
      isOrganic: true,
      isCertified: false,
      isActive: true,
      isApproved: true,
      averageRating: 4.8,
      reviewCount: 23,
    },
    {
      sellerId: seller1._id,
      categoryId: honeyCategory._id,
      name: { en: 'Cardamom Infused Honey', kn: 'ಏಲಕ್ಕಿ ಜೇನುತುಪ್ಪ' },
      description: {
        en: 'Wild honey infused with organic cardamom. Perfect for chai and desserts.',
        kn: 'ಸಾವಯವ ಏಲಕ್ಕಿಯಿಂದ ತುಂಬಿದ ಕಾಡು ಜೇನು. ಚಹಾ ಮತ್ತು ಸಿಹಿ ತಿಂಡಿಗಳಿಗೆ ಸೂಕ್ತ.',
      },
      images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400',
      price: 380,
      mrp: 450,
      unit: '250g',
      quantityAvailable: 30,
      tags: ['honey', 'cardamom', 'organic'],
      isOrganic: true,
      isActive: true,
      isApproved: true,
      averageRating: 4.5,
      reviewCount: 12,
    },
    {
      sellerId: seller2._id,
      categoryId: picklesCategory._id,
      name: { en: 'Traditional Raw Mango Pickle', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ' },
      description: {
        en: 'Grandma\'s recipe raw mango pickle with cold-pressed sesame oil and organic spices. No preservatives.',
        kn: 'ಅಜ್ಜಿಯ ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ. ಯಾವುದೇ ಸಂರಕ್ಷಕಗಳಿಲ್ಲ.',
      },
      images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      price: 220,
      mrp: 280,
      unit: '500g',
      quantityAvailable: 40,
      tags: ['pickle', 'mango', 'traditional', 'homemade'],
      isOrganic: true,
      isActive: true,
      isApproved: true,
      averageRating: 4.9,
      reviewCount: 31,
    },
    {
      sellerId: seller2._id,
      categoryId: picklesCategory._id,
      name: { en: 'Mixed Vegetable Pickle', kn: 'ಮಿಶ್ರ ತರಕಾರಿ ಉಪ್ಪಿನಕಾಯಿ' },
      description: {
        en: 'A seasonal mix of vegetables pickled with spices. Made fresh in small batches.',
        kn: 'ಮಸಾಲೆಗಳೊಂದಿಗೆ ಋತುಮಾನದ ತರಕಾರಿ ಮಿಶ್ರಣ. ಸಣ್ಣ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ತಾಜಾ ತಯಾರಿಸಲಾಗಿದೆ.',
      },
      images: ['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400',
      price: 180,
      unit: '400g',
      quantityAvailable: 25,
      tags: ['pickle', 'vegetable', 'seasonal'],
      isOrganic: true,
      isActive: true,
      isApproved: true,
      isSeasonal: true,
      averageRating: 4.6,
      reviewCount: 14,
    },
  ]);

  console.log('✅ Created 4 sample products');

  // ── Create Seasonal Campaign ────────────────────────────────
  const products = await Product.find({ sellerId: seller1._id }).lean();
  await SeasonalCampaign.create({
    title: {
      en: 'Harvest Festival Special 2026',
      kn: '2026 ಹಾರ್ವೆಸ್ಟ್ ಹಬ್ಬ ವಿಶೇಷ',
    },
    description: 'Pre-book fresh harvest honey before Diwali. Limited quantities from Western Ghats.',
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-11-15'),
    bookingDeadline: new Date('2026-10-31'),
    products: products.map((p) => ({
      productId: p._id,
      maxQuantity: 100,
      bookedQuantity: 0,
    })),
    isActive: true,
    createdBy: admin._id,
  });

  console.log('✅ Created seasonal campaign');
  console.log('\n═══════════════════════════════════════');
  console.log('🌱 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin:   9000000000 / admin@moola123');
  console.log('Seller1: 9000000001 / seller@123');
  console.log('Seller2: 9000000002 / seller@123');
  console.log('Buyer1:  9000000003 / buyer@123');
  console.log('Buyer2:  9000000004 / buyer@123');
  console.log('═══════════════════════════════════════\n');

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await disconnectDB();
  process.exit(1);
});
