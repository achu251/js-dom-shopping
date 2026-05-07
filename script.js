let Apilink="https://fakestoreapi.com/products/"


setTimeout((Apilink)=>{
    console.log("loading....");
},5000)
let allProducts = [];
  let cart = JSON.parse(localStorage.getItem('shopvault_cart') || '[]');

  // ─── FETCH ───────────────────────────────────────────
  fetch('https://fakestoreapi.com/products/')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      allProducts = data;
      document.getElementById('status').style.display = 'none';
      populateCategories(data);
      displayProducts(data);
    })
    .catch(err => {
      document.getElementById('status').innerHTML =
        '<span class="error-msg">⚠️ Failed to load data. Please try again later.</span>';
    });

  // ─── POPULATE CATEGORIES ─────────────────────────────
  function populateCategories(data) {
    const cats = [...new Set(data.map(p => p.category))];
    const sel = document.getElementById('category-filter');
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      sel.appendChild(opt);
    });
  }

  // ─── DISPLAY PRODUCTS ────────────────────────────────
  function displayProducts(data) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    if (!data.length) {
      grid.innerHTML = '<div class="no-results">No products found matching your search.</div>';
      return;
    }
    data.forEach((p, i) => {
      const title = p.title.length > 50 ? p.title.slice(0, 47) + '…' : p.title;
      const desc = p.description.length > 60 ? p.description.slice(0, 57) + '…' : p.description;
      const inCart = cart.some(c => c.id === p.id);
      const card = document.createElement('div');
      card.className = 'card';
      card.style.animationDelay = (i * 0.05) + 's';
      card.innerHTML = `
        <div class="card-img">
          <img src="${p.image}" alt="${title}" loading="lazy"/>
        </div>
        <div class="card-body">
          <span class="card-category">${p.category}</span>
          <div class="card-title">${title}</div>
          <div class="card-desc">${desc}</div>
          <div class="card-footer">
            <div class="price">$${p.price.toFixed(2)}</div>
            <div class="card-actions">
              <button class="btn-view" onclick='openModal(${JSON.stringify(p).replace(/'/g,"&#39;")})'>Details</button>
              <button class="btn-cart ${inCart ? 'added' : ''}" id="cart-btn-${p.id}"
                onclick='addToCart(${JSON.stringify(p).replace(/'/g,"&#39;")})'>
                ${inCart ? '✓ Added' : '+ Cart'}
              </button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ─── FILTER / SORT ───────────────────────────────────
  function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const sort = document.getElementById('sort-select').value;

    let filtered = allProducts.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(query);
      const matchCat = !category || p.category === category;
      return matchSearch && matchCat;
    });

    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);

    displayProducts(filtered);
  }

  // ─── MODAL ───────────────────────────────────────────
  function openModal(p) {
    const stars = '★'.repeat(Math.round(p.rating?.rate || 0)) + '☆'.repeat(5 - Math.round(p.rating?.rate || 0));
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <span class="card-category">${p.category}</span>
        <button class="close-btn" onclick="closeModalDirect()">✕</button>
      </div>
      <div class="modal-img">
        <img src="${p.image}" alt="${p.title}"/>
      </div>
      <h2>${p.title}</h2>
      <div class="modal-meta">
        <div class="modal-price">$${p.price.toFixed(2)}</div>
        <div class="modal-rating">${stars} (${p.rating?.count || 0} reviews)</div>
      </div>
      <div class="modal-desc">${p.description}</div>
      <button class="btn-cart" style="padding:0.7rem 1.5rem;border-radius:10px;font-size:0.95rem"
        onclick='addToCart(${JSON.stringify(p).replace(/'/g,"&#39;")});'>
        🛒 Add to Cart
      </button>
    `;
    document.getElementById('modal-overlay').classList.add('active');
  }
  function closeModal(e) {
    if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
  }
  function closeModalDirect() {
    document.getElementById('modal-overlay').classList.remove('active');
  }

  // ─── CART ────────────────────────────────────────────
  function addToCart(p) {
    if (!cart.some(c => c.id === p.id)) {
      cart.push(p);
      localStorage.setItem('shopvault_cart', JSON.stringify(cart));
    }
    updateCartUI();
    const btn = document.getElementById('cart-btn-' + p.id);
    if (btn) { btn.textContent = '✓ Added'; btn.classList.add('added'); }
  }

  function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    localStorage.setItem('shopvault_cart', JSON.stringify(cart));
    updateCartUI();
    renderCartDrawer();
    // refresh cards
    filterProducts();
  }

  function updateCartUI() {
    document.getElementById('cart-count').textContent = cart.length;
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    const totalVal = document.getElementById('cart-total-val');
    if (!cart.length) {
      list.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
      totalEl.style.display = 'none';
      return;
    }
    totalEl.style.display = 'block';
    const total = cart.reduce((s, p) => s + p.price, 0);
    totalVal.textContent = '$' + total.toFixed(2);
    list.innerHTML = cart.map(p => `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.title}"/>
        <div class="cart-item-info">
          <div class="cart-item-title">${p.title.slice(0,40)}…</div>
          <div class="cart-item-price">$${p.price.toFixed(2)}</div>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${p.id})">✕</button>
      </div>
    `).join('');
  }

  function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
    renderCartDrawer();
  }

  // init cart count
  updateCartUI();

