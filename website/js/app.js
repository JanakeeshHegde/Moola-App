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

  // Initial Load
  updateAuthHeader();
  loadCategories();
  loadProducts();
});
