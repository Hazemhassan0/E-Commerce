document.addEventListener('DOMContentLoaded', () => {

  // helper Func

  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
  function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }
  function setFavorites(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
  }

  // -----------------------

  // HOME 
const productsGrid = document.querySelector('#products .products-grid');
const categoryButtons = document.querySelectorAll('.category-filter button');

if (productsGrid) {
  let allProducts = []; // 🔹 keep all products here

  async function fetchProducts() {
    try {
      const res = await fetch('https://fakestoreapi.com/products');
      allProducts = await res.json(); // 🔹 store globally
      renderProducts(allProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      productsGrid.innerHTML = '<p>Failed to load products.</p>';
    }
  }

  function renderProducts(list) {
    let favs = getFavorites();
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

      // Fav toggle
      div.querySelector('.fav-btn').addEventListener('click', () => {
        if (favs.some(p => p.id === product.id)) {
          favs = favs.filter(p => p.id !== product.id);
        } else {
          favs.push(product);
        }
        setFavorites(favs);
        renderProducts(list); // refresh 
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

  // category buttons
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.category;
      if (value === 'all') {
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category === value);
        renderProducts(filtered);
      }
    });
  });

  fetchProducts();
}


  // -----------------------

  // FAVORITES
  const favoritesGrid = document.querySelector('#favorites-page .favorites-grid');
  if (favoritesGrid) {
    function renderFavorites() {
      const favs = getFavorites();
      favoritesGrid.innerHTML = '';

      if (favs.length === 0) {
        favoritesGrid.innerHTML = '<p>You have no favorite products.</p>';
        return;
      }

      favs.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-box';
        div.innerHTML = `
          <img src="${product.image}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p class="price">$${product.price}</p>
          <p class="category">${product.category}</p>
          <div class="product-actions">
            <button class="fav-btn active">Remove Fav</button>
            <button class="cart-btn">Add to Cart</button>
          </div>
        `;

        // Remove in fav 
        div.querySelector('.fav-btn').addEventListener('click', () => {
          let favs = getFavorites();
          favs = favs.filter(p => p.id !== product.id);
          setFavorites(favs);
          renderFavorites();
        });

        // Add to cart fav
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

        favoritesGrid.appendChild(div);
      });
    }

    renderFavorites();
  }

  // -----------------------
  
  // CART
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


      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        

        const div = document.createElement('div');
        div.className = 'product-box';
        div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" style="max-width: 100px; height: auto; margin-bottom: 0.5rem;">
        <h4>${item.title}</h4>
        <p>Price: $${item.price.toFixed(2)}</p>
        <div class="quantity-container">
        <button class="decrease" data-index="${index}">-</button>
        <span>${item.quantity}</span>
        <button class="increase" data-index="${index}">+</button>
        </div>
        <p>Total: $${itemTotal.toFixed(2)}</p>
        <button class="remove-item" data-index="${index}">Remove</button>
        
        `;
        cartGrid.appendChild(div);
      });

      cartGrid.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', e => {
          const i = e.target.dataset.index;
          cart[i].quantity += 1;
          setCart(cart);
          renderCart();
        });
      });

      cartGrid.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', e => {
          const i = e.target.dataset.index;
          if (cart[i].quantity > 1) {
            cart[i].quantity -= 1;
          } else {
            cart.splice(i, 1);
          }
          setCart(cart);
          renderCart();
        });
      });

      cartGrid.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', e => {
          const i = e.target.dataset.index;
          cart.splice(i, 1);
          setCart(cart);
          renderCart();
        });
      });
    }

    renderCart();

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  }

  // -----------------------
  
  // CHECKOUT
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
      const name = document.getElementById('name')
      const email = document.getElementById('email')
      const address = document.getElementById('address')

      if (!name || !email || !address) {
        alert('Please fill in all fields.');
        return;
      }

      alert('Order placed successfully!');
      setCart([]); //clear
    });
  }
});
