document.addEventListener("DOMContentLoaded", async () => {
  // Check if student is logged in
  const studentData = JSON.parse(localStorage.getItem("studentData"));

  if (!studentData) {
    // No login data → redirect to login
    window.location.href = "student_login.html";
    return;
  }

  // Display student name
  const studentName = document.getElementById("studentName");
  if (studentName) {
    studentName.textContent = `Welcome, Student ${studentData.name}!`;
  }

  const studentCourse = document.getElementById("Course");
  if (studentCourse) {
    studentCourse.textContent = `Course: ${studentData.Course}`;
  }

  const studentId = studentData.id;

  // Load grades
  async function loadGrades(schoolYear = '', semester = '') {
    try {
      console.log("Loading grades with filters:", { schoolYear, semester });
      const tbody = document.querySelector("#gradesTable tbody");

      if (!schoolYear || !semester) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Please select both school year and semester to view grades.</td></tr>`;
        return;
      }

      let url = `/api/student/grades/${studentId}`;
      // Load all and filter client-side
      const res = await fetch(url);
      const data = await res.json();
      console.log("Received grades data:", data);

      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No grades available yet.</td></tr>`;
        return;
      }
      
      // colors
      function colorFinalGrade(grade) {
        if (!grade) return `<td style="color: gray;">N/A</td>`;

        const numeric = parseFloat(grade);

       if (numeric === 0 || numeric >= 4) {
        return `<td style="color: red; font-weight: bold;">${grade}</td>`;
      } else {  
        return `<td style="color: green; font-weight: bold;">${grade}</td>`;
      }
    }
    // colors
    function colorRemarks(remarks) {
      if (remarks === "Passed") {
          return `<td style="color: green; font-weight: bold;">${remarks}</td>`;
      } else if (remarks === "Failed"){
          return `<td style="color: red; font-weight: bold;">${remarks}</td>`;
      }else {
         return `<td style="color: gray; font-weight: bold;">${remarks}</td>.`.toUpperCase();
      }
    }

      // Filter by both schoolYear and semester
      let filteredData = data.filter(row => row.school_year === schoolYear && row.semester === semester);
      console.log("Filtered data:", filteredData);

      
       filteredData.forEach(row => {
      if (row.midterm_grade == 0) {
        row.midterm_grade = 'N/A';
      }
    });

      if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No grades found for the selected school year and semester.</td></tr>`;
        return;
      }

      tbody.innerHTML = filteredData
        .map(
          (row) => 
            `
        <tr>
          <td>${row.section || ''}</td>
          <td>${row.subject_code}</td>
          <td>${row.description}</td>
          <td>${row.instructor}</td>
          <td>${row.units}</td>
          <td>${row.midterm_grade || ''}</td>
          ${colorFinalGrade(row.final_grade)}
          ${colorRemarks(row.remarks)}
        </tr>
          `
        )
        .join("");
        
    } catch (error) {
      console.error("Error loading grades:", error);
    }
  }

      

  

  // Initialize button to load grades manually
  const initializeBtn = document.getElementById('initializeBtn');
  if (initializeBtn) {
    initializeBtn.addEventListener('click', () => {
      console.log("Initialize button clicked");
      const schoolYear = document.getElementById('school-year').value;
      const semester = document.getElementById('semester').value;
      if (!schoolYear || !semester) {
        alert("Please select school year and semester.");
        return;
      }
      loadGrades(schoolYear, semester);
    });
  }

  // Initialize table with instruction message
  const tbody = document.querySelector("#gradesTable tbody");
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Select school year and semester, then click Initialize to load grades.</td></tr>`;

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem("studentData");
      window.location.href = "student_login.html";
    });
  }

  // Reset password placeholder
  const resetPasswordBtn = document.getElementById('resetPasswordBtn');
  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', () => {
      alert("Reset password functionality not implemented yet.");
    });
  }

  // Grades will be loaded only after clicking Initialize
});