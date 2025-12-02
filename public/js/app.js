// js/app.js
const API_BASE = "https://pg-app-backend.onrender.com";

// ============ RETRY LOGIC FOR 500 ERRORS ============
async function retryRequest(url, options = {}, retries = 3, delay = 1000) {
  try {
    const response = await fetch(url, options);

    // If it's a 500 error and we have retries left, retry
    if (response.status === 500 && retries > 0) {
      console.warn(
        `⚠️ Server 500 error. Retrying ${url} in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((r) => setTimeout(r, delay));
      return retryRequest(url, options, retries - 1, delay * 2);
    }

    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(
        `⚠️ Network error. Retrying ${url} in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((r) => setTimeout(r, delay));
      return retryRequest(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");
  const tableBody = document.querySelector("#ordersTable tbody");
  const noOrders = document.getElementById("noOrders");
  // Modals
  const editModal = document.getElementById("editModal");
  const createModal = document.getElementById("createModal");

  const editForm = document.getElementById("editForm");
  const createForm = document.getElementById("createForm");

  const closeButtons = document.querySelectorAll(".closeModal");

  // Edit modal fields
  const editId = document.getElementById("editId");
  const editUser = document.getElementById("editUser");
  const editBreakfast = document.getElementById("editBreakfast");
  const editLunch = document.getElementById("editLunch");
  const editDinner = document.getElementById("editDinner");
  const editTotal = document.getElementById("editTotal");
  const editCanceled = document.getElementById("editCanceled");

  // Create modal fields
  const createOrderBtn = document.getElementById("createOrderBtn");
  const createUser = document.getElementById("createUser");
  const createBreakfast = document.getElementById("createBreakfast");
  const createLunch = document.getElementById("createLunch");
  const createDinner = document.getElementById("createDinner");
  const createDate = document.getElementById("createDate");
  const createCanceled = document.getElementById("createCanceled");

  // Loader overlay
  const loader = document.createElement("div");
  loader.id = "loaderOverlay";
  loader.innerHTML = `<div class="spinner"></div>`;
  document.body.appendChild(loader);

  function showLoader() {
    loader.classList.add("active");
  }
  function hideLoader() {
    loader.classList.remove("active");
  }

  let editingOrder = null;

  // default date
  datePicker.value = today();

  // Initially ensure modals are hidden
  editModal.classList.add("hidden");
  createModal.classList.add("hidden");

  // Render initial table
  fetchAndRender(datePicker.value);

  // Date change handler
  datePicker.addEventListener("change", () => {
    fetchAndRender(datePicker.value);
    console.log(datePicker.value);
  });

  // Table click handling
  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "edit") {
      openEditModal(id);
    } else if (action === "delete") {
      deleteOrder(id);
    }
  });

  // Update count box
  function updateCountBox(orders) {
    const breakfastCount = orders.filter(
      (o) => o.breakfast && !o.canceled
    ).length;
    const lunchCount = orders.filter((o) => o.lunch && !o.canceled).length;
    const dinnerCount = orders.filter((o) => o.dinner && !o.canceled).length;

    // Price configuration (in rupees)
    const BREAKFAST_PRICE = 40;
    const LUNCH_PRICE = 70;
    const DINNER_PRICE = 40;

    // Calculate total amount
    const totalAmount =
      breakfastCount * BREAKFAST_PRICE +
      lunchCount * LUNCH_PRICE +
      dinnerCount * DINNER_PRICE;

    document.getElementById("breakfastCount").textContent = breakfastCount;
    document.getElementById("lunchCount").textContent = lunchCount;
    document.getElementById("dinnerCount").textContent = dinnerCount;
    document.getElementById("totalAmount").textContent = `₹${totalAmount}`;
  }

  async function fetchAndRender(date) {
    showLoader();
    try {
      const res = await retryRequest(
        `${API_BASE}/detailed_summary?date=${date}`
      );
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      renderOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = "";
      noOrders.classList.remove("hidden");
      alert("Error loading orders. Please try again.");
    } finally {
      hideLoader();
    }
  }

  // Open edit modal
  function openEditModal(whatsapp_id) {
    showLoader();
    retryRequest(`${API_BASE}/orders/${whatsapp_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.orders || data.orders.length === 0) {
          alert("No orders found for this user");
          return;
        }
        const sortedOrders = data.orders.sort(
          (a, b) => new Date(b.order_date) - new Date(a.order_date)
        );
        editingOrder = sortedOrders[0];
        editId.value = whatsapp_id;
        editUser.value = data.username;
        editBreakfast.value = String(editingOrder.breakfast);
        editLunch.value = String(editingOrder.lunch);
        editDinner.value = String(editingOrder.dinner);
        editTotal.value = editingOrder.total_amount ?? 0;
        editCanceled.value = String(editingOrder.canceled);

        editModal.classList.remove("hidden");
        setTimeout(() => editUser.focus(), 120);
      })
      .catch((err) => {
        console.error(err);
        alert("Error loading order details. Please try again.");
      })
      .finally(() => hideLoader());
  }

  // Close modals helper
  function closeModal() {
    editingOrder = null;
    editForm.reset();
    createForm.reset();
    editModal.classList.add("hidden");
    createModal.classList.add("hidden");
  }
  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  // Submit edited order
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editingOrder) return closeModal();

    const totalVal = parseFloat(editTotal.value);
    if (isNaN(totalVal) || totalVal < 0)
      return alert("Enter a valid total amount");

    const payload = {
      whatsapp_id: editId.value,
      username: editUser.value.trim() || "Unknown",
      total_amount: totalVal,
      date: datePicker.value,
    };

    // ✅ Only include if explicitly true
    if (editBreakfast.value === "true" || editBreakfast.checked) {
      payload.breakfast = true;
    }
    if (editLunch.value === "true" || editLunch.checked) {
      payload.lunch = true;
    }
    if (editDinner.value === "true" || editDinner.checked) {
      payload.dinner = true;
    }
    if (editCanceled.value === "true" || editCanceled.checked) {
      payload.canceled = true;
    }

    console.log("Submitting", payload);

    showLoader();
    try {
      const res = await retryRequest(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      alert("✅ Order updated");
      closeModal();
      fetchAndRender(datePicker.value);
    } catch (err) {
      alert(err.message);
    } finally {
      hideLoader();
    }
  });

  // Cancel (delete) order
  async function deleteOrder(whatsapp_id) {
    if (!confirm("Cancel order for user " + whatsapp_id + "?")) return;
    showLoader();
    try {
      const res = await retryRequest(`${API_BASE}/orders/cancel_by_date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_id: whatsapp_id,
          date: datePicker.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      alert("❌ Order canceled");
      fetchAndRender(datePicker.value);
    } catch (err) {
      alert(err.message);
    } finally {
      hideLoader();
    }
  }

  // ---------------- CREATE ORDER LOGIC ----------------
  async function loadUsers() {
    try {
      const res = await retryRequest(`${API_BASE}/users`);
      const data = await res.json();

      // Fetch orders for the selected date to check which users already have orders
      const ordersRes = await retryRequest(
        `${API_BASE}/detailed_summary?date=${datePicker.value}`
      );
      const ordersData = await ordersRes.json();
      const existingUserIds = new Set(
        (ordersData.orders || []).map((o) => o.whatsapp_id)
      );

      createUser.innerHTML = "";

      // Filter users - only show users without orders on the selected date
      const availableUsers = data.users.filter(
        (u) => !existingUserIds.has(u.whatsapp_id)
      );

      if (availableUsers.length === 0) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = "All users already have orders for this date";
        createUser.appendChild(opt);
        return;
      }

      availableUsers.forEach((u) => {
        const opt = document.createElement("option");
        opt.value = u.whatsapp_id;
        opt.textContent = u.username;
        createUser.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load users", err);
      alert("Error loading users. Please try again.");
    }
  }

  // Open create modal
  createOrderBtn.addEventListener("click", async () => {
    await loadUsers();
    createDate.value = datePicker.value;
    createModal.classList.remove("hidden");
  });

  // Submit create form
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      whatsapp_id: createUser.value,
      date: createDate.value,
    };

    if (createBreakfast.value === "true" || createBreakfast.checked) {
      payload.breakfast = true;
    }
    if (createLunch.value === "true" || createLunch.checked) {
      payload.lunch = true;
    }
    if (createDinner.value === "true" || createDinner.checked) {
      payload.dinner = true;
    }
    if (createCanceled.value === "true" || createCanceled.checked) {
      payload.canceled = true;
    }

    console.log("Creating", payload);

    showLoader();
    try {
      const res = await retryRequest(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      alert("✅ Order created");
      closeModal();
      fetchAndRender(datePicker.value);
    } catch (err) {
      alert(err.message);
    } finally {
      hideLoader();
    }
  });

  // ---------------- TABLE RENDER ----------------
  function renderOrders(orders) {
    tableBody.innerHTML = "";
    if (orders.length === 0) {
      noOrders.classList.remove("hidden");
      updateCountBox([]);
      return;
    }
    noOrders.classList.add("hidden");

    orders.forEach((order) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="User">${escapeHtml(order.username)}</td>
        <td data-label="Breakfast">${order.breakfast ? "✅" : "❌"}</td>
        <td data-label="Lunch">${order.lunch ? "✅" : "❌"}</td>
        <td data-label="Dinner">${order.dinner ? "✅" : "❌"}</td>
        <td data-label="Total">${order.total_amount ?? 0}</td>
        <td data-label="Cancelled">${order.canceled ? "✅" : "❌"}</td>
        <td data-label="Actions">
          <button class="edit-btn" data-id="${
            order.whatsapp_id
          }" data-action="edit">Edit</button>
          <button class="delete-btn" data-id="${
            order.whatsapp_id
          }" data-action="delete">Cancel</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Update count box with orders
    updateCountBox(orders);
  }

  // Escape HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});

/* CSS for loader */
const style = document.createElement("style");
style.textContent = `
#loaderOverlay {
  position: fixed;
  top:0;left:0;width:100%;height:100%;
  background: rgba(0,0,0,0.3);
  display: flex;align-items: center;justify-content: center;
  z-index: 9999;
  visibility: hidden;
}
#loaderOverlay.active { visibility: visible; }
.spinner {
  width: 50px;height: 50px;
  border: 6px solid #ddd;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
