# SNU Library - Management System

A modern, full-stack **SNU Library Management System** built with **Python (Flask)**, **SQLite**, and a responsive web dashboard designed specifically for academic institutions.

---

## 🌟 Key Features

1. **Department-Wise Book Organization**:
   - Books organized into college academic streams:
     - **Computer Science & Engineering (CSE)**
     - **Mechanical Engineering (MECH)**
     - **Medical & Health Sciences (MED)**
     - **Electrical & Electronics (EEE)**
     - **Civil Engineering (CIVIL)**
     - **Basic Sciences & Humanities (BSH)**
   - Custom shelf/rack locator (e.g. `Shelf CS-01`, `Shelf MD-03`)
   - Pre-populated with authentic college standard textbooks for all departments.

2. **Complete Book Inventory Management**:
   - Add new books with ISBN, Title, Author, Department, Edition, Total Copies, and Shelf Location.
   - Edit book details and manage total copy counts.
   - Delete books (with safety check preventing deletion if copies are actively borrowed).
   - Real-time stock availability badges (**Available** / **Out of Stock**).

3. **Student Book Issue & Return Tracking**:
   - Issue books to students with Student Name, Roll Number, Department, and loan duration (7, 14, 21, 30 days).
   - Real-time tracking of active loans and due dates.
   - Automatic overdue detection and daily fine calculation (₹5/day).
   - 1-click Book Return modal with fine settlement and automatic copy restock.

4. **Real-time Analytics Dashboard**:
   - Total Titles, Total Copies, Available Copies, Issued Books, Active Borrowers, and Overdue Returns.
   - Department overview cards showing live available vs. total counts.
   - Quick action shortcuts for instant book issuing and catalog additions.

5. **Search & Dynamic Filters**:
   - Instant search across Book Titles, Authors, ISBNs, Shelf Locations, and Student Roll Numbers.
   - Filter catalog by department tabs and stock status.

---

## 📂 Project Architecture

```
Python Library Management System/
├── app.py                  # Flask Application & REST API Endpoints
├── database.py             # SQLite Schema, connection pool, seed data & fine calculation
├── library.db              # SQLite Database (auto-generated & seeded on first launch)
├── run.bat                 # 1-Click Windows Launcher
├── templates/
│   └── index.html          # Responsive Single-Page Application interface
└── static/
    ├── css/
    │   └── style.css       # Custom Glassmorphic Dark UI design system
    └── js/
        └── app.js          # Interactive frontend controller & API client
```

---

## 🚀 How to Run

### Method 1: Using the 1-Click Launcher (Windows)
Double-click [`run.bat`](file:///c:/B.Tech/Python%20Library%20Management%20System/run.bat).

### Method 2: From the Terminal
```powershell
# Navigate to the project directory
cd "c:\B.Tech\Python Library Management System"

# Run with Python
python app.py
```
*(If `python` is aliased in your user profile, use `& "C:\Users\arpan\AppData\Local\Python\bin\python.exe" app.py`)*

Once running, open your browser and navigate to:
👉 **`http://127.0.0.1:5000`**

---

## 🗄️ Database Schema

### `departments`
- `id` (Primary Key)
- `name` (e.g. Mechanical Engineering)
- `code` (e.g. MECH)
- `icon` (Bootstrap Icon name)
- `description`

### `books`
- `id` (Primary Key)
- `isbn` (Unique)
- `title`, `author`, `edition`
- `department_id` (Foreign Key -> `departments.id`)
- `total_copies`, `available_copies`
- `shelf_location`
- `created_at`

### `issues`
- `id` (Primary Key)
- `book_id` (Foreign Key -> `books.id`)
- `student_name`, `roll_no`, `student_dept`
- `issue_date`, `due_date`, `return_date`
- `status` (`ISSUED` / `RETURNED`)
- `fine_amount`, `notes`
