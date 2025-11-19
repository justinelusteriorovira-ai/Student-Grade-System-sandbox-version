import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// 🧱 DATABASE CONNECTION
// =====================================
const db = new sqlite3.Database('./school_portal.db', (err) => {
  if (err) {
    console.error("❌ SQLite connection failed:", err);
  } else {
    console.log("         / \\");
    console.log("        |\\_/|");
    console.log("        |---|");
    console.log("        |   |");
    console.log("        |   |");
    console.log("      _ |=-=| _");
    console.log("  _  / \\|   |/ \\");
    console.log(" / \\|   |   |   ||\\");
    console.log("|   |   |   |   | \\>");
    console.log("|   |   |   |   |   \\");
    console.log("| -   -   -   - |)   )");
    console.log("|                   /");
    console.log(" \\                 /");
    console.log("  \\               /");
    console.log("   \\             /");
    console.log("    \\           /");
    console.log("✅ SQLite connected successfully!");
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");
    // Initialize database if not exists
    const initSQL = fs.readFileSync('./init_db.sql', 'utf8');
    db.exec(initSQL, (err) => {
      if (err) {
        console.error("❌ Database initialization failed:", err);
      } else {
        console.log("✅ Database initialized!");
      }
    });
  }
});

// =====================================
// 🏠 DEFAULT ROUTE
// =====================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "student_login.html"));
});

// =====================================
// 🔐 LOGIN ROUTE
// =====================================
app.post("/login", (req, res) => {
  const { role, username, password } = req.body;
  console.log("Login attempt:", { role, username, password });
  const query =
    "SELECT * FROM users WHERE username = ? AND password = ? AND role = ?";
  db.all(query, [username, password, role], (err, results) => {
    if (err) {
      console.error("❌ Query error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    console.log("Query results:", results);
    if (results.length > 0) {
      console.log("Login successful for", role, username);
      if (role === 'professor') {
        // Fetch professor details
        const profQuery = "SELECT * FROM professors WHERE professor_id = ?";
        db.all(profQuery, [username], (err, profResults) => {
          if (err) {
            console.error("Error fetching professor data:", err);
            return res.status(500).json({ success: false, message: "Server error" });
          }
          if (profResults.length > 0) {
            return res.json({ success: true, professor: { id: profResults[0].professor_id, name: profResults[0].full_name } });
          } else {
            return res.json({ success: false, message: "Professor data not found" });
          }
        });
      } else if (role === 'student') {
        // Fetch student details
        const studentQuery = "SELECT * FROM students WHERE student_id = ?";
        db.all(studentQuery, [username], (err, studentResults) => {
          if (err) {
            console.error("Error fetching student data:", err);
            return res.status(500).json({ success: false, message: "Server error" });
          }
          if (studentResults.length > 0) {
            console.log("Fetched student data:", studentResults[0]);
            return res.json({ success: true, student: { id: studentResults[0].student_id, name: studentResults[0].name || studentResults[0].full_name, Course: studentResults[0].course } });
          } else {
            console.log("No student data found for", username);
            return res.json({ success: false, message: "Student data not found" });
          }
        });
      } else {
        return res.json({ success: true, role, userId: username });
      }
    } else {
      console.log("Login failed for", role, username);
      return res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// =====================================
// 👨‍🎓 STUDENT ROUTES
// =====================================

// Fetch student grades by student_id
app.get("/api/student/grades/:student_id", (req, res) => {
  const { student_id } = req.params;
  const sql = `
    SELECT s.student_id, s.full_name AS full_name, subj.subject_code, subj.description,
           p.full_name AS instructor, subj.units,
           e.midterm_grade, e.final_grade, e.remarks,
           ps.section, ps.school_year, ps.semester
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN professor_subjects ps ON e.prof_subject_id = ps.id
    JOIN professors p ON ps.professor_id = p.professor_id
    JOIN subjects subj ON ps.subject_code = subj.subject_code
    WHERE s.student_id = ?;
  `;

  db.all(sql, [student_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// =====================================
// 👨‍🏫 PROFESSOR ROUTES
// =====================================

// Get list of students under a specific professor
app.get("/api/professor/students/:professor_id", (req, res) => {
  const { professor_id } = req.params;
  console.log("Fetching students for professor:", professor_id);
  const sql = `
    SELECT e.id AS enrollment_id, s.student_id, s.full_name AS full_name, subj.subject_code, subj.description,
           ps.section, ps.school_year, ps.semester,
           e.midterm_grade, e.final_grade, e.remarks
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN professor_subjects ps ON e.prof_subject_id = ps.id
    JOIN subjects subj ON ps.subject_code = subj.subject_code
    WHERE ps.professor_id = ?;
  `;

  db.all(sql, [professor_id], (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: err });
    }
    console.log("Query results:", results);
    res.json(results);
  });
});

// Get assigned subjects for a professor
app.get("/api/professor/subjects/:professor_id", (req, res) => {
  const { professor_id } = req.params;
  const sql = `
    SELECT ps.subject_code, s.description, ps.section, ps.school_year, ps.semester
    FROM professor_subjects ps
    JOIN subjects s ON ps.subject_code = s.subject_code
    WHERE ps.professor_id = ?;
  `;

  db.all(sql, [professor_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Search for student by ID (for enrollment)
app.get("/api/professor/search/:student_id", (req, res) => {
  const { student_id } = req.params;
  const sql = "SELECT * FROM students WHERE student_id = ?";

  db.all(sql, [student_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Enroll a student to a professor’s subject
app.post("/api/professor/enroll", (req, res) => {
  const { student_id, prof_subject_id } = req.body;
  const sql = `
    INSERT INTO enrollments (student_id, prof_subject_id)
    VALUES (?, ?)
  `;
  db.run(sql, [student_id, prof_subject_id], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ Student enrolled successfully!" });
  });
});

// Update grades for an enrolled student
app.put("/api/professor/grades/:enrollment_id", (req, res) => {
  const { enrollment_id } = req.params;
  const { midterm_grade, final_grade, remarks } = req.body;

  const sql = `
    UPDATE enrollments
    SET midterm_grade = ?, final_grade = ?, remarks = ?
    WHERE id = ?
  `;
  db.run(sql, [midterm_grade, final_grade, remarks, enrollment_id], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ Grades updated successfully!" });
  });
});

// =====================================
// 👑 ADMIN ROUTES
// =====================================

// Get all accounts
app.get("/api/admin/accounts", (req, res) => {
  const sql = `
    SELECT u.username, u.role,
           CASE
             WHEN u.role = 'professor' THEN p.full_name
             WHEN u.role = 'student' THEN s.full_name
             ELSE 'N/A'
           END AS full_name
    FROM users u
    LEFT JOIN professors p ON u.username = p.professor_id AND u.role = 'professor'
    LEFT JOIN students s ON u.username = s.student_id AND u.role = 'student'
    WHERE u.role IN ('professor', 'student')
    ORDER BY u.role, u.username
  `;
  db.all(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add professor
app.post("/api/admin/add-professor", (req, res) => {
  const { username, password, full_name, department } = req.body;
  const userSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'professor')";
  db.run(userSql, [username, password], function(err) {
    if (err) return res.status(500).json({ error: err });
    const profSql = "INSERT INTO professors (professor_id, full_name, department) VALUES (?, ?, ?)";
    db.run(profSql, [username, full_name, department], function(err) {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Professor added successfully!" });
    });
  });
});

// Add student
app.post("/api/admin/add-student", (req, res) => {
  const { student_id, password, full_name, course, year_level, section } = req.body;
  const userSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'student')";
  db.run(userSql, [student_id, password], function(err) {
    if (err) return res.status(500).json({ error: err });
    const studSql = "INSERT INTO students (student_id, full_name, course, year_level, section) VALUES (?, ?, ?, ?, ?)";
    db.run(studSql, [student_id, full_name, course, year_level, section], function(err) {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Student added successfully!" });
    });
  });
});

// Edit professor
app.put("/api/admin/edit-professor/:username", (req, res) => {
  const { username } = req.params;
  const { full_name, department } = req.body;
  const sql = "UPDATE professors SET full_name = ?, department = ? WHERE professor_id = ?";
  db.run(sql, [full_name, department, username], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Professor updated successfully!" });
  });
});

// Edit student
app.put("/api/admin/edit-student/:student_id", (req, res) => {
  const { student_id } = req.params;
  const { full_name, course, year_level, section } = req.body;
  const sql = "UPDATE students SET full_name = ?, course = ?, year_level = ?, section = ? WHERE student_id = ?";
  db.run(sql, [full_name, course, year_level, section, student_id], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Student updated successfully!" });
  });
});

// Delete account
app.delete("/api/admin/delete/:role/:id", (req, res) => {
  const { role, id } = req.params;
  if (role === 'professor') {
    // Delete enrollments first
    const deleteEnrollmentsSql = `
      DELETE e FROM enrollments e
      JOIN professor_subjects ps ON e.prof_subject_id = ps.id
      WHERE ps.professor_id = ?
    `;
    db.run(deleteEnrollmentsSql, [id], function(err) {
      if (err) return res.status(500).json({ error: err });
      // Delete professor_subjects
      const deleteProfSubjectsSql = "DELETE FROM professor_subjects WHERE professor_id = ?";
      db.run(deleteProfSubjectsSql, [id], function(err) {
        if (err) return res.status(500).json({ error: err });
        // Delete from professors
        const deleteProfSql = "DELETE FROM professors WHERE professor_id = ?";
        db.run(deleteProfSql, [id], function(err) {
          if (err) return res.status(500).json({ error: err });
          // Delete from users
          const deleteUserSql = "DELETE FROM users WHERE username = ? AND role = ?";
          db.run(deleteUserSql, [id, role], function(err) {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Professor account deleted successfully!" });
          });
        });
      });
    });
  } else if (role === 'student') {
    // Delete enrollments
    const deleteEnrollmentsSql = "DELETE FROM enrollments WHERE student_id = ?";
    db.run(deleteEnrollmentsSql, [id], function(err) {
      if (err) return res.status(500).json({ error: err });
      // Delete from students
      const deleteStudSql = "DELETE FROM students WHERE student_id = ?";
      db.run(deleteStudSql, [id], function(err) {
        if (err) return res.status(500).json({ error: err });
          // Delete from users
          const deleteUserSql = "DELETE FROM users WHERE username = ? AND role = ?";
          db.run(deleteUserSql, [id, role], function(err) {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Student account deleted successfully!" });
          });
      });
    });
  } else {
    return res.status(400).json({ error: "Invalid role" });
  }
});

// Get all subjects
app.get("/api/admin/subjects", (req, res) => {
  const sql = "SELECT * FROM subjects";
  db.all(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Assign professor to subject
app.post("/api/admin/assign-professor-subject", (req, res) => {
  const { professor_id, subject_code, section, school_year, semester } = req.body;
  const sql = "INSERT INTO professor_subjects (professor_id, subject_code, section, school_year, semester) VALUES (?, ?, ?, ?, ?)";
  db.run(sql, [professor_id, subject_code, section, school_year, semester], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Professor assigned to subject successfully!" });
  });
});

// Add subject
app.post("/api/admin/add-subject", (req, res) => {
  const { subject_code, description, units } = req.body;
  const sql = "INSERT INTO subjects (subject_code, description, units) VALUES (?, ?, ?)";
  db.run(sql, [subject_code, description, units], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Subject added successfully!" });
  });
});

// Delete subject
app.delete("/api/admin/delete-subject/:subject_code", (req, res) => {
  const { subject_code } = req.params;
  // First delete enrollments for assignments with this subject
  const deleteEnrollmentsSql = `
    DELETE e FROM enrollments e
    JOIN professor_subjects ps ON e.prof_subject_id = ps.id
    WHERE ps.subject_code = ?
  `;
  db.run(deleteEnrollmentsSql, [subject_code], function(err) {
    if (err) return res.status(500).json({ error: err });
    // Then delete professor_subjects
    const deleteAssignmentsSql = "DELETE FROM professor_subjects WHERE subject_code = ?";
    db.run(deleteAssignmentsSql, [subject_code], function(err) {
      if (err) return res.status(500).json({ error: err });
      // Finally delete the subject
      const deleteSubjectSql = "DELETE FROM subjects WHERE subject_code = ?";
      db.run(deleteSubjectSql, [subject_code], function(err) {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Subject deleted successfully!" });
      });
    });
  });
});

// Get all assignments
app.get("/api/admin/assignments", (req, res) => {
  const sql = `
    SELECT ps.id, ps.professor_id, p.full_name AS professor_name,
           ps.subject_code, s.description AS subject_description,
           ps.section, ps.school_year, ps.semester
    FROM professor_subjects ps
    JOIN professors p ON ps.professor_id = p.professor_id
    JOIN subjects s ON ps.subject_code = s.subject_code
    ORDER BY p.full_name, ps.subject_code
  `;
  db.all(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Delete assignment
app.delete("/api/admin/delete-assignment/:assignment_id", (req, res) => {
  const { assignment_id } = req.params;
  // First delete enrollments
  const deleteEnrollmentsSql = "DELETE FROM enrollments WHERE prof_subject_id = ?";
  db.run(deleteEnrollmentsSql, [assignment_id], function(err) {
    if (err) return res.status(500).json({ error: err });
    // Then delete the assignment
    const deleteAssignmentSql = "DELETE FROM professor_subjects WHERE id = ?";
    db.run(deleteAssignmentSql, [assignment_id], function(err) {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Assignment deleted successfully!" });
    });
  });
});

// =====================================
//  START SERVER
// =====================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

// Delete enrollment (remove student from subject)
app.delete("/api/professor/enrollments/:enrollment_id", (req, res) => {
  const { enrollment_id } = req.params;
  const sql = "DELETE FROM enrollments WHERE id = ?";

  db.run(sql, [enrollment_id], function(err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "🗑️ Enrollment deleted successfully!" });
  });
});
// Get professor_subject_id by subject_code (for enrollment)
app.get("/api/getProfSubject/:subject_code", (req, res) => {
  const { subject_code } = req.params;
  const { prof } = req.query;
  const sql = "SELECT id FROM professor_subjects WHERE subject_code = ? AND professor_id = ?";
  db.all(sql, [subject_code, prof], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.json({});
    res.json(results[0]);
  });
});
