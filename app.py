"""
app.py - Flask Web Application for College Library Management System
Provides complete REST API and serves responsive dashboard interface.
"""

from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import database

app = Flask(__name__)

# Ensure DB is initialized
database.init_db()

@app.route('/')
def index():
    return render_template('index.html')

# ----------------- API ENDPOINTS -----------------

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*), COALESCE(SUM(total_copies), 0), COALESCE(SUM(available_copies), 0) FROM books")
    book_stats = cursor.fetchone()
    total_titles = book_stats[0]
    total_copies = book_stats[1]
    available_copies = book_stats[2]
    issued_copies = total_copies - available_copies

    cursor.execute("SELECT COUNT(DISTINCT roll_no) FROM issues WHERE status = 'ISSUED'")
    active_borrowers = cursor.fetchone()[0]

    # Calculate active overdue count
    today_str = datetime.now().strftime('%Y-%m-%d')
    cursor.execute("SELECT COUNT(*) FROM issues WHERE status = 'ISSUED' AND due_date < ?", (today_str,))
    overdue_count = cursor.fetchone()[0]

    # Department wise counts
    cursor.execute("""
        SELECT d.id, d.name, d.code, d.icon,
               COUNT(b.id) as title_count,
               COALESCE(SUM(b.total_copies), 0) as total_copies,
               COALESCE(SUM(b.available_copies), 0) as available_copies
        FROM departments d
        LEFT JOIN books b ON d.id = b.department_id
        GROUP BY d.id
    """)
    departments_stats = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        "total_titles": total_titles,
        "total_copies": total_copies,
        "available_copies": available_copies,
        "issued_copies": issued_copies,
        "active_borrowers": active_borrowers,
        "overdue_count": overdue_count,
        "departments_stats": departments_stats
    })

@app.route('/api/departments', methods=['GET'])
def get_departments():
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.*, 
               COUNT(b.id) as book_count,
               COALESCE(SUM(b.total_copies), 0) as total_copies,
               COALESCE(SUM(b.available_copies), 0) as available_copies
        FROM departments d
        LEFT JOIN books b ON d.id = b.department_id
        GROUP BY d.id
        ORDER BY d.id ASC
    """)
    departments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(departments)

@app.route('/api/books', methods=['GET'])
def get_books():
    dept_id = request.args.get('department_id', type=int)
    search = request.args.get('search', '').strip()
    status = request.args.get('status', 'all')  # all, available, out_of_stock

    query = """
        SELECT b.*, d.name as department_name, d.code as department_code
        FROM books b
        JOIN departments d ON b.department_id = d.id
        WHERE 1=1
    """
    params = []

    if dept_id:
        query += " AND b.department_id = ?"
        params.append(dept_id)

    if search:
        query += " AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.shelf_location LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    if status == 'available':
        query += " AND b.available_copies > 0"
    elif status == 'out_of_stock':
        query += " AND b.available_copies = 0"

    query += " ORDER BY b.title ASC"

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    books = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(books)

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.*, d.name as department_name, d.code as department_code
        FROM books b
        JOIN departments d ON b.department_id = d.id
        WHERE b.id = ?
    """, (book_id,))
    book = cursor.fetchone()
    conn.close()
    if not book:
        return jsonify({"error": "Book not found"}), 404
    return jsonify(dict(book))

@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json() or {}
    isbn = data.get('isbn', '').strip()
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    dept_id = data.get('department_id')
    edition = data.get('edition', '1st Ed.').strip()
    total_copies = int(data.get('total_copies', 1))
    shelf = data.get('shelf_location', '').strip()

    if not isbn or not title or not author or not dept_id:
        return jsonify({"error": "ISBN, Title, Author and Department are required"}), 400

    if total_copies < 1:
        return jsonify({"error": "Total copies must be at least 1"}), 400

    conn = database.get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO books (isbn, title, author, department_id, edition, total_copies, available_copies, shelf_location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (isbn, title, author, dept_id, edition, total_copies, total_copies, shelf))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Book added successfully", "id": new_id}), 201
    except Exception as e:
        conn.close()
        if "UNIQUE constraint failed: books.isbn" in str(e):
            return jsonify({"error": "A book with this ISBN already exists"}), 400
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.get_json() or {}
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        return jsonify({"error": "Book not found"}), 404

    isbn = data.get('isbn', book['isbn']).strip()
    title = data.get('title', book['title']).strip()
    author = data.get('author', book['author']).strip()
    dept_id = data.get('department_id', book['department_id'])
    edition = data.get('edition', book['edition']).strip()
    new_total = int(data.get('total_copies', book['total_copies']))
    shelf = data.get('shelf_location', book['shelf_location']).strip()

    # Calculate new available copies based on issued delta
    issued_count = book['total_copies'] - book['available_copies']
    if new_total < issued_count:
        conn.close()
        return jsonify({
            "error": f"Cannot set total copies to {new_total}. Currently {issued_count} copies are issued to students."
        }), 400

    new_available = new_total - issued_count

    try:
        cursor.execute("""
            UPDATE books
            SET isbn = ?, title = ?, author = ?, department_id = ?, edition = ?, total_copies = ?, available_copies = ?, shelf_location = ?
            WHERE id = ?
        """, (isbn, title, author, dept_id, edition, new_total, new_available, shelf, book_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Book updated successfully"})
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        return jsonify({"error": "Book not found"}), 404

    # Check for active issues
    cursor.execute("SELECT COUNT(*) FROM issues WHERE book_id = ? AND status = 'ISSUED'", (book_id,))
    if cursor.fetchone()[0] > 0:
        conn.close()
        return jsonify({"error": "Cannot delete book while copies are currently issued to students"}), 400

    cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Book deleted successfully"})

@app.route('/api/issues', methods=['GET'])
def get_issues():
    status = request.args.get('status', 'all')  # all, ISSUED, RETURNED, OVERDUE
    search = request.args.get('search', '').strip()

    query = """
        SELECT i.*, b.title as book_title, b.isbn as book_isbn, b.shelf_location,
               d.name as department_name, d.code as department_code
        FROM issues i
        JOIN books b ON i.book_id = b.id
        JOIN departments d ON b.department_id = d.id
        WHERE 1=1
    """
    params = []

    today_str = datetime.now().strftime('%Y-%m-%d')

    if status == 'ISSUED':
        query += " AND i.status = 'ISSUED'"
    elif status == 'RETURNED':
        query += " AND i.status = 'RETURNED'"
    elif status == 'OVERDUE':
        query += " AND i.status = 'ISSUED' AND i.due_date < ?"
        params.append(today_str)

    if search:
        query += " AND (i.student_name LIKE ? OR i.roll_no LIKE ? OR b.title LIKE ? OR i.student_dept LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY CASE WHEN i.status = 'ISSUED' THEN 0 ELSE 1 END, i.due_date ASC"

    conn = database.get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()

    issues = []
    for row in rows:
        item = dict(row)
        # Compute dynamic fine if still issued
        if item['status'] == 'ISSUED':
            fine, overdue_days = database.calculate_overdue_fine(item['due_date'])
            item['calculated_fine'] = fine
            item['overdue_days'] = overdue_days
            item['is_overdue'] = overdue_days > 0
        else:
            item['calculated_fine'] = item['fine_amount']
            item['overdue_days'] = 0
            item['is_overdue'] = False
        issues.append(item)

    conn.close()
    return jsonify(issues)

@app.route('/api/issues', methods=['POST'])
def issue_book():
    data = request.get_json() or {}
    book_id = data.get('book_id')
    student_name = data.get('student_name', '').strip()
    roll_no = data.get('roll_no', '').strip()
    student_dept = data.get('student_dept', '').strip()
    issue_days = int(data.get('days', 14))
    notes = data.get('notes', '').strip()

    if not book_id or not student_name or not roll_no:
        return jsonify({"error": "Book, Student Name, and Roll Number are required"}), 400

    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT available_copies, title FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        return jsonify({"error": "Book not found"}), 404

    if book['available_copies'] <= 0:
        conn.close()
        return jsonify({"error": f"No copies of '{book['title']}' are currently available"}), 400

    # Verify student doesn't already have an unreturned copy of this exact book
    cursor.execute("""
        SELECT COUNT(*) FROM issues 
        WHERE book_id = ? AND roll_no = ? AND status = 'ISSUED'
    """, (book_id, roll_no))
    if cursor.fetchone()[0] > 0:
        conn.close()
        return jsonify({"error": f"Student {roll_no} already has an active issue for this book."}), 400

    now = datetime.now()
    issue_date = now.strftime('%Y-%m-%d')
    due_date = (now + timedelta(days=issue_days)).strftime('%Y-%m-%d')

    cursor.execute("""
        INSERT INTO issues (book_id, student_name, roll_no, student_dept, issue_date, due_date, status, fine_amount, notes)
        VALUES (?, ?, ?, ?, ?, ?, 'ISSUED', 0.0, ?)
    """, (book_id, student_name, roll_no, student_dept, issue_date, due_date, notes))

    # Decrement available copies
    cursor.execute("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", (book_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Book issued successfully", "due_date": due_date}), 201

@app.route('/api/issues/<int:issue_id>/return', methods=['POST'])
def return_book(issue_id):
    conn = database.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
    issue = cursor.fetchone()
    if not issue:
        conn.close()
        return jsonify({"error": "Issue record not found"}), 404

    if issue['status'] == 'RETURNED':
        conn.close()
        return jsonify({"error": "Book has already been returned"}), 400

    return_date = datetime.now().strftime('%Y-%m-%d')
    fine, _ = database.calculate_overdue_fine(issue['due_date'])

    cursor.execute("""
        UPDATE issues
        SET status = 'RETURNED', return_date = ?, fine_amount = ?
        WHERE id = ?
    """, (return_date, fine, issue_id))

    # Increment available copies
    cursor.execute("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", (issue['book_id'],))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Book returned successfully",
        "return_date": return_date,
        "fine_amount": fine
    })

if __name__ == '__main__':
    print("======================================================")
    print("      SNU LIBRARY MANAGEMENT SYSTEM - SERVER STARTED  ")
    print("  Access Web App at: http://127.0.0.1:5000            ")
    print("======================================================")
    app.run(host='0.0.0.0', port=5000, debug=True)
