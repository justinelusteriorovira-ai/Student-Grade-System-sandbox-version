document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("student-id").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "student", username, password }),
    });

    const data = await res.json();
    console.log("Student login response:", data);

    if (data.success) {
      // Store student info
      localStorage.setItem("studentData", JSON.stringify({
        id: data.student.id,
        name: data.student.name,
        Course: data.student.Course
      }));
      msg.textContent = "✅ Login successful!";
      msg.style.color = "green";
      setTimeout(() => { window.location.href = "student_dashboard.html"; }, 1000);
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

function logout() {
  localStorage.removeItem('studentId');
  window.location.href = 'student_login.html';
}
