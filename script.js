/**
 * FurnishGo Retail - Demo Store Script
 * In-App Checkout, Order Placement & Live Delivery Milestone Tracking
 */

// 1. Product Catalogue with High-Resolution Photos and Fallbacks
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

// 2. Application State Management
let currentFilter = "all";
let cart = [];
let placedOrders = [];
let pendingShippingData = null;
let currentViewedOrder = null;

// Initialize Storage
try {
  const savedCart = localStorage.getItem("furnishgo_demo_cart");
  if (savedCart) cart = JSON.parse(savedCart);

  const savedOrders = localStorage.getItem("furnishgo_placed_orders");
  if (savedOrders) placedOrders = JSON.parse(savedOrders);
} catch (e) {
  cart = [];
  placedOrders = [];
}

// 3. DOM Elements
const productsGrid = document.getElementById("products");
const searchInput = document.getElementById("search");
const noResults = document.getElementById("noResults");
const resetFilterBtn = document.getElementById("resetFilterBtn");
const countBadge = document.getElementById("count");
const ordersBadge = document.getElementById("ordersBadge");
const drawer = document.getElementById("drawer");
const shade = document.getElementById("shade");
const cartOpenBtn = document.getElementById("cart-open");
const closeBtn = document.getElementById("close");
const drawerItems = document.getElementById("items");
const totalEl = document.getElementById("total");
const billSubtotalEl = document.getElementById("billSubtotal");
const drawerItemCountEl = document.getElementById("drawerItemCount");
const proceedToCheckoutBtn = document.getElementById("proceedToCheckoutBtn");

// Modals
const checkoutModalBackdrop = document.getElementById("checkoutModalBackdrop");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const step1Content = document.getElementById("step1Content");
const step2Content = document.getElementById("step2Content");
const step1Indicator = document.getElementById("step1Indicator");
const step2Indicator = document.getElementById("step2Indicator");
const stepIndicatorText = document.getElementById("stepIndicator");
const continueToPaymentBtn = document.getElementById("continueToPaymentBtn");
const backToCartBtn = document.getElementById("backToCartBtn");
const backToShippingBtn = document.getElementById("backToShippingBtn");
const editShippingBtn = document.getElementById("editShippingBtn");
const confirmPlaceOrderBtn = document.getElementById("confirmPlaceOrderBtn");
const placeOrderBtnText = document.getElementById("placeOrderBtnText");

// Order Success Elements
const orderSuccessBackdrop = document.getElementById("orderSuccessBackdrop");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");

// Order History Elements
const ordersOpenBtn = document.getElementById("orders-open");
const mobileTrackBtn = document.getElementById("mobileTrackBtn");
const orderHistoryBackdrop = document.getElementById("orderHistoryBackdrop");
const closeHistoryModal = document.getElementById("closeHistoryModal");
const ordersListContainer = document.getElementById("ordersListContainer");

// Navigation
const mobileToggle = document.getElementById("mobileToggle");
const mobileMenu = document.getElementById("mobileMenu");
const filterPills = document.querySelectorAll(".filter-pill");
const catCards = document.querySelectorAll(".cat-card");

// 4. Render Product Grid
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

// 5. Cart Operations
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

  // Button micro-interaction
  if (btnElement) {
    const origHTML = btnElement.innerHTML;
    btnElement.classList.add("added");
    btnElement.innerHTML = `<span>Added to Bag ✓</span>`;
    setTimeout(() => {
      btnElement.classList.remove("added");
      btnElement.innerHTML = origHTML;
    }, 1100);
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
  if (drawerItemCountEl) {
    drawerItemCountEl.textContent = `${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'}`;
  }

  if (cart.length === 0) {
    drawerItems.innerHTML = `
      <div class="empty-cart-msg">
        <p style="font-size: 16px; margin-bottom: 6px;">Your shopping bag is empty.</p>
        <span style="color:#b89758; font-size: 13px;">Explore our collection to add luxury home essentials!</span>
      </div>`;
    totalEl.textContent = "₹0";
    if (billSubtotalEl) billSubtotalEl.textContent = "₹0";
    if (proceedToCheckoutBtn) {
      proceedToCheckoutBtn.disabled = true;
      proceedToCheckoutBtn.style.opacity = "0.5";
      proceedToCheckoutBtn.style.cursor = "not-allowed";
    }
    return;
  }

  if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.disabled = false;
    proceedToCheckoutBtn.style.opacity = "1";
    proceedToCheckoutBtn.style.cursor = "pointer";
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
  if (billSubtotalEl) {
    billSubtotalEl.textContent = "₹" + grandTotal.toLocaleString("en-IN");
  }
}

// 6. Drawer Management
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
shade.addEventListener("click", () => {
  closeDrawer();
  closeAllModals();
});

// 7. Multi-Step Checkout Modal Flow
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Please add items to your shopping bag before proceeding.");
    return;
  }
  closeDrawer();
  checkoutModalBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  goToStep1();
}

function closeAllModals() {
  checkoutModalBackdrop.classList.add("hidden");
  orderSuccessBackdrop.classList.add("hidden");
  orderHistoryBackdrop.classList.add("hidden");
  const receiptBackdrop = document.getElementById("receiptModalBackdrop");
  if (receiptBackdrop) receiptBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

closeCheckoutModal.addEventListener("click", closeAllModals);
if (backToCartBtn) {
  backToCartBtn.addEventListener("click", () => {
    closeAllModals();
    openDrawer();
  });
}

proceedToCheckoutBtn.addEventListener("click", openCheckoutModal);

// Checkout Stepper Navigation
function goToStep1() {
  step1Content.classList.remove("hidden");
  step2Content.classList.add("hidden");
  step1Indicator.classList.add("active");
  step2Indicator.classList.remove("active");
  stepIndicatorText.textContent = "Step 1 of 2: Shipping Destination";
}

function goToStep2() {
  // Validate Step 1 Inputs
  const name = document.getElementById("shipName").value.trim();
  const phone = document.getElementById("shipPhone").value.trim();
  const address = document.getElementById("shipAddress").value.trim();
  const city = document.getElementById("shipCity").value.trim();
  const pin = document.getElementById("shipPin").value.trim();
  const email = document.getElementById("shipEmail").value.trim();

  if (!name) {
    alert("Please enter your full name.");
    document.getElementById("shipName").focus();
    return;
  }
  if (!phone || phone.length < 10) {
    alert("Please enter a valid 10-digit mobile number for delivery updates.");
    document.getElementById("shipPhone").focus();
    return;
  }
  if (!address) {
    alert("Please enter your complete street delivery address.");
    document.getElementById("shipAddress").focus();
    return;
  }
  if (!city) {
    alert("Please enter your city.");
    document.getElementById("shipCity").focus();
    return;
  }
  if (!pin || pin.length < 6) {
    alert("Please enter a valid 6-digit PIN code.");
    document.getElementById("shipPin").focus();
    return;
  }

  // Save pending shipping details
  pendingShippingData = { name, phone, email, address, city, pin };

  // Update preview badge
  const previewText = document.getElementById("previewAddressText");
  if (previewText) {
    previewText.innerHTML = `<strong>${name}</strong> (${phone})<br>${address}, ${city} - ${pin}`;
  }

  // Render miniature summary items
  const summaryContainer = document.getElementById("checkoutSummaryItems");
  if (summaryContainer) {
    summaryContainer.innerHTML = cart.map(item => `
      <div class="mini-summary-item">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='${item.fallback}'">
        <div class="mini-summary-info">
          <strong>${item.name}</strong>
          <span>Qty: ${item.qty} × ₹${item.price.toLocaleString("en-IN")}</span>
        </div>
        <div>₹${(item.price * item.qty).toLocaleString("en-IN")}</div>
      </div>
    `).join("");
  }

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById("sumSubtotal").textContent = "₹" + grandTotal.toLocaleString("en-IN");
  document.getElementById("sumGrandTotal").textContent = "₹" + grandTotal.toLocaleString("en-IN");

  // Switch steps
  step1Content.classList.add("hidden");
  step2Content.classList.remove("hidden");
  step2Indicator.classList.add("active");
  stepIndicatorText.textContent = "Step 2 of 2: Payment & Final Review";
}

continueToPaymentBtn.addEventListener("click", goToStep2);
backToShippingBtn.addEventListener("click", goToStep1);
if (editShippingBtn) editShippingBtn.addEventListener("click", goToStep1);

// Payment method option cards toggle
document.querySelectorAll(".payment-option-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".payment-option-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    const radio = card.querySelector("input[type='radio']");
    if (radio) radio.checked = true;
  });
});

// 8. Place Order & Trigger Delivery Status Flow
confirmPlaceOrderBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  const selectedRadio = document.querySelector("input[name='paymentMethod']:checked");
  const paymentMethod = selectedRadio ? selectedRadio.value : "Cash on Delivery (COD)";

  // Show loading simulation on button
  confirmPlaceOrderBtn.disabled = true;
  placeOrderBtnText.innerHTML = "Processing Order 🔒...";

  setTimeout(() => {
    // Generate Order ID & Dates
    const randomId = "FG-" + Math.floor(10000 + Math.random() * 90000);
    const today = new Date();
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(today.getDate() + 3);

    const estDateFormatted = estDeliveryDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

    const dateFormatted = today.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const newOrder = {
      orderId: `#${randomId}`,
      date: dateFormatted,
      time: today.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      estDelivery: estDateFormatted,
      customer: pendingShippingData,
      paymentMethod: paymentMethod,
      items: [...cart],
      total: grandTotal,
      status: "In Transit",
      courier: "BlueDart Express",
      trackingNumber: "BD" + Math.floor(10000000 + Math.random() * 90000000) + "IN"
    };

    // Save order in state and localStorage
    placedOrders.unshift(newOrder);
    try {
      localStorage.setItem("furnishgo_placed_orders", JSON.stringify(placedOrders));
    } catch (e) {
      console.error(e);
    }

    // Reset button state
    confirmPlaceOrderBtn.disabled = false;
    placeOrderBtnText.innerHTML = "Confirm & Place Order →";

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    updateOrdersBadge();

    // Close checkout and show Order Success Modal
    checkoutModalBackdrop.classList.add("hidden");
    displayOrderSuccess(newOrder);

    // Also log the order payload in console for easy integration / data gathering
    console.log("✅ [FurnishGo Demo] Order successfully captured:", newOrder);
  }, 1000);
});

// 9. Display Order Success & Live Delivery Tracking
function displayOrderSuccess(order) {
  currentViewedOrder = order;

  document.getElementById("dispOrderId").textContent = order.orderId;
  document.getElementById("dispOrderDate").textContent = order.date + " · " + order.time;
  document.getElementById("dispPaymentMode").textContent = order.paymentMethod;
  document.getElementById("dispEstDate").textContent = order.estDelivery;

  // Destination Details
  const c = order.customer;
  document.getElementById("dispCustomerDetails").innerHTML = `
    <strong>${c.name}</strong><br>
    ${c.address}<br>
    ${c.city} - ${c.pin}<br>
    Phone: +91 ${c.phone}
  `;

  // Purchased items list
  document.getElementById("dispItemCount").textContent = order.items.reduce((s, i) => s + i.qty, 0);
  const itemsContainer = document.getElementById("dispPurchasedItems");
  itemsContainer.innerHTML = order.items.map(item => `
    <div class="mini-purchased-line">
      <span>${item.name} × ${item.qty}</span>
      <strong>₹${(item.price * item.qty).toLocaleString("en-IN")}</strong>
    </div>
  `).join("");

  document.getElementById("dispGrandTotal").textContent = "₹" + order.total.toLocaleString("en-IN");

  orderSuccessBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// 9b. Dedicated Official 1-Page Tax Invoice & Receipt
function handleViewReceipt() {
  let order = currentViewedOrder;
  if (!order && placedOrders && placedOrders.length > 0) {
    order = placedOrders[0];
  }
  if (!order) {
    try {
      const savedOrders = localStorage.getItem("furnishgo_placed_orders");
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (parsed && parsed.length > 0) order = parsed[0];
      }
    } catch(e) {}
  }
  if (!order) {
    order = {
      orderId: "#FG-" + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      estDelivery: "3-4 Business Days",
      customer: {
        name: "Demo Customer",
        phone: "9876543210",
        address: "FurnishGo Retail Showcase Store, MG Road",
        city: "Bengaluru",
        pin: "560001",
        email: "demo@furnishgo.com"
      },
      paymentMethod: "Cash on Delivery (COD)",
      items: [
        { name: "Trident Sanskriti All-Season AC Comforter", category: "comforters", price: 3400, qty: 1 },
        { name: "Trident Plush Hand & Bath Towels Set", category: "towels", price: 269, qty: 2 }
      ],
      total: 3938,
      status: "In Transit",
      courier: "BlueDart Express",
      trackingNumber: "BD88942019IN"
    };
  }
  currentViewedOrder = order;
  populateAndShowReceipt(order);
}
window.handleViewReceipt = handleViewReceipt;

function populateAndShowReceipt(order) {
  if (!order) return;
  currentViewedOrder = order;

  const invoiceNo = "INV-2026-" + (order.orderId ? order.orderId.replace(/[^0-9]/g, "") : Math.floor(10000 + Math.random() * 90000));
  const invoiceNoEl = document.getElementById("rcptInvoiceNo");
  if (invoiceNoEl) invoiceNoEl.textContent = invoiceNo;

  const orderIdEl = document.getElementById("rcptOrderId");
  if (orderIdEl) orderIdEl.textContent = order.orderId || "#FG-84920";

  const dateEl = document.getElementById("rcptDate");
  if (dateEl) dateEl.textContent = order.date + (order.time ? (", " + order.time) : "");

  const payModeEl = document.getElementById("rcptPaymentMode");
  if (payModeEl) payModeEl.textContent = order.paymentMethod || "Cash on Delivery (COD)";

  const badgePaidEl = document.getElementById("rcptBadgePaid");
  if (badgePaidEl) {
    const isCOD = (order.paymentMethod || "").includes("COD");
    badgePaidEl.textContent = isCOD ? "COD CONFIRMED" : "PAID / VERIFIED";
  }

  const custBlock = document.getElementById("rcptCustomerBlock");
  if (custBlock && order.customer) {
    const c = order.customer;
    custBlock.innerHTML = `
      <strong>${c.name || "Customer"}</strong><br>
      ${c.address || "Delivery Address"}<br>
      ${c.city || "City"} - ${c.pin || "PIN"}<br>
      Phone: +91 ${c.phone || "9876543210"} ${c.email ? (" | " + c.email) : ""}
    `;
  }

  const courierEl = document.getElementById("rcptCourier");
  if (courierEl) courierEl.textContent = order.courier || "BlueDart Express";

  const trackingEl = document.getElementById("rcptTrackingNo");
  if (trackingEl) trackingEl.textContent = order.trackingNumber || "BD88942019IN";

  const estEl = document.getElementById("rcptEstDelivery");
  if (estEl) estEl.textContent = order.estDelivery || "3-4 Business Days";

  // Render items in table
  const tbody = document.getElementById("rcptItemsBody");
  if (tbody) {
    const items = order.items && order.items.length > 0 ? order.items : [
      { name: "Trident Single Bedsheet", category: "bedsheets", price: 870, qty: 1 }
    ];
    tbody.innerHTML = items.map((item, idx) => `
      <tr>
        <td style="text-align: center; color: #888;">${idx + 1}</td>
        <td>
          <strong>${item.name}</strong>
        </td>
        <td style="text-transform: capitalize; color: #555;">${item.category || "Home Decor"}</td>
        <td style="text-align: center; font-weight: 600;">${item.qty}</td>
        <td style="text-align: right;">₹${item.price.toLocaleString("en-IN")}</td>
        <td style="text-align: right; font-weight: 700; color: #1f372b;">₹${(item.price * item.qty).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");
  }

  const totalVal = order.total || 0;
  const subtotalEl = document.getElementById("rcptSubtotal");
  if (subtotalEl) subtotalEl.textContent = "₹" + totalVal.toLocaleString("en-IN");

  const grandTotalEl = document.getElementById("rcptGrandTotal");
  if (grandTotalEl) grandTotalEl.textContent = "₹" + totalVal.toLocaleString("en-IN");

  const receiptBackdrop = document.getElementById("receiptModalBackdrop");
  if (receiptBackdrop) {
    receiptBackdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

// Receipt Modal Event Listeners
const viewReceiptBtn = document.getElementById("viewReceiptBtn");
if (viewReceiptBtn) {
  viewReceiptBtn.addEventListener("click", handleViewReceipt);
}

const triggerPrintBtn = document.getElementById("triggerPrintBtn");
if (triggerPrintBtn) {
  triggerPrintBtn.addEventListener("click", () => {
    window.print();
  });
}

const closeReceiptModal = document.getElementById("closeReceiptModal");
if (closeReceiptModal) {
  closeReceiptModal.addEventListener("click", () => {
    const receiptBackdrop = document.getElementById("receiptModalBackdrop");
    if (receiptBackdrop) receiptBackdrop.classList.add("hidden");
    if (!orderSuccessBackdrop.classList.contains("hidden")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
}

continueShoppingBtn.addEventListener("click", () => {
  orderSuccessBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
  const shopSection = document.getElementById("shop");
  if (shopSection) shopSection.scrollIntoView({ behavior: "smooth" });
});

// 10. Placed Orders History & Tracker Modal
function updateOrdersBadge() {
  if (placedOrders.length > 0) {
    ordersBadge.textContent = placedOrders.length;
    ordersBadge.classList.remove("hidden");
  } else {
    ordersBadge.classList.add("hidden");
  }
}

function openOrderHistoryModal() {
  if (placedOrders.length === 0) {
    ordersListContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #5e6d64;">
        <p style="font-size: 16px; margin-bottom: 6px;">You haven't placed any orders yet.</p>
        <span style="font-size: 13px; color: #b89758;">Add items to your bag and proceed to checkout!</span>
      </div>
    `;
  } else {
    ordersListContainer.innerHTML = placedOrders.map((order, idx) => `
      <div class="history-card">
        <div class="history-card-header">
          <div>
            <strong>${order.orderId}</strong>
            <span style="font-size: 11px; color: #777; margin-left: 8px;">${order.date}</span>
          </div>
          <span class="history-status-badge">● ${order.status}</span>
        </div>
        <div class="history-items-row">
          ${order.items.map(i => `${i.name} (×${i.qty})`).join(", ")}
        </div>
        <div class="history-footer">
          <div>Estimated Delivery: <strong>${order.estDelivery}</strong> · Total: <strong>₹${order.total.toLocaleString("en-IN")}</strong></div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-track-now" style="background:#5e6d64;" onclick="viewReceiptByIndex(${idx})">Invoice 📄</button>
            <button class="btn-track-now" onclick="viewExistingOrder(${idx})">Track Delivery →</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  orderHistoryBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function viewReceiptByIndex(idx) {
  const order = placedOrders[idx];
  if (!order) return;
  orderHistoryBackdrop.classList.add("hidden");
  populateAndShowReceipt(order);
}
window.viewReceiptByIndex = viewReceiptByIndex;

function viewExistingOrder(orderIndex) {
  const order = placedOrders[orderIndex];
  if (!order) return;
  orderHistoryBackdrop.classList.add("hidden");
  displayOrderSuccess(order);
}
window.viewExistingOrder = viewExistingOrder;

ordersOpenBtn.addEventListener("click", openOrderHistoryModal);
if (mobileTrackBtn) mobileTrackBtn.addEventListener("click", openOrderHistoryModal);
closeHistoryModal.addEventListener("click", closeAllModals);

// 11. Category & Filter Controls
function setFilter(newFilter) {
  currentFilter = newFilter;
  filterPills.forEach(pill => {
    pill.classList.toggle("active", pill.dataset.filter === newFilter);
  });
  renderProducts();
}

filterPills.forEach(pill => {
  pill.addEventListener("click", () => setFilter(pill.dataset.filter));
});

catCards.forEach(card => {
  card.addEventListener("click", () => {
    setFilter(card.dataset.cat);
    const shopEl = document.getElementById("shop");
    if (shopEl) shopEl.scrollIntoView({ behavior: "smooth" });
  });
});

if (searchInput) searchInput.addEventListener("input", renderProducts);

if (resetFilterBtn) {
  resetFilterBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    setFilter("all");
  });
}

// 12. Mobile Menu Toggle
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener("click", () => mobileMenu.classList.toggle("open"));
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => mobileMenu.classList.remove("open"));
  });
}

// 13. Initial App Launch
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

renderProducts();
updateCartUI();
updateOrdersBadge();
