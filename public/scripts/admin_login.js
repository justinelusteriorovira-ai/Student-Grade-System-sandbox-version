// Example: scripts/student.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin", username, password }),
    });

    const data = await res.json();

    if (data.success) {
      msg.textContent = "✅ Login successful!";
      msg.style.color = "green";
      localStorage.setItem("adminData", JSON.stringify({ id: data.userId }));
      setTimeout(() => { window.location.href = "admin_dashboard.html"; }, 1000);
    } else {
      alert("❌ Invalid ID or password.");
      msg.textContent = "❌ Invalid ID or password.";
      msg.style.color = "red";
    }
  } catch (error) {
    msg.textContent = "⚠️ Server error. Please try again later.";
    msg.style.color = "orange";
  }
});