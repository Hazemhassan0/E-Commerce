// ===========================
// Main Page: Products + Filters
// ===========================
let allProducts = [];

// Fetch all products
fetch('https://fakestoreapi.com/products')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    renderProducts(products);
  });

// Select the grid container
const productsGrid = document.querySelector('#products .products-grid');

// Render products in the grid
function renderProducts(list) {
  productsGrid.innerHTML = '';
  if (list.length === 0) {
    productsGrid.innerHTML = `<p>No products found.</p>`;
    return;
  }

  list.forEach(product => {
    const productBox = document.createElement('div');
    productBox.classList.add('product-box');
    productBox.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price"><strong>Price:</strong> $${product.price}</p>
      <p class="category"><strong>Category:</strong> ${product.category}</p>
    `;

    // Redirect to product details page when clicked
    productBox.addEventListener('click', () => {
      window.location.href = `product.html?id=${product.id}`;
    });

    productsGrid.appendChild(productBox);
  });
}

// ===========================
// Search functionality
// ===========================
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-bar').value.trim().toLowerCase();
  filterProducts(query, getSelectedCategory());
});

// ===========================
// Category filter functionality
// ===========================
const categoryButtons = document.querySelectorAll('.category-filter button');
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selectedCategory = btn.getAttribute('data-category');
    filterProducts(document.getElementById('search-bar').value.trim().toLowerCase(), selectedCategory);
  });
});

// ===========================
// Combined filter: search + category
// ===========================
function filterProducts(searchQuery, category) {
  let filtered = allProducts;

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery)
    );
  }

  renderProducts(filtered);
}

// ===========================
// Helper to get currently selected category
// ===========================
function getSelectedCategory() {
  const activeBtn = document.querySelector('.category-filter button.active');
  return activeBtn ? activeBtn.getAttribute('data-category') : 'all';
}

// ===========================
// Product Details Page
// Only run if #product-details exists
// ===========================
const productDetails = document.getElementById('product-details');
if (productDetails) {
  // Get product id from query string
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Fetch product info from API
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      renderProduct(product);
    })
    .catch(err => {
      productDetails.innerHTML = '<p>Product not found.</p>';
      console.error(err);
    });

  // Render product details
  function renderProduct(product) {
    productDetails.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-info">
        <h2>${product.title}</h2>
        <p class="category"><strong>Category:</strong> ${product.category}</p>
        <p class="description">${product.description}</p>
        <p class="price">$${product.price}</p>

        <div class="quantity-container">
          <button id="decrease">-</button>
          <input type="number" id="quantity" value="1" min="1">
          <button id="increase">+</button>
        </div>

        <div class="product-buttons">
          <button id="add-fav">Add to Favorites</button>
          <button id="add-cart">Add to Cart</button>
        </div>
      </div>
    `;

    // ===========================
    // Quantity controls
    // ===========================
    const quantityInput = document.getElementById('quantity');
    document.getElementById('increase').addEventListener('click', () => {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });
    document.getElementById('decrease').addEventListener('click', () => {
      if (quantityInput.value > 1) quantityInput.value = parseInt(quantityInput.value) - 1;
    });

    // ===========================
    // Add to favorites using localStorage
    // ===========================
    document.getElementById('add-fav').addEventListener('click', () => {
      let favs = JSON.parse(localStorage.getItem('favorites')) || [];
      if (!favs.find(p => p.id === product.id)) {
        favs.push(product);
        localStorage.setItem('favorites', JSON.stringify(favs));
        alert('Added to favorites!');
      } else {
        alert('Already in favorites!');
      }
    });

    // ===========================
    // Add to cart using localStorage
    // ===========================
    document.getElementById('add-cart').addEventListener('click', () => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const qty = parseInt(quantityInput.value);
      const existing = cart.find(p => p.id === product.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({...product, quantity: qty});
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart!');
    });
  }
}
