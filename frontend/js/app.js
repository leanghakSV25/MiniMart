const page = document.getElementById("page");

if (!localStorage.getItem("token")) {
  location.href = "login.html";
}

document.querySelectorAll("[data-page]").forEach(btn => {
  btn.addEventListener("click", () => loadPage(btn.dataset.page));
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  location.href = "login.html";
});

async function loadPage(name) {
  document.querySelectorAll("[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === name));
  const pages = {
    dashboard: dashboardPage,
    products: productsPage,
    inventory: inventoryPage,
    pos: posPage,
    purchases: simplePage("Purchases", "Purchase management is ready for the next module."),
    suppliers: simplePage("Suppliers", "Supplier management is ready for the next module."),
    customers: simplePage("Customers", "Customer management is ready for the next module."),
    reports: simplePage("Reports", "Sales reports will be connected to MongoDB orders."),
    expenses: simplePage("Expenses", "Expense management is ready for the next module."),
    employees: simplePage("Employees", "Employee management is ready for the next module."),
    settings: simplePage("Settings", "System settings.")
  };
  await pages[name]();
}

function shell(title, body) {
  page.innerHTML = `<div class="content"><div class="title-row"><h1>${title}</h1></div>${body}</div>`;
}

async function dashboardPage() {
  try {
    const s = await api("/dashboard/summary");
    shell("Dashboard", `
      <div class="cards">
        <div class="card"><div class="muted">Sales</div><div class="metric">$${Number(s.sales).toFixed(2)}</div><div class="muted">Total sales</div></div>
        <div class="card"><div class="muted">Orders</div><div class="metric">${s.orders}</div><div class="muted">All orders</div></div>
        <div class="card"><div class="muted">Products</div><div class="metric">${s.products}</div><div class="muted">Active products</div></div>
        <div class="card"><div class="muted">Low Stock</div><div class="metric">${s.lowStock}</div><div class="muted">Need restock</div></div>
      </div>
      <div class="grid">
        <div class="panel"><h3>Sales Overview</h3><div class="notice">Connect your sales chart here after adding more report endpoints.</div></div>
        <div class="panel"><h3>Quick Actions</h3><button class="btn" onclick="loadPage('pos')">Open POS</button></div>
      </div>`);
  } catch (e) {
    shell("Dashboard", `<div class="notice">${e.message}</div>`);
  }
}

async function productsPage() {
  let products = [];
  try { products = await api("/products"); } catch (e) { shell("Products", `<div class="notice">${e.message}</div>`); return; }

  shell("Product List", `
    <div class="title-row"><span class="muted">${products.length} products</span><button class="btn" onclick="showAddProduct()">Add Product</button></div>
    <div class="panel">
      <table><thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Buy</th><th>Sell</th><th>Stock</th><th>Action</th></tr></thead>
      <tbody>${products.map(p => `<tr>
        <td>${p.code}</td><td>${p.name}</td><td>${p.category}</td>
        <td>$${p.buyPrice.toFixed(2)}</td><td>$${p.sellPrice.toFixed(2)}</td><td>${p.stock}</td>
        <td><button class="btn danger" onclick="deleteProduct('${p._id}')">Delete</button></td>
      </tr>`).join("")}</tbody></table>
    </div>
    <div id="productForm"></div>`);
}

function showAddProduct() {
  document.getElementById("productForm").innerHTML = `
    <div class="panel" style="margin-top:18px">
      <h3>Add Product</h3>
      <form id="addProduct" class="form-grid">
        <input id="pcode" placeholder="Product code" required>
        <input id="pname" placeholder="Product name" required>
        <input id="pcat" placeholder="Category" value="General">
        <input id="punit" placeholder="Unit" value="pcs">
        <input id="buy" type="number" step="0.01" placeholder="Buy price" required>
        <input id="sell" type="number" step="0.01" placeholder="Sell price" required>
        <input id="stock" type="number" placeholder="Stock" value="0">
        <input id="min" type="number" placeholder="Minimum stock" value="5">
        <button class="btn full">Save Product</button>
      </form>
    </div>`;
  document.getElementById("addProduct").addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({
          code: pcode.value, name: pname.value, category: pcat.value, unit: punit.value,
          buyPrice: Number(buy.value), sellPrice: Number(sell.value),
          stock: Number(stock.value), minStock: Number(min.value)
        })
      });
      productsPage();
    } catch (err) { alert(err.message); }
  });
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try { await api("/products/" + id, { method: "DELETE" }); productsPage(); }
  catch (e) { alert(e.message); }
}

async function inventoryPage() {
  let products = [];
  try { products = await api("/products"); } catch (e) { shell("Stock / Inventory", `<div class="notice">${e.message}</div>`); return; }
  shell("All Inventory", `<div class="panel"><table><thead><tr><th>Code</th><th>Product</th><th>Stock</th><th>Minimum</th><th>Status</th></tr></thead><tbody>
    ${products.map(p => `<tr><td>${p.code}</td><td>${p.name}</td><td>${p.stock}</td><td>${p.minStock}</td><td>${p.stock <= p.minStock ? "Low Stock" : "In Stock"}</td></tr>`).join("")}
  </tbody></table></div>`);
}

async function posPage() {
  let products = [];
  try { products = await api("/products"); } catch (e) { shell("POS / Checkout", `<div class="notice">${e.message}</div>`); return; }
  window.cart = [];
  shell("POS / Checkout", `<div class="pos">
    <div class="panel">
      <h3>Products</h3>
      <div class="product-grid">${products.map(p => `<div class="product-tile" onclick="addCart('${p._id}','${escapeHtml(p.name)}',${p.sellPrice})">
        <strong>${escapeHtml(p.name)}</strong><br><span class="muted">$${p.sellPrice.toFixed(2)} · Stock ${p.stock}</span>
      </div>`).join("")}</div>
    </div>
    <div class="panel"><h3>Cart</h3><div id="cart"></div><hr><div class="total" id="total">$0.00</div><input id="paid" type="number" step="0.01" placeholder="Paid amount" style="width:100%;padding:10px;margin:10px 0"><button class="btn" onclick="checkout()">Checkout</button></div>
  </div>`);
  renderCart();
}

function escapeHtml(s) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("'","&#039;");
}

function addCart(id, name, price) {
  const found = cart.find(x => x.productId === id);
  if (found) found.quantity++;
  else cart.push({ productId: id, name, price, quantity: 1 });
  renderCart();
}

function renderCart() {
  const box = document.getElementById("cart");
  if (!box) return;
  box.innerHTML = cart.length ? cart.map((x,i) => `<div style="display:flex;justify-content:space-between;padding:8px 0">
    <span>${x.name} x ${x.quantity}</span><span>$${(x.price*x.quantity).toFixed(2)}
    <button onclick="cart.splice(${i},1);renderCart()">×</button></span></div>`).join("") : '<p class="muted">Cart is empty</p>';
  const total = cart.reduce((sum,x) => sum + x.price*x.quantity, 0);
  document.getElementById("total").textContent = "$" + total.toFixed(2);
}

async function checkout() {
  if (!cart.length) return alert("Cart is empty");
  const paid = Number(document.getElementById("paid").value || 0);
  const total = cart.reduce((s,x) => s + x.price*x.quantity, 0);
  try {
    const order = await api("/orders", {
      method: "POST",
      body: JSON.stringify({ items: cart.map(x => ({ productId:x.productId, quantity:x.quantity })), paid, paymentMethod:"cash" })
    });
    alert(`Sale completed: ${order.invoiceNumber}\nChange: $${order.change.toFixed(2)}`);
    posPage();
  } catch (e) { alert(e.message); }
}

function simplePage(title, message) {
  return async () => shell(title, `<div class="panel"><div class="notice">${message}</div></div>`);
}

loadPage("dashboard");
