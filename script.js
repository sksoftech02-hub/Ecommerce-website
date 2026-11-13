/**
 * FurnishGo Retail - Demo Store Script
 * Modern Cart, Instant Search, Category Filter & WhatsApp Order Generator
 */

// 1. WhatsApp Support Number (Replace with official merchant number)
const PHONE = "918958407464";

// 2. Product Catalogue with High-Resolution Photos and Fallbacks
const products = [
  {
    id: 1,
    name: "Trident 100% Cotton Single Bedsheet",
    category: "bedsheets",
    badge: "Bestseller",
    price: 870,
    mrp: 1299,
    img: "assets/trident-bedsheet.jpg",
    fallback: "./trident-bedsheet.jpg",
    desc: "Soft breathable sateen weave with matching pillow cover. Fade resistant."
  },
  {
    id: 2,
    name: "Trident Sanskriti All-Season AC Comforter",
    category: "comforters",
    badge: "Trending",
    price: 3400,
    mrp: 4599,
    img: "assets/trident-comforter.jpg",
    fallback: "./trident-comforter.jpg",
    desc: "Hypoallergenic plush microfiber fill with diamond quilting for enduring loft."
  },
  {
    id: 3,
    name: "Trident Plush Hand & Bath Towels Set",
    category: "towels",
    badge: "Set of 3",
    price: 269,
    mrp: 499,
    img: "assets/trident-towels.jpg",
    fallback: "./trident-towels.jpg",
    desc: "550 GSM ultra-absorbent zero-twist combed cotton loops. Quick drying."
  },
  {
    id: 4,
    name: "Miraaj King 6-Piece Luxury Comforter Set",
    category: "comforters",
    badge: "Luxury Edit",
    price: 2550,
    mrp: 3899,
    img: "assets/miraaj-comforter.jpg",
    fallback: "./miraaj-comforter.jpg",
    desc: "Grand master bedroom set including comforter, fitted sheet, and 4 shams."
  },
  {
    id: 5,
    name: "Handcrafted Cotton Cushion Covers (Set of 2)",
    category: "living",
    badge: "New Arrival",
    price: 499,
    mrp: 899,
    img: "assets/cotton-cushion-covers.jpg",
    fallback: "./cotton-cushion-covers.jpg",
    desc: "Textured boho woven cotton fabric with concealed heavy-duty zippers."
  },
  {
    id: 6,
    name: "Luxury Soft Woven Throw Blanket",
    category: "living",
    badge: "Cozy Home",
    price: 1450,
    mrp: 2200,
    img: "assets/luxury-throw-blanket.jpg",
    fallback: "./luxury-throw-blanket.jpg",
    desc: "Gentle warm drape for sofas, reading armchairs, or layered bedding."
  }
];

// 3. State Management
let currentFilter = "all";
let cart = [];

// Load cart from localStorage if present
try {
  const savedCart = localStorage.getItem("furnishgo_demo_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
} catch (e) {
  cart = [];
}

// 4. DOM Elements
const productsGrid = document.getElementById("products");
const searchInput = document.getElementById("search");
const noResults = document.getElementById("noResults");
const resetFilterBtn = document.getElementById("resetFilterBtn");
const countBadge = document.getElementById("count");
const drawer = document.getElementById("drawer");
const shade = document.getElementById("shade");
const cartOpenBtn = document.getElementById("cart-open");
const closeBtn = document.getElementById("close");
const drawerItems = document.getElementById("items");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");
const mobileToggle = document.getElementById("mobileToggle");
const mobileMenu = document.getElementById("mobileMenu");
const filterPills = document.querySelectorAll(".filter-pill");
const catCards = document.querySelectorAll(".cat-card");

// 5. Render Product Grid
function renderProducts() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = products.filter(item => {
    const matchesFilter = currentFilter === "all" || item.category === currentFilter;
    const matchesSearch = item.name.toLowerCase().includes(query) ||
                          item.desc.toLowerCase().includes(query) ||
                          item.category.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  productsGrid.innerHTML = filtered.map(item => {
    const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    return `
      <article class="product-card" data-id="${item.id}">
        <div class="product-img-wrap">
          <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="if(this.src!=='${item.fallback}') this.src='${item.fallback}';">
          <span class="product-badge">${item.badge}</span>
          <span class="product-stock">● In Stock</span>
        </div>
        <div class="product-body">
          <span class="product-category">${item.category}</span>
          <h3 class="product-title">${item.name}</h3>
          <p class="product-desc">${item.desc}</p>
          <div class="product-pricing">
            <span class="product-price">₹${item.price.toLocaleString("en-IN")}</span>
            <span class="product-mrp">₹${item.mrp.toLocaleString("en-IN")}</span>
            <span class="product-discount">${discount}% OFF</span>
          </div>
          <button class="add-btn" onclick="handleAddToCart(${item.id}, this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add to Bag
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// 6. Cart Operations
function saveCart() {
  try {
    localStorage.setItem("furnishgo_demo_cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Cart save error", e);
  }
}

function handleAddToCart(productId, btnElement) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      fallback: product.fallback,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();

  // Button feedback animation
  if (btnElement) {
    const origHTML = btnElement.innerHTML;
    btnElement.classList.add("added");
    btnElement.innerHTML = `<span>Added ✓</span>`;
    setTimeout(() => {
      btnElement.classList.remove("added");
      btnElement.innerHTML = origHTML;
    }, 1200);
  }

  openDrawer();
}

function changeQty(productId, delta) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function removeItem(productId) {
  cart = cart.filter(c => c.id !== productId);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  countBadge.textContent = totalItemsCount;

  if (cart.length === 0) {
    drawerItems.innerHTML = `<div class="empty-cart-msg">Your shopping bag is currently empty.<br><small style="color:#a88c58;">Explore products above to add items!</small></div>`;
    totalEl.textContent = "₹0";
    return;
  }

  drawerItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.src='${item.fallback}'">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString("en-IN")}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="item-remove" onclick="removeItem(${item.id})" title="Remove item">Remove</button>
    </div>
  `).join("");

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  totalEl.textContent = "₹" + grandTotal.toLocaleString("en-IN");
}

// 7. Drawer Open / Close
function openDrawer() {
  drawer.classList.add("open");
  shade.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  drawer.classList.remove("open");
  shade.classList.remove("show");
  document.body.style.overflow = "";
}

cartOpenBtn.addEventListener("click", openDrawer);
closeBtn.addEventListener("click", closeDrawer);
shade.addEventListener("click", closeDrawer);

// 8. Category & Filter Controls
function setFilter(newFilter) {
  currentFilter = newFilter;
  filterPills.forEach(pill => {
    pill.classList.toggle("active", pill.dataset.filter === newFilter);
  });
  renderProducts();
}

filterPills.forEach(pill => {
  pill.addEventListener("click", () => {
    setFilter(pill.dataset.filter);
  });
});

catCards.forEach(card => {
  card.addEventListener("click", () => {
    const cat = card.dataset.cat;
    setFilter(cat);
    const shopEl = document.getElementById("shop");
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});

if (searchInput) {
  searchInput.addEventListener("input", renderProducts);
}

if (resetFilterBtn) {
  resetFilterBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    setFilter("all");
  });
}

// 9. Mobile Menu Toggle
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });

  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });
  });
}

// 10. WhatsApp Checkout Logic
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your shopping bag is empty. Please add items before placing an order.");
    return;
  }

  const custName = document.getElementById("custName").value.trim();
  const custAddress = document.getElementById("custAddress").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const deliveryChoice = document.getElementById("delivery-choice").value;
  const paymentChoice = document.getElementById("payment").value;

  if (!custName) {
    alert("Please enter your name for order confirmation.");
    document.getElementById("custName").focus();
    return;
  }

  if (!custAddress) {
    alert("Please enter your delivery address.");
    document.getElementById("custAddress").focus();
    return;
  }

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Construct structured order message for WhatsApp
  let msg = `🛍️ *NEW ORDER INQUIRY - FURNISHGO RETAIL (DEMO)*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Customer Details:*\n`;
  msg += `• Name: ${custName}\n`;
  msg += `• Address: ${custAddress}\n`;
  msg += `• PIN Code: ${pin || "Will share on chat"}\n`;
  msg += `• Delivery Type: ${deliveryChoice}\n`;
  msg += `• Payment Preference: ${paymentChoice}\n\n`;

  msg += `📦 *Ordered Items:*\n`;
  cart.forEach((item, index) => {
    msg += `${index + 1}. ${item.name}\n   Qty: ${item.qty} × ₹${item.price} = ₹${item.price * item.qty}\n`;
  });

  msg += `\n💰 *Estimated Total:* ₹${grandTotal.toLocaleString("en-IN")}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⚠️ _Note: This inquiry was created via the FurnishGo Demo Store. Please confirm stock availability, delivery timeline and payment details._`;

  const waURL = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
  window.open(waURL, "_blank");
});

// 11. Initial Setup
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

renderProducts();
updateCartUI();
