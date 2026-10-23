export interface MockSeller {
  id: string;
  name: string;
  shopName: string;
  location: string;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  avatar: string;
  bio: string;
  whatsappNumber: string;
  whatsappVerified?: boolean;
  upiId?: string;
  paymentInstructions?: string;
}

export interface MockProduct {
  id: string;
  name: string;
  nameKn: string;
  categoryId: string;
  categoryName: string;
  categoryNameKn: string;
  price: number;
  unit: string;
  images: string[];
  seller: MockSeller;
  description: string;
  descriptionKn: string;
  isOrganic: boolean;
  certificationNumber?: string;
  stock: number;
  farmOrigin: string;
  harvestDate?: string;
  rating: number;
  ratingCount: number;
}

export interface MockCampaign {
  id: string;
  title: string;
  titleKn: string;
  description: string;
  descriptionKn: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  bookingDeadline: string;
  totalCapacity: number;
  bookedCapacity: number;
  unit: string;
  price: number;
  seller: MockSeller;
}

export interface MockCustomOffer {
  id: string;
  seller: MockSeller;
  price: number;
  deliveryDays: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface MockCustomRequest {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  budgetMax: number;
  expectedDate: string;
  category: string;
  buyerName: string;
  status: 'open' | 'fulfilled' | 'closed';
  createdAt: string;
  offers: MockCustomOffer[];
}

export const MOCK_SELLERS: Record<string, MockSeller> = {
  seller_001: {
    id: 'seller_001',
    name: 'Basavaraj Gowda',
    shopName: 'Malnad Organic Farms',
    location: 'Thirthahalli, Shivamogga',
    rating: 4.9,
    ratingCount: 142,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Pioneer in multi-tier natural farming. Specializes in wild forest honey, native spices, and arecanut grove honey.',
    whatsappNumber: '+919000000001',
    whatsappVerified: true,
    upiId: 'malnad.farms@okhdfcbank',
    paymentInstructions: 'GPay or PhonePe to 9000000001. Please send transaction screenshot on WhatsApp for verification.',
  },
  seller_002: {
    id: 'seller_002',
    name: 'Shailaja Hegde',
    shopName: 'Sirsi Homemade Delicacies & Chips',
    location: 'Sirsi, Uttara Kannada',
    rating: 4.8,
    ratingCount: 98,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    bio: 'Preserving traditional Malnad food heritage. Raw jackfruit chips, banana chips, sun-dried papads, and natural pickles.',
    whatsappNumber: '+919000000002',
    whatsappVerified: true,
    upiId: 'sirsi.delicacies@okaxis',
    paymentInstructions: 'UPI to 9000000002. Seller will confirm package dispatch upon verification.',
  },
  seller_003: {
    id: 'seller_003',
    name: 'Manjunath Swamy',
    shopName: 'Kaveri Valley Millets & Sweets',
    location: 'Mandya, Karnataka',
    rating: 4.9,
    ratingCount: 215,
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Dedicated to Zero-Budget Natural Farming (ZBNF). Cultivating heirloom ragi, foxtail millets, and unpolished Sona Masoori.',
    whatsappNumber: '+919000000003',
    whatsappVerified: true,
    upiId: 'kaveri.millets@oksbi',
    paymentInstructions: 'Pay via Google Pay / Paytm to 9000000003.',
  },
};


export const MOCK_CATEGORIES = [
  { id: 'cat_all', name: 'All Products', nameKn: 'ಎಲ್ಲ ಉತ್ಪನ್ನಗಳು', icon: '🌿' },
  { id: 'cat_chips', name: 'Homemade Chips & Crisps', nameKn: 'ಬಾಳೆಕಾಯಿ & ಹಲಸಿನ ಚಿಪ್ಸ್', icon: '🥔' },
  { id: 'cat_honey', name: 'Raw Honey & Jaggery', nameKn: 'ಜೇನುತುಪ್ಪ & ಬೆಲ್ಲ', icon: '🍯' },
  { id: 'cat_pickles', name: 'Traditional Pickles', nameKn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಪ್ಪಿನಕಾಯಿ', icon: '🫙' },
  { id: 'cat_spices', name: 'Spices & Masala', nameKn: 'ಮಸಾಲೆ & ಅರಿಶಿನ', icon: '🌶️' },
  { id: 'cat_snacks', name: 'Traditional Snacks', nameKn: 'ಮನೆ ತಿಂಡಿ & ಹಪ್ಪಳ', icon: '🥟' },
  { id: 'cat_oils', name: 'Cold-Pressed Oils & Ghee', nameKn: 'ಗಾಣದ ಎಣ್ಣೆ & ತುಪ್ಪ', icon: '🫒' },
  { id: 'cat_grains', name: 'Native Rice & Millets', nameKn: 'ನಾಟಿ ಅಕ್ಕಿ & ಸಿರಿಧಾನ್ಯ', icon: '🌾' },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p_jackfruit_01',
    name: 'Malnad Raw Jackfruit Chips',
    nameKn: 'ಮಲೆನಾಡಿನ ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್',
    categoryId: 'cat_chips',
    categoryName: 'Homemade Chips & Crisps',
    categoryNameKn: 'ಬಾಳೆಕಾಯಿ & ಹಲಸಿನ ಚಿಪ್ಸ್',
    price: 180,
    unit: '250g',
    images: [
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600',
    ],
    seller: MOCK_SELLERS.seller_002,
    description: 'Crispy deep-fried jackfruit chips prepared in pure cold-pressed coconut oil with rock salt. Traditional Malnad homemade snack without palm oil.',
    descriptionKn: 'ಶುದ್ಧ ತೆಂಗಿನ ಎಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಮಲೆನಾಡಿನ ಗರಿಗರಿ ಹಲಸಿನಕಾಯಿ ಚಿಪ್ಸ್. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ತಾಳೆ ಎಣ್ಣೆ ಬಳಸಲಾಗಿಲ್ಲ.',
    isOrganic: true,
    stock: 40,
    farmOrigin: 'Sirsi, Karnataka',
    rating: 4.9,
    ratingCount: 88,
  },
  {
    id: 'p_banana_01',
    name: 'Kerala Nendran Banana Chips',
    nameKn: 'ತೆಂಗಿನ ಎಣ್ಣೆಯ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್',
    categoryId: 'cat_chips',
    categoryName: 'Homemade Chips & Crisps',
    categoryNameKn: 'ಬಾಳೆಕಾಯಿ & ಹಲಸಿನ ಚಿಪ್ಸ್',
    price: 160,
    unit: '250g',
    images: [
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281745?w=600',
    ],
    seller: MOCK_SELLERS.seller_002,
    description: 'Authentic homemade raw banana chips made from farm-harvested Nendran bananas, crisp-fried in wood-pressed coconut oil with rock salt and mild turmeric.',
    descriptionKn: 'ಮನೆಯಲ್ಲೇ ತಯಾರಿಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್. ಮರದ ಗಾಣದ ತೆಂಗಿನ ಎಣ್ಣೆಯಲ್ಲಿ ಕರಿದ ಗರಿಗರಿ ಚಿಪ್ಸ್.',
    isOrganic: true,
    stock: 55,
    farmOrigin: 'Sirsi, Karnataka',
    rating: 4.8,
    ratingCount: 114,
  },
  {
    id: 'p_pickle_01',
    name: 'Appe Midi Raw Mango Pickle',
    nameKn: 'ಮಲೆನಾಡಿನ ಅಪ್ಪೆ ಮಿಡಿ ಉಪ್ಪಿನಕಾಯಿ',
    categoryId: 'cat_pickles',
    categoryName: 'Traditional Pickles',
    categoryNameKn: 'ಸಾಂಪ್ರದಾಯಿಕ ಉಪ್ಪಿನಕಾಯಿ',
    price: 240,
    unit: '350g',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',
    ],
    seller: MOCK_SELLERS.seller_002,
    description: 'Rare wild aromatic tender mangoes (Appe Midi) soaked in cold-pressed mustard oil, fenugreek, and Guntur chilli. Authentic Western Ghats recipe with no vinegar or sodium benzoate.',
    descriptionKn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಪ್ರಸಿದ್ಧ ಅಪ್ಪೆ ಮಿಡಿ ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ. ಅಜ್ಜಿಯ ಕೈರುಚಿಯ ಸಾಂಪ್ರದಾಯಿಕ ಮಸಾಲೆ.',
    isOrganic: true,
    stock: 25,
    farmOrigin: 'Sirsi, Karnataka',
    rating: 5.0,
    ratingCount: 92,
  },
  {
    id: 'p_honey_01',
    name: 'Wild Forest Raw Honey',
    nameKn: 'ಕಾಡಿನ ನೈಸರ್ಗಿಕ ಜೇನುತುಪ್ಪ',
    categoryId: 'cat_honey',
    categoryName: 'Raw Honey & Jaggery',
    categoryNameKn: 'ಜೇನುತುಪ್ಪ & ಬೆಲ್ಲ',
    price: 380,
    unit: '500g',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600',
    ],
    seller: MOCK_SELLERS.seller_001,
    description: 'Unprocessed, unpasteurized honey harvested from the Western Ghats forest canopy. Retains natural pollen, enzymes, and medicinal properties.',
    descriptionKn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಾಡಿನಲ್ಲಿ ಸಂಗ್ರಹಿಸಿದ ನೈಸರ್ಗಿಕ ಜೇನುತುಪ್ಪ. ಯಾವುದೇ ಕೃತಕ ಅಂಶಗಳಿಲ್ಲದೆ ಶುದ್ಧವಾಗಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ.',
    isOrganic: true,
    certificationNumber: 'NPOP/NAB/0012/KA-2025',
    stock: 24,
    farmOrigin: 'Thirthahalli, Karnataka',
    harvestDate: 'Oct 2026',
    rating: 4.9,
    ratingCount: 86,
  },

  {
    id: 'p_oil_01',
    name: 'Wood-Pressed Coconut Oil (Mara Gana)',
    nameKn: 'ಮರದ ಗಾಣದ ತೆಂಗಿನ ಎಣ್ಣೆ',
    categoryId: 'cat_oils',
    categoryName: 'Cold-Pressed Oils',
    categoryNameKn: 'ಗಾಣದ ಎಣ್ಣೆಗಳು',
    price: 340,
    unit: '1 Litre',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600',
    ],
    seller: MOCK_SELLERS.seller_001,
    description: 'Cold-pressed using traditional wooden churner (Vagai wood) at low RPM. Zero heat generation preserves natural aroma and antioxidants.',
    descriptionKn: 'ಪಾರಂಪರಿಕ ಮರದ ಗಾಣದಲ್ಲಿ ಅರೆದ ಶುದ್ಧ ತೆಂಗಿನ ಎಣ್ಣೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ಬಿಸಿ ಮಾಡದೆ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ.',
    isOrganic: true,
    certificationNumber: 'NPOP/NAB/0014/KA-2025',
    stock: 35,
    farmOrigin: 'Shivamogga, Karnataka',
    rating: 4.8,
    ratingCount: 64,
  },
  {
    id: 'p_ragi_01',
    name: 'Stone-Ground Organic Ragi Flour',
    nameKn: 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಸಾವಯವ ರಾಗಿ ಹಿಟ್ಟು',
    categoryId: 'cat_grains',
    categoryName: 'Native Rice & Millets',
    categoryNameKn: 'ನಾಟಿ ಅಕ್ಕಿ & ಸಿರಿಧಾನ್ಯ',
    price: 95,
    unit: '1 kg',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
    ],
    seller: MOCK_SELLERS.seller_003,
    description: 'Organically grown brown finger millet, washed in natural well water, sun-dried, and ground on slow traditional chakki stone.',
    descriptionKn: 'ಮಂಡ್ಯದ ನೈಸರ್ಗಿಕ ಕೃಷಿಯಲ್ಲಿ ಬೆಳೆದ ಕೆಂಪು ರಾಗಿ. ಕಲ್ಲಿನ ಬೀಸುವ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿದ ಹಿಟ್ಟು.',
    isOrganic: true,
    certificationNumber: 'PGS-INDIA-1092',
    stock: 50,
    farmOrigin: 'Mandya, Karnataka',
    rating: 4.9,
    ratingCount: 110,
  },
  {
    id: 'p_jaggery_01',
    name: 'Organic Liquid Jaggery (Joni Bella)',
    nameKn: 'ಮಲೆನಾಡಿನ ಜೋನಿ ಬೆಲ್ಲ',
    categoryId: 'cat_honey',
    categoryName: 'Raw Honey & Jaggery',
    categoryNameKn: 'ಜೇನುತುಪ್ಪ & ಬೆಲ್ಲ',
    price: 220,
    unit: '1 kg',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600',
    ],
    seller: MOCK_SELLERS.seller_002,
    description: 'Traditional Malnad semi-liquid pure sugarcane jaggery made without chemical clarifiers or sulphur. Rich in natural iron and minerals.',
    descriptionKn: 'ಮಲೆನಾಡಿನ ಸಾಂಪ್ರದಾಯಿಕ ಜೋನಿ ಬೆಲ್ಲ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ಸುಣ್ಣ ಬಳಸದೆ ತಯಾರಿಸಿದ ನೈಸರ್ಗಿಕ ಬೆಲ್ಲ.',
    isOrganic: true,
    stock: 18,
    farmOrigin: 'Sirsi, Karnataka',
    rating: 5.0,
    ratingCount: 42,
  },
  {
    id: 'p_turmeric_01',
    name: 'Salem Native High-Curcumin Turmeric',
    nameKn: 'ಶುದ್ಧ ಸಾವಯವ ಅರಿಶಿನ ಪುಡಿ',
    categoryId: 'cat_spices',
    categoryName: 'Spices & Turmeric',
    categoryNameKn: 'ಮಸಾಲೆ & ಅರಿಶಿನ',
    price: 180,
    unit: '250g',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600',
    ],
    seller: MOCK_SELLERS.seller_001,
    description: 'Heirloom turmeric rhizomes with tested 5.2% natural curcumin content. Farm dried and pulverized in small batches.',
    descriptionKn: 'ಹೆಚ್ಚಿನ ಕರ್ಕ್ಯುಮಿನ್ ಅಂಶವಿರುವ ಸಾವಯವ ಅರಿಶಿನ. ನೈಸರ್ಗಿಕವಾಗಿ ಒಣಗಿಸಿ ಪುಡಿಮಾಡಲಾಗಿದೆ.',
    isOrganic: true,
    stock: 40,
    farmOrigin: 'Thirthahalli, Karnataka',
    rating: 4.8,
    ratingCount: 53,
  },
];

export const MOCK_CAMPAIGNS: MockCampaign[] = [
  {
    id: 'camp_001',
    title: 'Sirsi Natural Alphonso Mango Pre-Booking',
    titleKn: 'ಸಿರ್ಸಿ ನೈಸರ್ಗಿಕ ಆಲ್ಫೋನ್ಸೋ ಮಾವು ಮುಂಗಡ ಬುಕಿಂಗ್',
    description: 'Reserve your tree-ripened organic Alphonso mangoes directly from the orchard. Zero calcium carbide ripening. Batches dispatched straight from trees.',
    descriptionKn: 'ಮರದಲ್ಲೇ ಮಾಗಿದ ಸಿರ್ಸಿಯ ನೈಸರ್ಗಿಕ ಆಲ್ಫೋನ್ಸೋ ಮಾವಿನ ಹಣ್ಣುಗಳನ್ನು ನೇರವಾಗಿ ಮುಂಗಡ ಕಾಯ್ದಿರಿಸಿ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಬಳಸುವುದಿಲ್ಲ.',
    bannerImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
    startDate: '2026-04-01',
    endDate: '2026-05-15',
    bookingDeadline: '2026-05-05',
    totalCapacity: 100,
    bookedCapacity: 64,
    unit: 'Box (3 dozen)',
    price: 1450,
    seller: MOCK_SELLERS.seller_002,
  },
  {
    id: 'camp_002',
    title: 'Deepavali Pure Desi Ghee Sweets & Murukku',
    titleKn: 'ದೀಪಾವಳಿ ಶುದ್ಧ ದೇಶಿ ತುಪ್ಪದ ತಿಂಡಿ & ಚಕ್ಕುಲಿ ಬಾಕ್ಸ್',
    description: 'Fresh artisanal festival sweets prepared with A2 Hallikar cow ghee and organic jaggery. Handmade by rural women artisans.',
    descriptionKn: 'ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ ಮತ್ತು ಸಾವಯವ ಬೆಲ್ಲದಲ್ಲಿ ತಯಾರಿಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಹಬ್ಬದ ಸಿಹಿತಿಂಡಿಗಳು.',
    bannerImage: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800',
    startDate: '2026-10-15',
    endDate: '2026-11-05',
    bookingDeadline: '2026-10-28',
    totalCapacity: 150,
    bookedCapacity: 112,
    unit: 'Festival Box (1.5 kg)',
    price: 920,
    seller: MOCK_SELLERS.seller_002,
  },
];

export const MOCK_CUSTOM_REQUESTS: MockCustomRequest[] = [
  {
    id: 'req_001',
    title: '5kg Heritage Red Navara Rice for Ayurvedic Porridge',
    description: 'Looking for 100% naturally grown unpolished Navara red rice from the upcoming harvest for postpartum convalescence.',
    quantity: 5,
    unit: 'kg',
    budgetMax: 750,
    expectedDate: '2026-11-10',
    category: 'Grains & Rice',
    buyerName: 'Priyanka S.',
    status: 'open',
    createdAt: '2026-10-20',
    offers: [
      {
        id: 'off_001',
        seller: MOCK_SELLERS.seller_003,
        price: 680,
        deliveryDays: 4,
        message: 'Namaskara! We harvested Navara rice last week in Mandya. Unpolished, chemical-free.',
        createdAt: '2026-10-21',
        status: 'pending',
      },
    ],
  },
  {
    id: 'req_002',
    title: '10 Litres Wood-Pressed Groundnut Oil in Metal Can',
    description: 'Need pure wood-pressed peanut oil from native seeds. Must not be packed in plastic bottles.',
    quantity: 10,
    unit: 'Litre',
    budgetMax: 2600,
    expectedDate: '2026-11-02',
    category: 'Cold-Pressed Oils',
    buyerName: 'Ramesh K.',
    status: 'open',
    createdAt: '2026-10-19',
    offers: [
      {
        id: 'off_002',
        seller: MOCK_SELLERS.seller_001,
        price: 2450,
        deliveryDays: 3,
        message: 'Can pack in food-grade tin container. Freshly pressed tomorrow.',
        createdAt: '2026-10-20',
        status: 'pending',
      },
    ],
  },
];
