/**
 * MOOLA Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentCategory = '';
  let currentSort = 'newest';
  let searchQuery = '';
  let selectedProduct = null;

  const productsGrid = document.getElementById('productsGrid');
  const productsCountEl = document.getElementById('productsCount');
  const categoryScroll = document.getElementById('categoryScroll');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const authModal = document.getElementById('authModal');
  const btnHeaderAuth = document.getElementById('btnHeaderAuth');

  // Fallback high quality food photography placeholders by category
  const FALLBACK_FOOD_IMAGES = {
    chips: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=800&q=80',
    honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    sweets: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    pickles: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  };

  function getProductImage(product) {
    if (product.thumbnailUrl && product.thumbnailUrl.startsWith('http')) {
      return product.thumbnailUrl;
    }
    if (product.images && product.images.length > 0 && product.images[0].startsWith('http')) {
      return product.images[0];
    }
    const cat = (product.categorySlug || product.title || '').toLowerCase();
    if (cat.includes('honey')) return FALLBACK_FOOD_IMAGES.honey;
    if (cat.includes('chip') || cat.includes('snack')) return FALLBACK_FOOD_IMAGES.chips;
    if (cat.includes('sweet') || cat.includes('halwa')) return FALLBACK_FOOD_IMAGES.sweets;
    if (cat.includes('spice') || cat.includes('masala') || cat.includes('powder')) return FALLBACK_FOOD_IMAGES.spices;
    if (cat.includes('pickle') || cat.includes('achar') || cat.includes('chutney')) return FALLBACK_FOOD_IMAGES.pickles;
    return FALLBACK_FOOD_IMAGES.default;
  }

  // Update Auth Button in Header
  function updateAuthHeader() {
    const user = window.moolaApi.getUser();
    if (user && btnHeaderAuth) {
      btnHeaderAuth.textContent = `Hi, ${user.name || 'Maker'} (Logout)`;
      btnHeaderAuth.onclick = () => {
        window.moolaApi.logout();
        updateAuthHeader();
        alert('You have logged out.');
      };
    } else if (btnHeaderAuth) {
      btnHeaderAuth.textContent = 'Customer Login';
      btnHeaderAuth.onclick = () => {
        if (authModal) authModal.classList.add('active');
      };
    }
  }

  // Load Categories
  async function loadCategories() {
    try {
      const res = await window.moolaApi.getCategories();
      if (res && res.success && res.data && res.data.categories) {
        renderCategories(res.data.categories);
      }
    } catch (e) {
      console.warn('Using default categories');
      const defaultCategories = [
        { id: '', name: 'All Homemade' },
        { id: 'cat-chips', name: 'Chips & Snacks' },
        { id: 'cat-honey', name: 'Wild Forest Honey' },
        { id: 'cat-sweets', name: 'Traditional Sweets' },
        { id: 'cat-spices', name: 'Artisanal Spices' },
        { id: 'cat-pickles', name: 'Heritage Pickles' }
      ];
      renderCategories(defaultCategories);
    }
  }

  function renderCategories(categories) {
    if (!categoryScroll) return;
    categoryScroll.innerHTML = '';

    const allPill = document.createElement('button');
    allPill.className = `category-pill ${currentCategory === '' ? 'active' : ''}`;
    allPill.textContent = 'All Homemade';
    allPill.onclick = () => {
      currentCategory = '';
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      allPill.classList.add('active');
      loadProducts();
    };
    categoryScroll.appendChild(allPill);

    categories.forEach(cat => {
      if (!cat.id) return;
      const pill = document.createElement('button');
      pill.className = `category-pill ${currentCategory === cat.id ? 'active' : ''}`;
      pill.textContent = cat.name;
      pill.onclick = () => {
        currentCategory = cat.id;
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        loadProducts();
      };
      categoryScroll.appendChild(pill);
    });
  }

  // Load Products
  async function loadProducts() {
    if (productsGrid) {
      productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #5A6065;">Loading authentic homemade food products...</div>';
    }

    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (currentCategory) params.category = currentCategory;
      if (currentSort) params.sort = currentSort;

      const res = await window.moolaApi.getProducts(params);
      const items = (res && res.data && (res.data.products || res.data.data)) || [];
      if (res && res.success && items.length > 0) {
        renderProducts(items);
      } else {
        renderEmpty();
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
      renderEmpty('Unable to reach server. Please ensure the backend is running on port 5000.');
    }
  }

  function renderEmpty(message = 'No authentic homemade products match your search or filter.') {
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #FFFFFF; border-radius: 12px; border: 1px dashed #E6DFC6;">
          <h3 style="color: #1E3F20; margin-bottom: 8px;">No Listings Found</h3>
          <p style="color: #5A6065; font-size: 0.95rem;">${message}</p>
        </div>`;
    }
    if (productsCountEl) productsCountEl.textContent = '0 authentic products available';
  }

  function renderProducts(products) {
    if (!products || products.length === 0) {
      renderEmpty();
      return;
    }

    if (productsCountEl) {
      productsCountEl.textContent = `${products.length} authentic homemade items available`;
    }

    productsGrid.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      const imgUrl = getProductImage(p);
      const sellerName = p.sellerShopName || p.sellerName || 'Verified Artisan Maker';

      card.innerHTML = `
        <div class="product-image-wrapper">
          <img src="${imgUrl}" alt="${p.title}" class="product-image" loading="lazy" onerror="this.src='${FALLBACK_FOOD_IMAGES.default}'" />
          ${p.isOrganic ? '<span class="product-badge-organic">100% Homemade</span>' : ''}
          ${p.originRegion ? `<span class="product-badge-origin">${p.originRegion}</span>` : ''}
        </div>
        <div class="product-info">
          <div class="product-maker">${sellerName}</div>
          <h3 class="product-title">${p.title}</h3>
          ${p.titleKn ? `<div class="product-title-kn">${p.titleKn}</div>` : ''}
          <div class="product-pricing">
            <div class="price-group">
              <span class="current-price">₹${Math.round(p.price)}</span>
              <span class="unit-label">/ ${p.unit || 'unit'}</span>
              ${p.mrp && p.mrp > p.price ? `<span class="mrp-price">₹${Math.round(p.mrp)}</span>` : ''}
            </div>
            <button class="btn-card-action">View Batch</button>
          </div>
        </div>
      `;

      card.onclick = () => openProductModal(p);
      productsGrid.appendChild(card);
    });
  }

  // Open Product Modal
  function openProductModal(p) {
    selectedProduct = p;
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalTitleKn = document.getElementById('modalTitleKn');
    const modalPrice = document.getElementById('modalPrice');
    const modalUnit = document.getElementById('modalUnit');
    const modalMaker = document.getElementById('modalMaker');
    const modalDesc = document.getElementById('modalDesc');
    const modalIngredients = document.getElementById('modalIngredients');
    const btnWhatsApp = document.getElementById('btnWhatsApp');
    const orderForm = document.getElementById('orderForm');

    if (modalImage) modalImage.src = getProductImage(p);
    if (modalTitle) modalTitle.textContent = p.title;
    if (modalTitleKn) modalTitleKn.textContent = p.titleKn || '';
    if (modalPrice) modalPrice.textContent = `₹${Math.round(p.price)}`;
    if (modalUnit) modalUnit.textContent = `per ${p.unit || 'unit'}`;
    if (modalMaker) modalMaker.textContent = p.sellerShopName || p.sellerName || 'Artisan Food Maker';
    if (modalDesc) modalDesc.textContent = p.description || 'Small-batch, artisanal preparation made using traditional regional recipes without artificial preservatives.';

    if (modalIngredients) {
      if (p.ingredients && p.ingredients.length > 0) {
        modalIngredients.innerHTML = `<strong>Pure Ingredients:</strong> ${p.ingredients.join(', ')}`;
        modalIngredients.style.display = 'block';
      } else {
        modalIngredients.style.display = 'none';
      }
    }

    // Direct WhatsApp Enquiry button
    if (btnWhatsApp) {
      btnWhatsApp.onclick = async () => {
        const phone = p.sellerPhone || '918088653820';
        const text = encodeURIComponent(`Namaskara! I am interested in ordering "${p.title}" (₹${p.price}/${p.unit || 'unit'}) on MOOLA. Is a fresh batch currently ready for dispatch?`);
        
        // Log enquiry to backend
        try {
          await window.moolaApi.createWhatsAppEnquiry({
            productId: p.id,
            productName: p.title,
            sellerId: p.sellerId,
            message: `Customer viewed batch on website and tapped WhatsApp enquiry.`
          });
        } catch (e) {
          console.warn('Enquiry logging notice:', e.message);
        }

        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
      };
    }

    // Direct Order Form Submission
    if (orderForm) {
      orderForm.onsubmit = async (e) => {
        e.preventDefault();
        const qty = parseInt(document.getElementById('orderQty').value, 10) || 1;
        const buyerName = document.getElementById('buyerName').value.trim();
        const buyerPhone = document.getElementById('buyerPhone').value.trim();
        const address = document.getElementById('buyerAddress').value.trim();

        if (!buyerName || !buyerPhone || !address) {
          alert('Please provide your name, phone number, and delivery address.');
          return;
        }

        const submitBtn = orderForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';

        try {
          const res = await window.moolaApi.requestOrder({
            productId: p.id,
            quantity: qty,
            deliveryAddress: `${buyerName}, Ph: ${buyerPhone}, Address: ${address}`
          });

          if (res && res.success) {
            alert(`Order #${res.data.orderNumber || res.data.id} placed successfully! The artisan maker has been notified to pack your fresh batch.`);
            closeProductModal();
          } else {
            alert('Could not submit order: ' + ((res && res.message) || 'Unknown error'));
          }
        } catch (err) {
          alert('Failed to submit order request: ' + err.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Order Request';
        }
      };
    }

    if (productModal) productModal.classList.add('active');
  }

  function closeProductModal() {
    if (productModal) productModal.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.onclick = closeProductModal;
  if (productModal) {
    productModal.onclick = (e) => {
      if (e.target === productModal) closeProductModal();
    };
  }

  // Live Search with Debounce
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        loadProducts();
      }, 350);
    });
  }

  // Sort changes
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadProducts();
    });
  }

  // Auth Modal Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const phone = document.getElementById('authPhone').value.trim();
      const password = document.getElementById('authPassword').value;

      try {
        const res = await window.moolaApi.login(phone, password);
        if (res && res.success) {
          alert('Login successful!');
          if (authModal) authModal.classList.remove('active');
          updateAuthHeader();
        }
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    };
  }

  const closeAuthBtn = document.getElementById('closeAuthBtn');
  if (closeAuthBtn) {
    closeAuthBtn.onclick = () => {
      if (authModal) authModal.classList.remove('active');
    };
  }

  // ==========================================
  // SOCIAL MARKETPLACE: ARTISAN MAKERS & SHOPS
  // ==========================================
  const sellerShopModal = document.getElementById('sellerShopModal');
  const closeShopBtn = document.getElementById('closeShopBtn');
  const btnShopFollow = document.getElementById('btnShopFollow');
  let currentShopSellerId = null;
  let currentShopIsFollowing = false;

  const ARTISAN_MAKERS = [
    { id: 'seller-1', name: 'Lakshmi Amma', shopName: 'Kaveri Naturals Coorg', specialty: 'Wild Forest Raw Honey & Spices', location: 'Western Ghats, Coorg', followers: 142 },
    { id: 'seller-2', name: 'Shankaran Nambiar', shopName: 'Malnad Heritage Kitchen', specialty: 'Sun-dried Jackfruit & Banana Crisps', location: 'Udupi Village Kitchen', followers: 238 },
    { id: 'seller-3', name: 'Anasuya Devi', shopName: 'Anasuya Traditional Foods', specialty: 'Ceramic-aged Avakaya & Mango Pickles', location: 'Coastal Karnataka', followers: 189 },
    { id: 'seller-4', name: 'Venkatesh Bhat', shopName: 'Udupi Heritage Sweets', specialty: 'Pure Ghee Mysore Pak & Traditional Sweets', location: 'South Canara', followers: 312 }
  ];

  async function initMakersShowcase() {
    const makersScroll = document.getElementById('makersScroll');
    if (!makersScroll) return;

    try {
      const res = await window.moolaApi.getPublicSellers();
      if (res && res.success && res.data && res.data.length > 0) {
        makersScroll.innerHTML = '';
        res.data.forEach(maker => {
          const card = document.createElement('div');
          card.className = 'category-pill';
          card.style.display = 'inline-flex';
          card.style.flexDirection = 'column';
          card.style.alignItems = 'flex-start';
          card.style.padding = '12px 18px';
          card.style.borderRadius = '12px';
          card.style.cursor = 'pointer';
          card.style.background = '#FFFFFF';
          card.style.border = '1px solid #E2D9CC';
          card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
          card.style.minWidth = '240px';

          const verifiedBadge = maker.isVerified ? '<span style="background:#2C5E3B; color:#fff; font-size:0.65rem; padding:1px 5px; border-radius:10px;">★ Verified Maker</span>' : '';
          const ratingText = maker.averageRating ? `★ ${maker.averageRating.toFixed(1)}` : '★ 4.8';

          card.innerHTML = `
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; width:100%;">
              <span style="font-weight:700; color:#1E3F20; font-size:0.95rem;">${maker.shopName}</span>
              ${verifiedBadge}
            </div>
            <div style="font-size:0.75rem; color:#8C939A; margin-bottom:4px;">${maker.slug || '@maker'}</div>
            <div style="font-size:0.8rem; color:#5A6065; margin-bottom:6px; line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${maker.description || 'Authentic small-batch homemade food.'}</div>
            <div style="font-size:0.75rem; color:#8C939A;">${ratingText} • <strong style="color:#2C5E3B;">${maker.followerCount} followers</strong></div>
          `;

          card.onclick = () => openSellerShop(maker.sellerId);
          makersScroll.appendChild(card);
        });
        return;
      }
    } catch (e) {
      console.warn('Could not fetch makers from API, using fallback', e);
    }

    // Fallback if offline or empty
    makersScroll.innerHTML = '';
    ARTISAN_MAKERS.forEach(maker => {
      const card = document.createElement('div');
      card.className = 'category-pill';
      card.style.display = 'inline-flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'flex-start';
      card.style.padding = '12px 18px';
      card.style.borderRadius = '12px';
      card.style.cursor = 'pointer';
      card.style.background = '#FFFFFF';
      card.style.border = '1px solid #E2D9CC';
      card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
      card.style.minWidth = '220px';

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="font-weight:700; color:#1E3F20; font-size:0.95rem;">${maker.shopName}</span>
          <span style="background:#2C5E3B; color:#fff; font-size:0.65rem; padding:1px 5px; border-radius:10px;">★ Verified</span>
        </div>
        <div style="font-size:0.8rem; color:#5A6065; margin-bottom:4px;">${maker.specialty}</div>
        <div style="font-size:0.75rem; color:#8C939A;">${maker.location} • <strong style="color:#2C5E3B;">${maker.followers} followers</strong></div>
      `;

      card.onclick = () => openSellerShop(maker.id, maker);
      makersScroll.appendChild(card);
    });
  }

  async function openSellerShop(sellerId, fallbackData) {
    currentShopSellerId = sellerId;
    if (!sellerShopModal) return;

    const shopNameEl = document.getElementById('shopModalName');
    const shopDescEl = document.getElementById('shopModalDesc');
    const shopFollowersEl = document.getElementById('shopModalFollowers');
    const shopProductsGrid = document.getElementById('shopModalProducts');
    const btnShopShare = document.getElementById('btnShopShare');

    if (btnShopShare) {
      btnShopShare.onclick = () => {
        const shareUrl = `${window.location.origin}/?shop=${sellerId}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Public shop link copied to clipboard:\n${shareUrl}`);
          }).catch(() => {
            prompt('Copy public shop URL:', shareUrl);
          });
        } else {
          prompt('Copy public shop URL:', shareUrl);
        }
      };
    }

    shopProductsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px; color:#8C939A;">Loading maker batches...</p>';
    sellerShopModal.classList.add('active');

    try {
      const res = await window.moolaApi.getSellerShop(sellerId);
      if (res && res.success && res.data) {
        const shop = res.data;
        shopNameEl.textContent = (shop.profile && shop.profile.shopName) || shop.sellerName || 'Artisan Maker';
        shopDescEl.textContent = (shop.profile && shop.profile.description) || 'Authentic regional homemade delicacies prepared fresh upon order placement.';
        shopFollowersEl.textContent = shop.followerCount || (fallbackData ? fallbackData.followers : '0');
        currentShopIsFollowing = shop.isFollowing || false;
        updateShopFollowButton();

        shopProductsGrid.innerHTML = '';
        if (shop.products && shop.products.length > 0) {
          shop.products.forEach(p => {
            const item = document.createElement('div');
            item.className = 'product-card';
            item.innerHTML = `
              <div class="product-image-wrap">
                <img src="${getProductImage(p)}" alt="${p.name ? p.name.en : 'Food'}" class="product-thumb">
              </div>
              <div class="product-body" style="padding:10px;">
                <h4 style="font-size:0.88rem; margin:0 0 4px 0; color:#1E3F20;">${p.name ? p.name.en : 'Item'}</h4>
                <div style="font-weight:700; color:#1E3F20; font-size:0.92rem;">₹${p.price} <span style="font-weight:normal; font-size:0.75rem; color:#8C939A;">/ ${p.unit}</span></div>
              </div>
            `;
            item.onclick = () => {
              sellerShopModal.classList.remove('active');
              openProductModal(p);
            };
            shopProductsGrid.appendChild(item);
          });
        } else {
          shopProductsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px; color:#8C939A;">No active batches right now.</p>';
        }
      }
    } catch (e) {
      if (fallbackData) {
        shopNameEl.textContent = fallbackData.shopName;
        shopDescEl.textContent = `Home kitchen of ${fallbackData.name} located in ${fallbackData.location}. Specialises in authentic ${fallbackData.specialty}.`;
        shopFollowersEl.textContent = fallbackData.followers;
        updateShopFollowButton();
      }
      shopProductsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px; color:#8C939A;">Viewing artisan maker catalogue.</p>';
    }
  }

  function updateShopFollowButton() {
    if (!btnShopFollow) return;
    if (currentShopIsFollowing) {
      btnShopFollow.textContent = '✓ Following';
      btnShopFollow.style.background = '#E8EFE9';
      btnShopFollow.style.color = '#2C5E3B';
      btnShopFollow.style.border = '1px solid #2C5E3B';
    } else {
      btnShopFollow.textContent = '+ Follow Maker';
      btnShopFollow.style.background = '#2C5E3B';
      btnShopFollow.style.color = '#FFFFFF';
      btnShopFollow.style.border = 'none';
    }
  }

  if (btnShopFollow) {
    btnShopFollow.onclick = async () => {
      const user = window.moolaApi.getUser();
      if (!user) {
        alert('Please login as a customer to follow artisanal makers.');
        if (authModal) authModal.classList.add('active');
        return;
      }
      if (!currentShopSellerId) return;

      try {
        if (currentShopIsFollowing) {
          const res = await window.moolaApi.unfollowSeller(currentShopSellerId);
          currentShopIsFollowing = false;
          if (res && res.data && res.data.followerCount !== undefined) {
            document.getElementById('shopModalFollowers').textContent = res.data.followerCount;
          }
        } else {
          const res = await window.moolaApi.followSeller(currentShopSellerId);
          currentShopIsFollowing = true;
          if (res && res.data && res.data.followerCount !== undefined) {
            document.getElementById('shopModalFollowers').textContent = res.data.followerCount;
          }
        }
        updateShopFollowButton();
      } catch (err) {
        alert(err.message || 'Follow action failed');
      }
    };
  }

  if (closeShopBtn) {
    closeShopBtn.onclick = () => {
      if (sellerShopModal) sellerShopModal.classList.remove('active');
    };
  }

  // ==========================================
  // BUYER DEMAND POSTS (REVERSE MARKETPLACE)
  // ==========================================
  const demandPostModal = document.getElementById('demandPostModal');
  const btnHeaderDemand = document.getElementById('btnHeaderDemand');
  const btnHeroDemand = document.getElementById('btnHeroDemand');
  const closeDemandBtn = document.getElementById('closeDemandBtn');
  const demandPostForm = document.getElementById('demandPostForm');

  function openDemandModal() {
    const user = window.moolaApi.getUser();
    if (!user) {
      alert('Please sign in or register to post your custom product requirement.');
      if (authModal) authModal.classList.add('active');
      return;
    }
    if (demandPostModal) demandPostModal.classList.add('active');
  }

  if (btnHeaderDemand) btnHeaderDemand.onclick = openDemandModal;
  if (btnHeroDemand) btnHeroDemand.onclick = openDemandModal;
  if (closeDemandBtn) {
    closeDemandBtn.onclick = () => {
      if (demandPostModal) demandPostModal.classList.remove('active');
    };
  }

  if (demandPostForm) {
    demandPostForm.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById('demandTitle').value.trim();
      const qty = parseFloat(document.getElementById('demandQty').value);
      const unit = document.getElementById('demandUnit').value.trim();
      const budget = parseFloat(document.getElementById('demandBudget').value) || null;
      const deliveryLocation = document.getElementById('demandLocation').value.trim();
      const description = document.getElementById('demandDescription').value.trim();

      const payload = {
        title,
        quantity: qty,
        unit,
        budget,
        deliveryLocation,
        description
      };

      try {
        const res = await window.moolaApi.createDemandPost(payload);
        if (res && res.success) {
          alert('Success! Your product requirement has been published to all eligible artisanal makers. You will receive notifications when sellers submit offers.');
          demandPostForm.reset();
          if (demandPostModal) demandPostModal.classList.remove('active');
          loadUnreadNotifications();
        }
      } catch (err) {
        alert('Could not publish requirement: ' + err.message);
      }
    };
  }

  // ==========================================
  // NOTIFICATION CENTRE
  // ==========================================
  const notificationsModal = document.getElementById('notificationsModal');
  const btnHeaderNotifications = document.getElementById('btnHeaderNotifications');
  const notificationBadge = document.getElementById('notificationBadge');
  const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const notificationsList = document.getElementById('notificationsList');

  async function loadUnreadNotifications() {
    const token = window.moolaApi.getToken();
    if (!token || !notificationBadge) return;

    try {
      const res = await window.moolaApi.getUnreadNotificationCount();
      if (res && res.success && res.data && res.data.unreadCount !== undefined) {
        const count = res.data.unreadCount;
        if (count > 0) {
          notificationBadge.textContent = count > 99 ? '99+' : count;
          notificationBadge.style.display = 'block';
        } else {
          notificationBadge.style.display = 'none';
        }
      }
    } catch (e) {
      notificationBadge.style.display = 'none';
    }
  }

  async function openNotificationsModal() {
    const user = window.moolaApi.getUser();
    if (!user) {
      if (authModal) authModal.classList.add('active');
      return;
    }
    if (!notificationsModal || !notificationsList) return;
    notificationsModal.classList.add('active');
    notificationsList.innerHTML = '<p style="text-align:center; color:#8C939A; font-size:0.88rem; padding:20px 0;">Loading alerts...</p>';

    try {
      const res = await window.moolaApi.getNotifications();
      if (res && res.success && res.data) {
        const list = res.data;
        if (list.length === 0) {
          notificationsList.innerHTML = '<p style="text-align:center; color:#8C939A; font-size:0.88rem; padding:30px 0;">No notifications yet.</p>';
          return;
        }

        notificationsList.innerHTML = '';
        list.forEach(n => {
          const item = document.createElement('div');
          item.style.padding = '12px 14px';
          item.style.borderBottom = '1px solid #F0EAE1';
          item.style.background = n.read ? '#FFFFFF' : '#F9F6F0';
          item.style.borderRadius = '8px';
          item.style.marginBottom = '6px';
          item.style.cursor = 'pointer';

          const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
          
          item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:700; font-size:0.88rem; color:#1E3F20;">${n.title || 'Notification'}</span>
              <span style="font-size:0.75rem; color:#8C939A;">${timeStr}</span>
            </div>
            <p style="font-size:0.82rem; color:#5A6065; margin:0;">${n.message || ''}</p>
          `;

          item.onclick = async () => {
            if (!n.read) {
              await window.moolaApi.markNotificationRead(n.id).catch(() => {});
              n.read = true;
              item.style.background = '#FFFFFF';
              loadUnreadNotifications();
            }
          };

          notificationsList.appendChild(item);
        });
      }
    } catch (err) {
      notificationsList.innerHTML = '<p style="text-align:center; color:#C84B31; font-size:0.85rem; padding:20px 0;">Failed to load notifications</p>';
    }
  }

  if (btnHeaderNotifications) btnHeaderNotifications.onclick = openNotificationsModal;
  if (closeNotificationsBtn) {
    closeNotificationsBtn.onclick = () => {
      if (notificationsModal) notificationsModal.classList.remove('active');
    };
  }

  if (btnMarkAllRead) {
    btnMarkAllRead.onclick = async () => {
      try {
        await window.moolaApi.markAllNotificationsRead();
        if (notificationBadge) notificationBadge.style.display = 'none';
        openNotificationsModal();
      } catch (err) {
        alert('Could not mark all as read: ' + err.message);
      }
    };
  }

  // ==========================================
  // Built-in Social Messenger System
  // ==========================================
  const btnHeaderMessages = document.getElementById('btnHeaderMessages');
  const chatBadge = document.getElementById('chatBadge');
  const btnShopChat = document.getElementById('btnShopChat');
  const messengerModal = document.getElementById('messengerModal');
  const closeMessengerBtn = document.getElementById('closeMessengerBtn');
  const messengerSearch = document.getElementById('messengerSearch');
  const messengerConversationsList = document.getElementById('messengerConversationsList');
  const chatPartnerAvatar = document.getElementById('chatPartnerAvatar');
  const chatPartnerName = document.getElementById('chatPartnerName');
  const chatContextBadge = document.getElementById('chatContextBadge');
  const chatMessagesList = document.getElementById('chatMessagesList');
  const chatComposerForm = document.getElementById('chatComposerForm');
  const chatMessageInput = document.getElementById('chatMessageInput');
  const btnSendChatMessage = document.getElementById('btnSendChatMessage');

  let currentConversationId = null;
  let allConversations = [];
  let chatPollTimer = null;

  async function loadUnreadChatCount() {
    const user = window.moolaApi.getUser();
    if (!user || !chatBadge) return;
    try {
      const res = await window.moolaApi.getUnreadChatCount();
      if (res && res.success && res.data && res.data.unreadCount > 0) {
        chatBadge.textContent = res.data.unreadCount > 99 ? '99+' : res.data.unreadCount;
        chatBadge.style.display = 'inline-block';
      } else {
        chatBadge.style.display = 'none';
      }
    } catch (e) {
      // Ignore background poll errors
    }
  }

  async function openMessengerModal(targetParticipantId = null, contextData = {}) {
    const user = window.moolaApi.getUser();
    if (!user) {
      alert('Please log in to chat with artisanal makers and buyers.');
      if (authModal) authModal.classList.add('active');
      return;
    }

    if (!messengerModal) return;
    messengerModal.classList.add('active');

    // If starting chat with a specific maker/user
    if (targetParticipantId) {
      try {
        const body = {
          participantId: targetParticipantId,
          ...contextData,
        };
        const res = await window.moolaApi.startConversation(body);
        if (res && res.success && res.data) {
          await loadConversationsList(res.data.id);
          selectConversation(res.data);
          return;
        }
      } catch (err) {
        console.warn('Failed to start conversation directly:', err);
      }
    }

    await loadConversationsList();
  }

  async function loadConversationsList(selectId = null) {
    if (!messengerConversationsList) return;
    messengerConversationsList.innerHTML = '<p style="text-align:center; color:#8C939A; font-size:0.85rem; padding:24px 12px;">Loading messages...</p>';

    try {
      const res = await window.moolaApi.getConversations();
      if (res && res.success && res.data) {
        allConversations = res.data;
        renderConversations(allConversations);

        if (selectId) {
          const matched = allConversations.find(c => c.id === selectId);
          if (matched) selectConversation(matched);
        } else if (allConversations.length > 0 && !currentConversationId) {
          selectConversation(allConversations[0]);
        }
      }
    } catch (err) {
      messengerConversationsList.innerHTML = '<p style="text-align:center; color:#C84B31; font-size:0.85rem; padding:24px 12px;">Failed to load messages</p>';
    }
  }

  function renderConversations(list) {
    if (!messengerConversationsList) return;
    if (list.length === 0) {
      messengerConversationsList.innerHTML = '<p style="text-align:center; color:#8C939A; font-size:0.85rem; padding:30px 12px;">No conversations yet.<br>Start a chat from any maker shop or listing.</p>';
      return;
    }

    const user = window.moolaApi.getUser();
    const currentUserId = user ? user.id : '';

    messengerConversationsList.innerHTML = '';
    list.forEach(c => {
      const item = document.createElement('div');
      item.style.padding = '12px 14px';
      item.style.borderBottom = '1px solid #EBE4DA';
      item.style.cursor = 'pointer';
      item.style.display = 'flex';
      item.style.gap = '10px';
      item.style.alignItems = 'center';
      item.style.background = (currentConversationId === c.id) ? '#F2EDE4' : '#FAF7F2';
      item.style.transition = 'background 0.15s ease';

      // Title logic based on role
      let displayName = 'Maker Conversation';
      if (c.sellerShopName) {
        displayName = c.sellerShopName;
      } else if (c.sellerId === currentUserId) {
        displayName = c.buyerName || 'Customer';
      } else {
        displayName = c.sellerName || 'Artisan Maker';
      }

      const initial = displayName.charAt(0).toUpperCase();
      const unread = (currentUserId === c.sellerId) ? (c.sellerUnreadCount || 0) : (c.buyerUnreadCount || 0);

      item.innerHTML = `
        <div style="width:36px; height:36px; border-radius:50%; background:#2C5E3B; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.85rem; flex-shrink:0;">
          ${initial}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:700; font-size:0.88rem; color:#1E3F20; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName}</div>
            ${unread > 0 ? `<span style="background:#C84B31; color:#fff; font-size:0.68rem; font-weight:700; border-radius:10px; padding:1px 6px;">${unread}</span>` : ''}
          </div>
          <div style="font-size:0.78rem; color:#5A6065; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">
            ${c.lastMessage || 'Start conversation...'}
          </div>
        </div>
      `;

      item.onclick = () => selectConversation(c);
      messengerConversationsList.appendChild(item);
    });
  }

  function selectConversation(c) {
    currentConversationId = c.id;
    const user = window.moolaApi.getUser();
    const currentUserId = user ? user.id : '';

    let displayName = 'Maker';
    if (c.sellerShopName) {
      displayName = c.sellerShopName;
    } else if (c.sellerId === currentUserId) {
      displayName = c.buyerName || 'Customer';
    } else {
      displayName = c.sellerName || 'Maker';
    }

    if (chatPartnerName) chatPartnerName.textContent = displayName;
    if (chatPartnerAvatar) chatPartnerAvatar.textContent = displayName.charAt(0).toUpperCase();

    if (chatContextBadge) {
      if (c.orderId) {
        chatContextBadge.textContent = `Order #${c.orderId.substring(0, 8)}`;
      } else if (c.productName) {
        chatContextBadge.textContent = `Ref: ${c.productName}`;
      } else if (c.customRequestTitle) {
        chatContextBadge.textContent = `Demand: ${c.customRequestTitle}`;
      } else {
        chatContextBadge.textContent = '';
      }
    }

    if (chatMessageInput) chatMessageInput.disabled = false;
    if (btnSendChatMessage) btnSendChatMessage.disabled = false;

    // Highlight selected item in list
    renderConversations(allConversations);

    // Load messages
    loadActiveMessages(true);

    // Mark as read
    window.moolaApi.markConversationRead(c.id).catch(() => {});
    loadUnreadChatCount();

    // Start polling active conversation every 3.5 seconds
    if (chatPollTimer) clearInterval(chatPollTimer);
    chatPollTimer = setInterval(() => {
      if (messengerModal && messengerModal.classList.contains('active') && currentConversationId) {
        loadActiveMessages(false);
      }
    }, 3500);
  }

  async function loadActiveMessages(showLoading = false) {
    if (!currentConversationId || !chatMessagesList) return;
    if (showLoading) {
      chatMessagesList.innerHTML = '<div style="text-align:center; color:#8C939A; font-size:0.85rem; margin:auto;">Loading messages...</div>';
    }

    try {
      const res = await window.moolaApi.getMessages(currentConversationId);
      if (res && res.success && res.data) {
        const messages = res.data;
        const user = window.moolaApi.getUser();
        const currentUserId = user ? user.id : '';

        if (messages.length === 0) {
          chatMessagesList.innerHTML = '<div style="text-align:center; color:#8C939A; font-size:0.85rem; margin:auto;">No messages yet. Send a greeting to begin chatting.</div>';
          return;
        }

        chatMessagesList.innerHTML = '';
        messages.forEach(msg => {
          const isMe = (msg.senderId === currentUserId);
          const bubble = document.createElement('div');
          bubble.style.display = 'flex';
          bubble.style.flexDirection = 'column';
          bubble.style.alignItems = isMe ? 'flex-end' : 'flex-start';

          const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

          bubble.innerHTML = `
            <div style="max-width:70%; padding:10px 14px; border-radius:${isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px'}; background:${isMe ? '#2C5E3B' : '#EFEBE4'}; color:${isMe ? '#FFFFFF' : '#1E3F20'}; font-size:0.88rem; line-height:1.4; word-break:break-word; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
              ${msg.content}
            </div>
            <div style="font-size:0.68rem; color:#8C939A; margin-top:2px; padding:0 4px;">
              ${timeStr} ${isMe && msg.read ? '✓✓' : ''}
            </div>
          `;
          chatMessagesList.appendChild(bubble);
        });

        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
      }
    } catch (err) {
      // Ignore background fetch error
    }
  }

  if (chatComposerForm) {
    chatComposerForm.onsubmit = async (e) => {
      e.preventDefault();
      if (!currentConversationId || !chatMessageInput) return;
      const content = chatMessageInput.value.trim();
      if (!content) return;

      chatMessageInput.value = '';
      try {
        const res = await window.moolaApi.sendMessage(currentConversationId, { content });
        if (res && res.success) {
          loadActiveMessages(false);
          loadConversationsList();
        }
      } catch (err) {
        alert('Failed to send message: ' + err.message);
      }
    };
  }

  if (messengerSearch) {
    messengerSearch.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderConversations(allConversations);
      } else {
        const filtered = allConversations.filter(c => {
          const name = (c.sellerShopName || c.sellerName || c.buyerName || '').toLowerCase();
          const last = (c.lastMessage || '').toLowerCase();
          return name.includes(q) || last.includes(q);
        });
        renderConversations(filtered);
      }
    };
  }

  if (btnHeaderMessages) {
    btnHeaderMessages.onclick = () => openMessengerModal();
  }

  if (closeMessengerBtn) {
    closeMessengerBtn.onclick = () => {
      if (messengerModal) messengerModal.classList.remove('active');
      if (chatPollTimer) clearInterval(chatPollTimer);
    };
  }

  if (btnShopChat) {
    btnShopChat.onclick = () => {
      if (sellerShopModal) sellerShopModal.classList.remove('active');
      openMessengerModal(currentShopSellerId, {
        productName: shopNameEl ? shopNameEl.textContent : 'Artisan Products'
      });
    };
  }

  // Initial Load
  updateAuthHeader();
  loadCategories();
  initMakersShowcase();
  loadProducts();
  loadUnreadNotifications();
  loadUnreadChatCount();

  // Handle direct shared shop links (e.g. /?shop=SELLER_ID or /#shop/SELLER_ID)
  const urlParams = new URLSearchParams(window.location.search);
  const directShopId = urlParams.get('shop') || urlParams.get('seller') || (window.location.hash.startsWith('#shop/') ? window.location.hash.replace('#shop/', '') : null);
  if (directShopId) {
    setTimeout(() => {
      openSellerShop(directShopId);
    }, 400);
  }

  // Periodic unread counters check every 15s
  setInterval(() => {
    loadUnreadNotifications();
    loadUnreadChatCount();
  }, 15000);
});

