// Wait until the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1️⃣ HOME PAGE - Show Products
  // ==========================================
  const productsGrid = document.querySelector('#products .products-grid');
  if (productsGrid) {
    let allProducts = [];

    // Function to fetch products from API
    function fetchProducts() {
      fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(products => {
          allProducts = products;
          renderProducts(products);
        });
    }

    // Function to render products in the grid
    function renderProducts(list) {
      productsGrid.innerHTML = '';

      if (list.length === 0) {
        productsGrid.innerHTML = '<p>No products found.</p>';
        return;
      }

      list.forEach(product => {
        const productBox = document.createElement('div');
        productBox.classList.add('product-box');

        // Check if product is already in favorites
        const favs = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFav = favs.some(p => p.id === product.id);

        // HTML structure for product box
        productBox.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p class="price"><strong>Price:</strong> $${product.price}</p>
          <p class="category"><strong>Category:</strong> ${product.category}</p>
          <div class="product-actions">
            <button class="fav-btn ${isFav ? 'active' : ''}">
              <i class="fa${isFav ? 's' : 'r'} fa-star"></i>
              ${isFav ? 'Favorited' : 'Add to Fav'}
            </button>
            <button class="cart-btn">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        `;

        // ⭐ Favorite button logic
        const favBtn = productBox.querySelector('.fav-btn');
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent redirect to product page
          let favs = JSON.parse(localStorage.getItem('favorites')) || [];

          if (favs.some(p => p.id === product.id)) {
            // Remove from favorites
            favs = favs.filter(p => p.id !== product.id);
            favBtn.classList.remove('active');
            favBtn.innerHTML = `<i class="far fa-star"></i> Add to Fav`;
          } else {
            // Add to favorites
            favs.push(product);
            favBtn.classList.add('active');
            favBtn.innerHTML = `<i class="fas fa-star"></i> Favorited`;
          }
          localStorage.setItem('favorites', JSON.stringify(favs));
        });

        // 🛒 Add to cart button logic
        const cartBtn = productBox.querySelector('.cart-btn');
        cartBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          addProductToCart(product);
          alert(`${product.title} added to cart!`);
        });

        // 🔗 Clicking the product redirects to product.html page
        productBox.addEventListener('click', () => {
          window.location.href = `product.html?id=${product.id}`;
        });

        productsGrid.appendChild(productBox);
      });
    }

    // Fetch products when on home page
    fetchProducts();
  }

  // ==========================================
  // 2️⃣ FAVORITES PAGE
  // ==========================================
  const favoritesGrid = document.querySelector('.favorites-grid');
  const addAllBtn = document.getElementById('add-all-to-cart');
  if (favoritesGrid && addAllBtn) {
    
    function renderFavorites() {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favoritesGrid.innerHTML = '';

      if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<p>No favourites yet.</p>';
        addAllBtn.style.display = 'none';
        return;
      }

      favorites.forEach(product => {
        const favBox = document.createElement('div');
        favBox.classList.add('product-box');
        favBox.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p class="price"><strong>Price:</strong> $${product.price}</p>
          <p class="category"><strong>Category:</strong> ${product.category}</p>
          <div class="product-actions">
            <button class="remove-btn">❌ Remove</button>
            <button class="cart-btn">🛒 Add to Cart</button>
          </div>
        `;

        // Remove product from favorites
        favBox.querySelector('.remove-btn').addEventListener('click', () => {
          let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
          favorites = favorites.filter(fav => fav.id !== product.id);
          localStorage.setItem('favorites', JSON.stringify(favorites));
          renderFavorites();
        });

        // Add product to cart
        favBox.querySelector('.cart-btn').addEventListener('click', () => {
          addProductToCart(product);
          alert(`${product.title} added to cart!`);
        });

        favoritesGrid.appendChild(favBox);
      });

      addAllBtn.style.display = 'block';
    }

    // Add all favorites to cart
    addAllBtn.addEventListener('click', () => {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites.forEach(product => addProductToCart(product));
      alert("All favourites added to cart!");
    });

    renderFavorites();
  }

  // ==========================================
  // 3️⃣ CART PAGE
  // ==========================================
  const cartGrid = document.querySelector('.cart-grid');
  const totalPriceEl = document.getElementById('total-price');
  if (cartGrid && totalPriceEl) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Render cart items
    function renderCart() {
      cartGrid.innerHTML = '';

      if (cart.length === 0) {
        cartGrid.innerHTML = '<p>Your cart is empty.</p>';
        totalPriceEl.textContent = '0.00';
        return;
      }

      cart.forEach((product, index) => {
        const box = document.createElement('div');
        box.classList.add('product-box');
        box.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p><strong>Price:</strong> $${product.price}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <div class="quantity-container">
            <button class="decrease">-</button>
            <input type="number" value="${product.quantity}" min="1">
            <button class="increase">+</button>
          </div>
          <button class="remove-item">Remove</button>
        `;

        // Increase quantity
        box.querySelector('.increase').addEventListener('click', () => {
          product.quantity++;
          updateCart();
        });

        // Decrease quantity
        box.querySelector('.decrease').addEventListener('click', () => {
          if (product.quantity > 1) {
            product.quantity--;
            updateCart();
          }
        });

        // Remove item
        box.querySelector('.remove-item').addEventListener('click', () => {
          cart.splice(index, 1);
          updateCart();
        });

        cartGrid.appendChild(box);
      });

      updateTotal();
    }

    // Update cart in localStorage and re-render
    function updateCart() {
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }

    // Calculate and display total
    function updateTotal() {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      totalPriceEl.textContent = total.toFixed(2);
    }

    renderCart();
  }

  // ==========================================
  // HELPER FUNCTION: Add product to cart
  // ==========================================
  function addProductToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }

});

// checkout page

// Get cart items from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Select DOM elements
const cartSummaryGrid = document.querySelector('.cart-summary-grid');
const totalPriceEl = document.getElementById('total-price');
const checkoutForm = document.getElementById('checkout-form');
const successMsg = document.getElementById('success-msg');

// Render cart summary
function renderCartSummary() {
  cartSummaryGrid.innerHTML = '';

  if (cart.length === 0) {
    cartSummaryGrid.innerHTML = '<p>Your cart is empty.</p>';
    totalPriceEl.textContent = '0.00';
    return;
  }

  cart.forEach(product => {
    const div = document.createElement('div');
    div.classList.add('cart-summary-item');
    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>Qty: ${product.quantity}</p>
      <p>Price: $${(product.price * product.quantity).toFixed(2)}</p>
    `;
    cartSummaryGrid.appendChild(div);
  });

  updateTotal();
}

// Update total price
function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPriceEl.textContent = total.toFixed(2);
}

// Handle form submission
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault(); // prevent page reload

  // Basic validation
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!name || !email || !address) {
    alert('Please fill in all fields.');
    return;
  }

  // Optionally: here you can send the data to server

  // Show success message
  successMsg.style.display = 'block';

  // Clear cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartSummary();

  // Reset form
  checkoutForm.reset();
});

// Initial render
renderCartSummary();

