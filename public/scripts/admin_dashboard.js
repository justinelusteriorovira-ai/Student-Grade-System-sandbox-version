document.addEventListener("DOMContentLoaded", async () => {
  // 🔹 1. Check if admin is logged in
  const adminData = JSON.parse(localStorage.getItem("adminData"));

  if (!adminData) {
    // No login data → redirect to login
    window.location.href = "admin_login.html";
    return;
  }

  // 🔹 2. Show admin name on dashboard
  const adminName = document.getElementById("adminName");
  if (adminName) {
    adminName.textContent = `Welcome, Admin ${adminData.id}`;
  }

  const baseURL = "/api/admin";

  // ============================================================
  // ========== FUNCTIONS (ACCOUNT MANAGEMENT) ================
  // ============================================================

  // Load all accounts
  async function loadAccounts() {
    try {
      console.log("Loading accounts");
      const res = await fetch(`${baseURL}/accounts`);
      const data = await res.json();
      console.log("Fetched accounts data:", data);
      const tbody = document.querySelector("#accountsTable tbody");

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No accounts found.</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(
          (row) => `
        <tr>
          <td>${row.username}</td>
          <td>${row.full_name}</td>
          <td>${row.role}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="editAccount('${row.role}', '${row.username}')">Edit</button>
              <button class="btn-delete" onclick="deleteAccount('${row.role}', '${row.username}')">Delete</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  }

  // Load professors for assign select
  async function loadProfessors() {
    try {
      const res = await fetch(`${baseURL}/accounts`);
      const data = await res.json();
      const profSelect = document.getElementById('assignProf');
      profSelect.innerHTML = '';

      const professors = data.filter(row => row.role === 'professor');
      if (professors.length === 0) {
        profSelect.innerHTML = '<option value="" disabled selected>No professors available</option>';
      } else {
        profSelect.innerHTML = '<option value="" disabled selected>Select Professor</option>';
        professors.forEach(prof => {
          const option = document.createElement('option');
          option.value = prof.username;
          option.textContent = prof.full_name;
          profSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error loading professors:", error);
    }
  }

  // Load subjects for assign select
  async function loadSubjects() {
    try {
      const res = await fetch(`${baseURL}/subjects`);
      const data = await res.json();
      const subjSelect = document.getElementById('assignSubject');
      subjSelect.innerHTML = '';

      if (data.length === 0) {
        subjSelect.innerHTML = '<option value="" disabled selected>No subjects available</option>';
      } else {
        subjSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';
        data.forEach(subj => {
          const option = document.createElement('option');
          option.value = subj.subject_code;
          option.textContent = `${subj.subject_code} - ${subj.description}`;
          subjSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }

  // Load assignments
  async function loadAssignments() {
    try {
      const res = await fetch(`${baseURL}/assignments`);
      const data = await res.json();
      const tbody = document.querySelector("#assignmentsTable tbody");

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No assignments found.</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(
          (row) => `
        <tr>
          <td>${row.professor_name}</td>
          <td>${row.subject_code} - ${row.subject_description}</td>
          <td>${row.section}</td>
          <td>${row.school_year}</td>
          <td>${row.semester}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-delete" onclick="deleteAssignment(${row.id})">Delete</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
    // Refresh dropdowns to ensure they reflect current data
    await loadProfessors();
    await loadSubjects();
  }

  // Add professor
  const addProfessorBtn = document.getElementById("addProfessorBtn");
  if (addProfessorBtn) {
    addProfessorBtn.addEventListener("click", async () => {
      const username = document.getElementById("profUsername").value.trim();
      const password = document.getElementById("profPassword").value.trim();
      const full_name = document.getElementById("profFullName").value.trim();
      const department = document.getElementById("profDepartment").value.trim();

      if (!username || !password || !full_name || !department) {
        return alert("Please fill all fields for professor.");
      }

      try {
        const res = await fetch(`${baseURL}/add-professor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, full_name, department }),
        });
        const data = await res.json();
        alert(data.message);
        loadAccounts();
        // Clear fields
        document.getElementById("profUsername").value = "";
        document.getElementById("profPassword").value = "";
        document.getElementById("profFullName").value = "";
        document.getElementById("profDepartment").value = "";
      } catch (error) {
        console.error("Error adding professor:", error);
      }
    });
  }

  // Add student
  const addStudentBtn = document.getElementById("addStudentBtn");
  if (addStudentBtn) {
    addStudentBtn.addEventListener("click", async () => {
      const student_id = document.getElementById("studId").value.trim();
      const password = document.getElementById("studPassword").value.trim();
      const full_name = document.getElementById("studFullName").value.trim();
      const course = document.getElementById("studCourse").value.trim();
      const year_level = document.getElementById("studYear").value;
      const section = document.getElementById("studSection").value.trim();

      if (!student_id || !password || !full_name || !course || !year_level || !section) {
        return alert("Please fill all fields for student.");
      }

      try {
        const res = await fetch(`${baseURL}/add-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id, password, full_name, course, year_level, section }),
        });
        const data = await res.json();
        alert(data.message);
        loadAccounts();
        // Clear fields
        document.getElementById("studId").value = "";
        document.getElementById("studPassword").value = "";
        document.getElementById("studFullName").value = "";
        document.getElementById("studCourse").value = "";
        document.getElementById("studYear").value = "";
        document.getElementById("studSection").value = "";
      } catch (error) {
        console.error("Error adding student:", error);
      }
    });
  }

  // Edit account (placeholder - can be expanded)
  window.editAccount = async function (role, id) {
    const newName = prompt("Enter new full name: (e.g., Scarlet I. Johanson)");
    if (!newName) return;

    try {
      const endpoint = role === 'professor' ? `${baseURL}/edit-professor/${id}` : `${baseURL}/edit-student/${id}`;
      const body = role === 'professor' ? { full_name: newName, department: prompt("Enter new department: (e.g., College of Business and Management)") } : { full_name: newName, course: prompt("Enter new course: (e.g., Batchelor of Science eme eme)"), year_level: prompt("Enter new year level:"), section: prompt("Enter new section:") };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      alert(data.message);
      loadAccounts();
    } catch (error) {
      console.error("Error editing account:", error);
    }
  };

  // Delete account
  window.deleteAccount = async function (role, id) {
    if (!confirm(`Are you sure you want to delete this ${role} account?`)) return;

    try {
      const res = await fetch(`${baseURL}/delete/${role}/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      loadAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // Delete assignment
  window.deleteAssignment = async function (assignmentId) {
    if (!confirm("Are you sure you want to delete this assignment? This will also remove all related enrollments.")) return;

    try {
      const res = await fetch(`${baseURL}/delete-assignment/${assignmentId}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      await loadAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  // Assign professor to subject
  const assignBtn = document.getElementById('assignBtn');
  if (assignBtn) {
    assignBtn.addEventListener('click', async () => {
      const professor_id = document.getElementById('assignProf').value;
      const subject_code = document.getElementById('assignSubject').value;
      const section = document.getElementById('assignSection').value.trim();
      const school_year = document.getElementById('assignSchoolYear').value.trim();
      const semester = document.getElementById('assignSemester').value;

      if (!professor_id || !subject_code || !section || !school_year || !semester) {
        return alert("Please fill all fields for assignment.");
      }

      try {
        const res = await fetch(`${baseURL}/assign-professor-subject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ professor_id, subject_code, section, school_year, semester }),
        });
        const data = await res.json();
        alert(data.message);
        // Clear fields
        document.getElementById('assignProf').value = '';
        document.getElementById('assignSubject').value = '';
        document.getElementById('assignSection').value = '';
        document.getElementById('assignSchoolYear').value = '';
        document.getElementById('assignSemester').value = '';
        // Reload assignments
        await loadAssignments();
      } catch (error) {
        console.error("Error assigning:", error);
      }
    });
  }

  // Load subjects table
  async function loadSubjectsTable() {
    try {
      const res = await fetch(`${baseURL}/subjects`);
      const data = await res.json();
      const tbody = document.querySelector("#subjectsTable tbody");

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No subjects found.</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(
          (row) => `
        <tr>
          <td>${row.subject_code}</td>
          <td>${row.description}</td>
          <td>${row.units}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-delete" onclick="deleteSubject('${row.subject_code}')">Delete</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading subjects table:", error);
    }
  }

  // Delete subject
  window.deleteSubject = async function (subjectCode) {
    if (!confirm(`Are you sure you want to delete subject "${subjectCode}"? This will also remove all related assignments and enrollments.`)) return;

    try {
      const res = await fetch(`${baseURL}/delete-subject/${subjectCode}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      await loadSubjectsTable();
      await loadAssignments(); // Refresh assignments table as well
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  // Add subject
  const addSubjectBtn = document.getElementById('addSubjectBtn');
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', async () => {
      const subject_code = document.getElementById('subjCode').value.trim();
      const description = document.getElementById('subjDesc').value.trim();
      const units = document.getElementById('subjUnits').value;

      if (!subject_code || !description || !units) {
        return alert("Please fill all fields for subject.");
      }

      try {
        const res = await fetch(`${baseURL}/add-subject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject_code, description, units }),
        });
        const data = await res.json();
        alert(data.message);
        // Clear fields
        document.getElementById('subjCode').value = '';
        document.getElementById('subjDesc').value = '';
        document.getElementById('subjUnits').value = '';
        // Reload subjects for assign dropdown and table
        await loadSubjects();
        await loadSubjectsTable();
      } catch (error) {
        console.error("Error adding subject:", error);
      }
    });
  }

  // 🔹 3. Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("adminData");
      window.location.href = "admin_login.html";
    });
  }

  // 🔹 4. Reset password button (placeholder)
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener("click", () => {
      alert("Reset password functionality not implemented yet.");
    });
  }

  // 🔹 5. Finally, load accounts list when page loads
  await loadAccounts();
  await loadProfessors();
  await loadSubjects();
  await loadSubjectsTable();
  await loadAssignments();
});