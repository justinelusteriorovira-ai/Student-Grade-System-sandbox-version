document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("professor-id").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "professor", username, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.success) {
      console.log("Login successful, storing data:", data.professor);
      msg.textContent = "✅ Login successful!";
      msg.style.color = "green";

      // 🔹 Store professor info (you can adjust the properties)
      localStorage.setItem("professorData", JSON.stringify({
        id: data.professor.id,
        name: data.professor.name,
        username: username
      }));

      setTimeout(() => {
        window.location.href = "professor_dashboard.html";
      }, 1000);
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
