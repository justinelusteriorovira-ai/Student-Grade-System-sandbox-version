document.addEventListener("DOMContentLoaded", async () => {
  // 🔹 1. Check if professor is logged in
  const profData = JSON.parse(localStorage.getItem("professorData"));

  if (!profData) {
    // No login data → redirect to login
    window.location.href = "professor_login.html";
    return;
  }

  // 🔹 2. Show professor name on dashboard
  const profName = document.getElementById("profName");
  if (profName) {
    profName.textContent = `Welcome, Professor ${profData.name}!`;
  }

  // 🔹 3. Replace hardcoded professorId with dynamic one
  const professorId = profData.id || profData.username;
  const baseURL = "/api/professor";

  // ============================================================
  // ========== FUNCTIONS (CRUD + ENROLLMENT MANAGEMENT) ========
  // ============================================================

  // Load all students under this professor
  async function loadStudents() {
    try {
      console.log("Loading students for professor:", professorId);
      const res = await fetch(`${baseURL}/students/${professorId}`);
      const data = await res.json();
      console.log("Fetched students data:", data);
      const tbody = document.querySelector("#studentsTable tbody");

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No students enrolled yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(
          (row) => `
        <tr>
          <td>${row.student_id}</td>
          <td>${row.full_name}</td>
          <td>${row.subject_code}</td>
          <td>${row.description}</td>
          <td><input type="number" step="0.01" id="mid-${row.enrollment_id}" value="${
            row.midterm_grade || ""
          }"></td>
          <td><input type="number" step="0.01" id="fin-${row.enrollment_id}" value="${
            row.final_grade || ""
          }"></td>
          <td><input type="text" id="rem-${row.enrollment_id}" value="${(row.remarks || "")}"></td>
          }"></td>
          <td>
            <div class="action-buttons">
              <button class="btn-save" onclick="updateGrade(${row.enrollment_id})">Save</button>
              <button class="btn-delete" onclick="deleteEnrollment(${row.enrollment_id})">Delete</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading students:", error);
    }
  }

  // Load assigned subjects for this professor
  async function loadSubjects() {
    try {
      console.log("Loading subjects for professor:", professorId);
      const res = await fetch(`${baseURL}/subjects/${professorId}`);
      const data = await res.json();
      console.log("Fetched subjects data:", data);
      const tbody = document.querySelector("#subjectsTable tbody");

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No subjects assigned yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(
          (row) => `
        <tr>
          <td>${row.subject_code}</td>
          <td>${row.description}</td>
          <td>${row.section}</td>
          <td>${row.school_year}</td>
          <td>${row.semester}</td>
        </tr>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }

  // Update grade for student
  window.updateGrade = async function (enrollmentId) {
    const midterm_grade = document.getElementById(`mid-${enrollmentId}`).value;
    const final_grade = document.getElementById(`fin-${enrollmentId}`).value;
    const remarks = document.getElementById(`rem-${enrollmentId}`).value;

    try {
      const res = await fetch(`${baseURL}/grades/${enrollmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ midterm_grade, final_grade, remarks }),
      });
      const data = await res.json();
      alert(data.message || "Grade updated!");
      loadStudents();
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  // Delete enrollment
  window.deleteEnrollment = async function (enrollmentId) {
    if (!confirm("Are you sure you want to delete this enrollment?")) return;

    try {
      const res = await fetch(`${baseURL}/enrollments/${enrollmentId}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      loadStudents();
    } catch (error) {
      console.error("Error deleting enrollment:", error);
    }
  };

  // Search student by ID
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
      const studentId = document.getElementById("studentSearch").value.trim();
      if (!studentId) return alert("Please enter a student ID.");

      const res = await fetch(`${baseURL}/search/${studentId}`);
      const data = await res.json();

      if (data.length === 0) alert("Student not found!");
      else alert(`Found: ${data[0].full_name} (${data[0].course})`);
    });
  }

  // Enroll student to subject
  const enrollBtn = document.getElementById("enrollBtn");
  if (enrollBtn) {
    enrollBtn.addEventListener("click", async () => {
      const student_id = document.getElementById("enrollId").value.trim();
      const subject_code = document.getElementById("subjectCode").value.trim();

      if (!student_id || !subject_code) return alert("Please fill both Student ID and Subject Code!");

      try {
        // Step 1: Get professor_subject_id by subject_code (based on this professor)
        const getProfSubject = await fetch(`/api/getProfSubject/${subject_code}?prof=${professorId}`);
        const subjectData = await getProfSubject.json();

        if (!subjectData.id) return alert("❌ Subject not found or not assigned to you.");

        const prof_subject_id = subjectData.id;

        // Step 2: Enroll student
        const res = await fetch(`${baseURL}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id, prof_subject_id }),
        });

        const data = await res.json();
        alert(data.message);
        loadStudents();
      } catch (error) {
        console.error("Error enrolling student:", error);
      }
    });
  }

  // 🔹 4. Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("professorData");
      window.location.href = "professor_login.html";
    });
  }

  // 🔹 5. Finally, load subjects and students list when page loads
  await loadSubjects();
  await loadStudents();
});
