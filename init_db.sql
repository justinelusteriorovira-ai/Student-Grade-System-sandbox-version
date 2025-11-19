-- login
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'professor', 'student'))
);

-- enrolled students
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  course TEXT,
  year_level INTEGER,
  section TEXT
);

-- teachers
CREATE TABLE professors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professor_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT
);

-- subjects
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  units INTEGER NOT NULL
);


-- teacher assigned subjects
CREATE TABLE professor_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professor_id TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  section TEXT,
  school_year TEXT,
  semester TEXT CHECK (semester IN ('1st', '2nd', '3rd (Summer)')),
  FOREIGN KEY (professor_id) REFERENCES professors(professor_id),
  FOREIGN KEY (subject_code) REFERENCES subjects(subject_code)
);


-- 📝 ENROLLMENTS TABLE
-- (Links students → professor_subjects)
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  prof_subject_id INTEGER NOT NULL,
  midterm_grade REAL,
  final_grade REAL,
  remarks TEXT,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (prof_subject_id) REFERENCES professor_subjects(id)
);
