import os
import psycopg2
from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
jwt = JWTManager(app)

# ─── CORS & PRE-FLIGHT ────────────────────────────────────────────────────────
@app.after_request
def apply_cors(resp):
    resp.headers["Access-Control-Allow-Origin"]  = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return resp

@app.route("/api/<path:any>", methods=["OPTIONS"])
def preflight(any):
    return jsonify({}), 200

# ─── DATABASE ────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:hannan@localhost:5432/check12"
)
def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

# ─── ROLE GUARD ──────────────────────────────────────────────────────────────
def role_required(role):
    def decorator(fn):
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") != role:
                return jsonify({"msg": "Forbidden"}), 403
            return fn(*args, **kwargs)
        wrapper.__name__ = fn.__name__
        return wrapper
    return decorator

# ─── AUTH ────────────────────────────────────────────────────────────────────
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    u, e, p = data.get("username"), data.get("email"), data.get("password")
    if not all([u, e, p]):
        return jsonify({"msg": "Missing signup fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO Users (username, email, role, password) VALUES (%s, %s, %s, %s)",
            (u, e, "user", p)
        )
        conn.commit()
    except psycopg2.Error as err:
        conn.rollback()
        return jsonify({"msg": "DB error", "error": str(err)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"msg": "User created"}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    u, p = data.get("username"), data.get("password")
    if not all([u, p]):
        return jsonify({"msg": "Missing login fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT user_id, role, password FROM Users WHERE username = %s",
        (u,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or user["password"] != p:
        return jsonify({"msg": "Bad credentials"}), 401

    token = create_access_token(
      identity=str(user["user_id"]),
      additional_claims={"role": user["role"]}
    )
    return jsonify({"access_token": token, "role": user["role"]}), 200
# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
@app.route("/api/admin/users", methods=["GET"])
@role_required("admin")
def list_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT user_id, username, email, role FROM Users;")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users), 200

@app.route("/api/admin/dashboard", methods=["GET"])
@role_required("admin")
def admin_dashboard():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS total_users FROM Users;")
    total_users = cur.fetchone()["total_users"]
    cur.execute("SELECT COUNT(*) AS total_tx FROM Transactions;")
    total_tx = cur.fetchone()["total_tx"]
    cur.execute("SELECT COUNT(*) AS fraud_incidents FROM TransactionLogs WHERE status='pending';")
    fraud_incidents = cur.fetchone()["fraud_incidents"]
    cur.close()
    conn.close()
    return jsonify({
        "total_users":        total_users,
        "total_transactions": total_tx,
        "fraud_incidents":    fraud_incidents
    }), 200

@app.route("/api/admin/fraud-rules", methods=["GET"])
@role_required("admin")
def get_fraud_rules_admin():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM FraudRules WHERE active = TRUE;")
    rules = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rules), 200

@app.route("/api/admin/fraud-rules", methods=["POST"])
@role_required("admin")
def create_fraud_rule_admin():
    data = request.get_json() or {}
    required = ["rule_name", "action", "risk_level", "precedence"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO FraudRules
          (rule_name, rule_description, action, risk_level, precedence)
        VALUES (%s, %s, %s, %s, %s);
        """,
        (
          data["rule_name"],
          data.get("rule_description", ""),
          data["action"],
          data["risk_level"],
          data["precedence"]
        )
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Fraud rule created"}), 201

@app.route("/api/admin/fraud-logs", methods=["GET"])
@role_required("admin")
def get_fraud_logs_admin():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      """
      SELECT
        f.log_id,
        f.transaction_id,
        t.account_id,
        f.detected_rule,
        f.status,
        f.created_at,
        t.amount,
        t.transaction_time
      FROM TransactionLogs f
      LEFT JOIN Transactions t
        ON f.transaction_id = t.transaction_id
      WHERE f.status = 'pending'
      ORDER BY t.account_id, f.created_at DESC;
      """
    )
    logs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(logs), 200

@app.route("/api/admin/update-fraud-action", methods=["POST"])
@role_required("admin")
def update_fraud_action_admin():
    data = request.get_json() or {}
    if not all(data.get(k) for k in ("log_id", "account_id", "new_status")):
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      "UPDATE TransactionLogs SET status = %s WHERE log_id = %s;",
      (data["new_status"], data["log_id"])
    )
    cur.execute(
      "UPDATE Accounts SET account_status = %s WHERE account_id = %s;",
      (data["new_status"], data["account_id"])
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Action updated"}), 200

@app.route("/api/admin/resolve/<int:log_id>", methods=["POST"])
@role_required("admin")
def resolve_fraud_admin(log_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      "UPDATE TransactionLogs SET status='resolved' WHERE log_id = %s;",
      (log_id,)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Resolved"}), 200

# ─── USER ROUTES ─────────────────────────────────────────────────────────────
@app.route("/api/user/accounts", methods=["GET"])
@role_required("user")
def user_accounts():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      """
      SELECT account_id, account_number, balance,
             account_status, risk_level, created_at
      FROM Accounts
      WHERE user_id = %s
      ORDER BY created_at DESC;
      """,
      (user_id,)
    )
    accts = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(accts), 200

@app.route("/api/user/accounts", methods=["POST"])
@role_required("user")
def create_account():
    user_id = int(get_jwt_identity())
    acct_no = f"ACC{user_id}{int.from_bytes(os.urandom(2), 'big')}"
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      """
      INSERT INTO Accounts (user_id, account_number, balance)
      VALUES (%s, %s, 0.00)
      RETURNING account_id, account_number, balance,
                account_status, risk_level, created_at;
      """,
      (user_id, acct_no)
    )
    acct = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(acct), 201

@app.route("/api/user/accounts/<int:acct_id>/deposit", methods=["POST"])
@role_required("user")
def deposit(acct_id):
    user_id = int(get_jwt_identity())
    amount = request.json.get("amount", 0)
    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      "SELECT balance FROM Accounts WHERE account_id = %s AND user_id = %s;",
      (acct_id, user_id)
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify({"msg": "Not found"}), 404

    new_bal = row["balance"] + amount
    cur.execute(
      "UPDATE Accounts SET balance = %s WHERE account_id = %s;",
      (new_bal, acct_id)
    )
    cur.execute(
      """
      INSERT INTO Transactions
        (account_id, transaction_type, amount, details)
      VALUES (%s, 'deposit', %s, 'User deposit')
      RETURNING *;
      """,
      (acct_id, amount)
    )
    tx = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(tx), 201

@app.route("/api/user/accounts/<int:acct_id>/withdraw", methods=["POST"])
@role_required("user")
def withdraw(acct_id):
    user_id = int(get_jwt_identity())
    amount = request.json.get("amount", 0)
    if amount <= 0:
        return jsonify({"msg": "Invalid amount"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      "SELECT balance FROM Accounts WHERE account_id = %s AND user_id = %s;",
      (acct_id, user_id)
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify({"msg": "Not found"}), 404
    if row["balance"] < amount:
        cur.close()
        conn.close()
        return jsonify({"msg": "Insufficient funds"}), 400

    new_bal = row["balance"] - amount
    cur.execute(
      "UPDATE Accounts SET balance = %s WHERE account_id = %s;",
      (new_bal, acct_id)
    )
    cur.execute(
      """
      INSERT INTO Transactions
        (account_id, transaction_type, amount, details)
      VALUES (%s, 'withdrawal', %s, 'User withdrawal')
      RETURNING *;
      """,
      (acct_id, amount)
    )
    tx = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(tx), 201

@app.route("/api/user/transfer", methods=["POST"])
@role_required("user")
def transfer():
    user_id = int(get_jwt_identity())

    data = request.json or {}
    src = data.get("source_id")
    dst = data.get("dest_id")
    amount = data.get("amount", 0)
    if amount <= 0 or not all([src, dst]):
        return jsonify({"msg": "Invalid transfer"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
      "SELECT balance FROM Accounts WHERE account_id = %s AND user_id = %s;",
      (src, user_id)
    )
    row = cur.fetchone()
    if not row or row["balance"] < amount:
        cur.close()
        conn.close()
        return jsonify({"msg": "Invalid source/insufficient funds"}), 400

    cur.execute("UPDATE Accounts SET balance = balance - %s WHERE account_id = %s;", (amount, src))
    cur.execute("UPDATE Accounts SET balance = balance + %s WHERE account_id = %s;", (amount, dst))
    cur.execute(
      """
      INSERT INTO Transactions
        (account_id, transaction_type, amount, details)
      VALUES
        (%s, 'transfer_out', %s, 'To %s'),
        (%s, 'transfer_in',  %s, 'From %s')
      RETURNING *;
      """,
      (src, amount, dst, dst, amount, src)
    )
    txs = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(txs), 201

# ─── PUBLIC TRANSACTIONS ─────────────────────────────────────────────────────
@app.route("/api/transactions", methods=["GET"])
def public_transactions():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
      SELECT
        t.transaction_id,
        a.account_id,
        t.transaction_type,
        t.amount,
        t.transaction_time,
        t.details
      FROM Transactions t
      JOIN Accounts a ON t.account_id = a.account_id;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows), 200

# ─── USER TRANSACTIONS ───────────────────────────────────────────────────────
@app.route("/api/user/transactions", methods=["GET"])
@role_required("user")
def user_transactions():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
      SELECT
        t.transaction_id,
        t.account_id,
        t.transaction_type,
        t.amount,
        t.transaction_time,
        t.details
      FROM Transactions t
      JOIN Accounts a ON t.account_id = a.account_id
      WHERE a.user_id = %s
      ORDER BY t.transaction_time DESC;
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows), 200

if __name__ == "__main__":
    app.run(debug=True)
