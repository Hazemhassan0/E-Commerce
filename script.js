document.addEventListener('DOMContentLoaded', () => {
  // -----------------------
  // Storage helpers
  // -----------------------
  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
  function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }
  function setFavorites(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
  }

  // -----------------------
  // HOME PAGE
  // -----------------------
  const productsGrid = document.querySelector('#products .products-grid');
  if (productsGrid) {
    async function fetchProducts() {
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        const products = await res.json();
        renderProducts(products);
      } catch (err) {
        console.error('Error fetching products:', err);
        productsGrid.innerHTML = '<p>Failed to load products.</p>';
      }
    }

    function renderProducts(list) {
      const favs = getFavorites();
      productsGrid.innerHTML = '';

      list.forEach(product => {
        const isFav = favs.some(p => p.id === product.id);

        const div = document.createElement('div');
        div.className = 'product-box';
        div.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p class="price">$${product.price}</p>
          <p class="category">${product.category}</p>
          <div class="product-actions">
            <button class="fav-btn ${isFav ? 'active' : ''}">
              ${isFav ? 'Favorited' : 'Add to Fav'}
            </button>
            <button class="cart-btn">Add to Cart</button>
          </div>
        `;

        // Favorite toggle
        div.querySelector('.fav-btn').addEventListener('click', () => {
          let favs = getFavorites();
          if (favs.some(p => p.id === product.id)) {
            favs = favs.filter(p => p.id !== product.id);
          } else {
            favs.push(product);
          }
          setFavorites(favs);
          renderProducts(list); // refresh button states
        });

        // Add to Cart
        div.querySelector('.cart-btn').addEventListener('click', () => {
          const cart = getCart();
          const existing = cart.find(item => item.id === product.id);
          if (existing) {
            existing.quantity += 1;
          } else {
            cart.push({ ...product, quantity: 1 });
          }
          setCart(cart);
          alert(`${product.title} added to cart!`);
        });

        productsGrid.appendChild(div);
      });
    }

    fetchProducts();
  }

  // -----------------------
  // CART PAGE
  // -----------------------
  const cartGrid = document.querySelector('.cart-grid');
  const checkoutBtn = document.getElementById('go-checkout');

  if (cartGrid) {
    function renderCart() {
      const cart = getCart();
      cartGrid.innerHTML = '';

      if (cart.length === 0) {
        cartGrid.innerHTML = '<p>Your cart is empty.</p>';
        return;
      }

      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <h4>${item.title}</h4>
          <p>Qty: ${item.quantity}</p>
          <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        cartGrid.appendChild(div);
      });
    }

    window.addEventListener('cartUpdated', renderCart);
    renderCart();

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  }

  // -----------------------
  // CHECKOUT PAGE (checkout.html)
  // -----------------------
  const checkoutSummary = document.querySelector('.checkout-summary');
  const checkoutForm = document.getElementById('checkout-form');

  if (checkoutSummary) {
    const cart = getCart();
    checkoutSummary.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      checkoutSummary.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      cart.forEach(item => {
        checkoutSummary.innerHTML += `
          <p>${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        total += item.price * item.quantity;
      });
      checkoutSummary.innerHTML += `<h3>Total: $${total.toFixed(2)}</h3>`;
    }
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const address = document.getElementById('address')?.value.trim();

      if (!name || !email || !address) {
        alert('Please fill in all fields.');
        return;
      }

      alert('Order placed successfully!');
      setCart([]); // clear cart
      checkoutForm.reset();
      window.location.href = 'index.html'; // redirect home
    });
  }
});
