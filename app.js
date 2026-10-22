const products = [
  {
    id: 1,
    name: "Velocity One",
    category: "footwear",
    type: "Performance sneaker",
    price: 129,
    badge: "BESTSELLER",
    image: "photo-1542291026-7eec264c27ff",
    color: "Red",
  },
  {
    id: 2,
    name: "Cloud Runner",
    category: "footwear",
    type: "Everyday runner",
    price: 145,
    badge: "NEW",
    image: "photo-1495555961986-6d4c1ecb7be3",
    color: "White",
  },
  {
    id: 3,
    name: "Form Essential",
    category: "apparel",
    type: "Heavyweight tee",
    price: 49,
    badge: "ESSENTIAL",
    image: "photo-1521572163474-6864f9cf17ab",
    color: "Off-white",
  },
  {
    id: 4,
    name: "Studio Carry",
    category: "accessories",
    type: "Everyday tote",
    price: 39,
    badge: "LIMITED",
    image: "photo-1544816155-12df9643f363",
    color: "Natural",
  },
  {
    id: 5,
    name: "Night Shift",
    category: "apparel",
    type: "Relaxed streetwear",
    price: 89,
    badge: "NEW",
    image: "photo-1551488831-00ddcb6c6bd3",
    color: "Neutral",
  },
  {
    id: 6,
    name: "Motion 02",
    category: "footwear",
    type: "Street sneaker",
    price: 119,
    badge: "DROP 001",
    image: "photo-1552346154-21d32810aba3",
    color: "Classic",
  },
  {
    id: 7,
    name: "Daily Frame",
    category: "accessories",
    type: "Minimal eyewear",
    price: 59,
    badge: "STUDIO PICK",
    image: "photo-1511499767150-a48a237f0083",
    color: "Black",
  },
  {
    id: 8,
    name: "After Hours",
    category: "apparel",
    type: "Everyday jacket",
    price: 159,
    badge: "LIMITED",
    image: "photo-1529139574466-a303027c1d8b",
    color: "Black",
  },
];
const money = (amount) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
    amount,
  );
const imageUrl = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;
const grid = document.querySelector("#product-grid"),
  cartCount = document.querySelector("#cart-count"),
  cartDrawer = document.querySelector("#cart-drawer"),
  cartItems = document.querySelector("#cart-items"),
  cartTotal = document.querySelector("#cart-total"),
  overlay = document.querySelector("#overlay"),
  shipMsg = document.querySelector("#ship-msg"),
  shipBar = document.querySelector("#ship-bar"),
  FREE_SHIPPING = 150;
let filter = "all",
  search = "",
  cart = {};
try {
  const saved = JSON.parse(localStorage.getItem("novae-cart") || "{}");
  if (saved && typeof saved === "object" && !Array.isArray(saved))
    cart = Object.fromEntries(
      Object.entries(saved).filter(
        ([id, qty]) =>
          products.some((p) => p.id === Number(id)) &&
          Number.isInteger(qty) &&
          qty > 0 &&
          qty <= 99,
      ),
    );
} catch {
  cart = {};
}

function renderProducts() {
  const matching = products.filter(
    (p) =>
      (filter === "all" || p.category === filter) &&
      (p.name + " " + p.type).toLowerCase().includes(search.toLowerCase()),
  );
  grid.replaceChildren();
  if (!matching.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No products found. Try another search.";
    grid.append(empty);
    return;
  }
  matching.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${index * 45}ms`;
    const imageBox = document.createElement("div");
    imageBox.className = "product-image";
    const image = document.createElement("img");
    image.src = imageUrl(product.image);
    image.alt = `${product.name} — ${product.color}`;
    image.loading = "lazy";
    image.decoding = "async";
    const badge = document.createElement("span");
    badge.className = "product-badge";
    badge.textContent = product.badge;
    const add = document.createElement("button");
    add.className = "quick-add";
    add.type = "button";
    add.textContent = "+";
    add.setAttribute("aria-label", `Add ${product.name} to bag`);
    add.addEventListener("click", () => addToCart(product.id));
    imageBox.append(image, badge, add);
    const info = document.createElement("div");
    info.className = "product-info";
    const details = document.createElement("div"),
      title = document.createElement("h3"),
      type = document.createElement("p"),
      price = document.createElement("span");
    title.textContent = product.name;
    type.textContent = product.type;
    details.append(title, type);
    price.className = "product-price";
    price.textContent = money(product.price);
    info.append(details, price);
    card.append(imageBox, info);
    grid.append(card);
  });
}
document.querySelectorAll(".filter").forEach((button) =>
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    document
      .querySelectorAll(".filter")
      .forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
  }),
);
document.querySelector("#search").addEventListener("input", (event) => {
  search = event.target.value.trim();
  renderProducts();
});
function saveCart() {
  try {
    localStorage.setItem("novae-cart", JSON.stringify(cart));
  } catch {}
}
function addToCart(id) {
  cart[id] = Math.min(99, (cart[id] || 0) + 1);
  saveCart();
  renderCart();
  openCart();
}
function changeQuantity(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) delete cart[id];
  else cart[id] = Math.min(99, next);
  saveCart();
  renderCart();
}
function makeButton(label, action, ariaLabel) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", action);
  return button;
}
function renderCart() {
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    total = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  cartItems.replaceChildren();
  shipMsg.textContent =
    total >= FREE_SHIPPING
      ? "You've unlocked free shipping ✓"
      : count
        ? `Add ${money(FREE_SHIPPING - total)} more for free shipping`
        : `Free shipping over ${money(FREE_SHIPPING)}`;
  shipBar.style.width = Math.min(100, (total / FREE_SHIPPING) * 100) + "%";
  if (!count) {
    const empty = document.createElement("div");
    empty.className = "cart-empty";
    empty.textContent = "Your bag is waiting for something good.";
    cartItems.append(empty);
    return;
  }
  products
    .filter((p) => cart[p.id])
    .forEach((product) => {
      const row = document.createElement("article");
      row.className = "cart-row";
      const img = document.createElement("img");
      img.src = imageUrl(product.image);
      img.alt = "";
      img.loading = "lazy";
      const info = document.createElement("div"),
        title = document.createElement("h3"),
        price = document.createElement("p"),
        qty = document.createElement("div");
      title.textContent = product.name;
      price.textContent = money(product.price);
      qty.className = "qty";
      qty.append(
        makeButton(
          "−",
          () => changeQuantity(product.id, -1),
          "Decrease quantity",
        ),
        Object.assign(document.createElement("span"), {
          textContent: cart[product.id],
        }),
        makeButton(
          "+",
          () => changeQuantity(product.id, 1),
          "Increase quantity",
        ),
      );
      info.append(title, price, qty);
      const remove = makeButton(
        "REMOVE",
        () => {
          delete cart[product.id];
          saveCart();
          renderCart();
        },
        `Remove ${product.name}`,
      );
      remove.className = "remove";
      row.append(img, info, remove);
      cartItems.append(row);
    });
}
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.querySelector("#close-cart").focus();
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  document.body.classList.remove("cart-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}
document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    const dialog = document.querySelector("#checkout-dialog");
    if (dialog.open) dialog.close();
  }
});
document.querySelector("#checkout").addEventListener("click", () => {
  if (!Object.keys(cart).length) return;
  closeCart();
  document.querySelector("#checkout-dialog").showModal();
});
document
  .querySelector("#finish-demo")
  .addEventListener("click", () =>
    document.querySelector("#checkout-dialog").close(),
  );
document
  .querySelector("#newsletter-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#newsletter-email");
    document.querySelector("#newsletter-status").textContent =
      "Thanks for your interest! Newsletter signup is a demo.";
    input.value = "";
  });
document.querySelector("#year").textContent = new Date().getFullYear();
const menuToggle = document.querySelector("#menu-toggle"),
  nav = document.querySelector("#nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "✕" : "☰";
});
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }),
);
const heroArt = document.querySelector("#hero-art"),
  floatingProduct = document.querySelector(".product-float");
if (
  window.matchMedia("(pointer:fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  heroArt.addEventListener("pointermove", (event) => {
    const rect = heroArt.getBoundingClientRect(),
      x = (event.clientX - rect.left) / rect.width - 0.5,
      y = (event.clientY - rect.top) / rect.height - 0.5;
    floatingProduct.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`;
    heroArt.querySelectorAll(".art-orbit").forEach((orbit, index) => {
      orbit.style.translate = `${x * (index + 1) * 9}px ${y * (index + 1) * 7}px`;
    });
  });
  heroArt.addEventListener("pointerleave", () => {
    floatingProduct.style.transform = "";
    heroArt
      .querySelectorAll(".art-orbit")
      .forEach((orbit) => (orbit.style.translate = ""));
  });
}
renderProducts();
renderCart();
