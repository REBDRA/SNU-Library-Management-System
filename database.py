"""
database.py - SQLite Database management for College Library Management System
Handles schema creation, seed data initialization, and core data operations.
"""

import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'library.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        description TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        edition TEXT DEFAULT '1st Ed.',
        total_copies INTEGER NOT NULL DEFAULT 1,
        available_copies INTEGER NOT NULL DEFAULT 1,
        shelf_location TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        roll_no TEXT NOT NULL,
        student_dept TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        return_date TEXT,
        status TEXT NOT NULL CHECK(status IN ('ISSUED', 'RETURNED')),
        fine_amount REAL DEFAULT 0.0,
        notes TEXT,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
    """)

    conn.commit()

    # Check if departments exist, if not seed initial data
    cursor.execute("SELECT COUNT(*) FROM departments")
    if cursor.fetchone()[0] == 0:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    cursor = conn.cursor()

    # 1. Departments
    depts = [
        ("Computer Science & Engineering", "CSE", "bi-laptop", "Computer Science, AI, Cyber Security, Software Engineering"),
        ("Mechanical Engineering", "MECH", "bi-gear-wide-connected", "Thermodynamics, Robotics, Fluid Mechanics, Automobile"),
        ("Medical & Health Sciences", "MED", "bi-heart-pulse", "Human Anatomy, Physiology, Pathology, Pharmacology, Surgery"),
        ("Electrical & Electronics", "EEE", "bi-lightning-charge", "Circuits, Power Systems, Microprocessors, Control Systems"),
        ("Civil Engineering", "CIVIL", "bi-buildings", "Structural Analysis, Geotechnical, Surveying, Construction"),
        ("Basic Sciences & Humanities", "BSH", "bi-journal-bookmark", "Applied Mathematics, Engineering Physics, Chemistry")
    ]

    cursor.executemany(
        "INSERT INTO departments (name, code, icon, description) VALUES (?, ?, ?, ?)",
        depts
    )
    conn.commit()

    # Fetch department IDs
    cursor.execute("SELECT id, code FROM departments")
    dept_map = {row["code"]: row["id"] for row in cursor.fetchall()}

    # 2. Sample Books across Departments
    sample_books = [
        # CSE
        ("978-0262033848", "Introduction to Algorithms (CLRS)", "Thomas H. Cormen et al.", dept_map["CSE"], "4th Ed.", 5, 4, "Shelf CS-01"),
        ("978-1118063330", "Operating System Concepts", "Abraham Silberschatz, Peter Galvin", dept_map["CSE"], "10th Ed.", 4, 3, "Shelf CS-02"),
        ("978-0073523323", "Database System Concepts", "Abraham Silberschatz, Henry Korth", dept_map["CSE"], "7th Ed.", 6, 5, "Shelf CS-03"),
        ("978-0133594140", "Computer Networking: A Top-Down Approach", "James Kurose, Keith Ross", dept_map["CSE"], "8th Ed.", 4, 4, "Shelf CS-04"),
        ("978-0132350884", "Clean Code: A Handbook of Agile Software", "Robert C. Martin", dept_map["CSE"], "1st Ed.", 3, 2, "Shelf CS-05"),

        # MECH
        ("978-9352606429", "Engineering Thermodynamics", "P.K. Nag", dept_map["MECH"], "6th Ed.", 6, 5, "Shelf ME-01"),
        ("978-0195371239", "Theory of Machines and Mechanisms", "Joseph E. Shigley, John J. Uicker", dept_map["MECH"], "5th Ed.", 4, 4, "Shelf ME-02"),
        ("978-0073380322", "Fluid Mechanics: Fundamentals & Applications", "Yunus A. Cengel, John M. Cimbala", dept_map["MECH"], "4th Ed.", 5, 4, "Shelf ME-03"),
        ("978-0132272711", "Manufacturing Processes for Engineering Materials", "Serope Kalpakjian, Steven Schmid", dept_map["MECH"], "6th Ed.", 3, 3, "Shelf ME-04"),
        ("978-8187433545", "Strength of Materials", "S. Ramamrutham", dept_map["MECH"], "16th Ed.", 7, 6, "Shelf ME-05"),

        # MED
        ("978-0323393041", "Gray's Anatomy for Students", "Richard Drake, A. Wayne Vogl", dept_map["MED"], "4th Ed.", 5, 4, "Shelf MD-01"),
        ("978-1455770052", "Guyton and Hall Textbook of Medical Physiology", "John E. Hall, Michael E. Hall", dept_map["MED"], "14th Ed.", 5, 5, "Shelf MD-02"),
        ("978-1455726134", "Robbins and Cotran Pathologic Basis of Disease", "Vinay Kumar, Abul K. Abbas", dept_map["MED"], "10th Ed.", 4, 3, "Shelf MD-03"),
        ("978-1259644030", "Harrison's Principles of Internal Medicine", "J. Larry Jameson, Anthony Fauci", dept_map["MED"], "21st Ed.", 3, 2, "Shelf MD-04"),
        ("978-9350259375", "Essentials of Medical Pharmacology", "K.D. Tripathi", dept_map["MED"], "8th Ed.", 6, 6, "Shelf MD-05"),

        # EEE
        ("978-0199339136", "Microelectronic Circuits", "Adel S. Sedra, Kenneth C. Smith", dept_map["EEE"], "8th Ed.", 5, 4, "Shelf EE-01"),
        ("978-0073529547", "Electric Machinery Fundamentals", "Stephen J. Chapman", dept_map["EEE"], "5th Ed.", 4, 4, "Shelf EE-02"),
        ("978-0138147570", "Signals and Systems", "Alan V. Oppenheim, Alan S. Willsky", dept_map["EEE"], "2nd Ed.", 5, 5, "Shelf EE-03"),
        ("978-1118170519", "Control Systems Engineering", "Norman S. Nise", dept_map["EEE"], "7th Ed.", 4, 3, "Shelf EE-04"),

        # CIVIL
        ("978-8170088530", "Surveying (Vol I & II)", "B.C. Punmia, Ashok Kumar Jain", dept_map["CIVIL"], "16th Ed.", 5, 5, "Shelf CE-01"),
        ("978-0470556849", "Soil Mechanics and Foundations", "Muni Budhu", dept_map["CIVIL"], "3rd Ed.", 4, 4, "Shelf CE-02"),
        ("978-8187433231", "Design of Reinforced Concrete Structures", "S. Ramamrutham", dept_map["CIVIL"], "17th Ed.", 6, 5, "Shelf CE-03"),

        # BSH
        ("978-8193328491", "Higher Engineering Mathematics", "B.S. Grewal", dept_map["BSH"], "44th Ed.", 8, 7, "Shelf BSH-01"),
        ("978-0133978049", "University Physics with Modern Physics", "Hugh D. Young, Roger A. Freedman", dept_map["BSH"], "15th Ed.", 5, 5, "Shelf BSH-02")
    ]

    cursor.executemany(
        """
        INSERT INTO books (isbn, title, author, department_id, edition, total_copies, available_copies, shelf_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        sample_books
    )
    conn.commit()

    # 3. Sample Issues to demonstrate active & overdue states
    today = datetime.now()
    date_format = "%Y-%m-%d"

    # Fetch a few book IDs
    cursor.execute("SELECT id, title FROM books WHERE isbn = '978-0262033848'")  # Algorithms
    algo_book = cursor.fetchone()

    cursor.execute("SELECT id, title FROM books WHERE isbn = '978-1118063330'")  # OS
    os_book = cursor.fetchone()

    cursor.execute("SELECT id, title FROM books WHERE isbn = '978-9352606429'")  # Thermodynamics
    thermo_book = cursor.fetchone()

    cursor.execute("SELECT id, title FROM books WHERE isbn = '978-0323393041'")  # Gray's Anatomy
    anatomy_book = cursor.fetchone()

    cursor.execute("SELECT id, title FROM books WHERE isbn = '978-1455726134'")  # Robbins Pathology
    patho_book = cursor.fetchone()

    sample_issues = []
    if algo_book:
        # Normal active issue (due in 5 days)
        sample_issues.append((
            algo_book["id"], "Arpan Sharma", "CS23B104", "Computer Science",
            (today - timedelta(days=5)).strftime(date_format),
            (today + timedelta(days=9)).strftime(date_format),
            None, 'ISSUED', 0.0, "Semester project research"
        ))
    if os_book:
        # Overdue issue (due 3 days ago)
        sample_issues.append((
            os_book["id"], "Rohan Mehta", "CS23B082", "Computer Science",
            (today - timedelta(days=17)).strftime(date_format),
            (today - timedelta(days=3)).strftime(date_format),
            None, 'ISSUED', 15.0, "Needs reminder notification"
        ))
    if thermo_book:
        # Returned book
        sample_issues.append((
            thermo_book["id"], "Ananya Verma", "ME22B045", "Mechanical Engineering",
            (today - timedelta(days=20)).strftime(date_format),
            (today - timedelta(days=6)).strftime(date_format),
            (today - timedelta(days=7)).strftime(date_format),
            'RETURNED', 0.0, "Returned in mint condition"
        ))
    if anatomy_book:
        # Active medical issue
        sample_issues.append((
            anatomy_book["id"], "Priya Nair", "MD24M019", "Medical Sciences",
            (today - timedelta(days=3)).strftime(date_format),
            (today + timedelta(days=11)).strftime(date_format),
            None, 'ISSUED', 0.0, "Lab reference"
        ))

    cursor.executemany(
        """
        INSERT INTO issues (book_id, student_name, roll_no, student_dept, issue_date, due_date, return_date, status, fine_amount, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        sample_issues
    )
    conn.commit()

def calculate_overdue_fine(due_date_str, daily_rate=5.0):
    """Calculates fine for overdue books: rate = 5 currency units per day."""
    try:
        due = datetime.strptime(due_date_str, "%Y-%m-%d")
        today = datetime.now()
        overdue_days = (today - due).days
        if overdue_days > 0:
            return round(overdue_days * daily_rate, 2), overdue_days
        return 0.0, 0
    except Exception:
        return 0.0, 0
