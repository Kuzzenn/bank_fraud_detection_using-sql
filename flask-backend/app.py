from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__)
CORS(app)

# Example connection string; update with your PostgreSQL credentials
DATABASE_URL = os.environ.get("DATABASE_URL", "dbname=practice user=postgres password=3783 host=localhost")

@app.route('/')
def index():
    return "Welcome to the Banking Fraud Detection System API"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS total_users FROM Users;")
    total_users = cur.fetchone()["total_users"]

    cur.execute("SELECT COUNT(*) AS total_transactions FROM Transactions;")
    total_transactions = cur.fetchone()["total_transactions"]

    cur.execute("SELECT COUNT(*) AS fraud_incidents FROM TransactionLogs WHERE status='pending';")
    fraud_incidents = cur.fetchone()["fraud_incidents"]

    cur.close()
    conn.close()

    stats = {
        "total_users": total_users,
        "total_transactions": total_transactions,
        "fraud_incidents": fraud_incidents
    }
    return jsonify(stats)

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT user_id, username, email, role FROM Users;")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users)

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Accounts;")
    accounts = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(accounts)

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT t.transaction_id, a.account_id, t.transaction_type, t.amount, t.transaction_time, t.details
        FROM Transactions t
        JOIN Accounts a ON t.account_id = a.account_id;
    """)
    transactions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(transactions)

@app.route('/api/fraud-rules', methods=['GET'])
def get_fraud_rules():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM FraudRules WHERE active = TRUE;")
    rules = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rules)

@app.route('/api/fraud-rules', methods=['POST'])
def create_fraud_rule():
    data = request.get_json()
    rule_name = data.get('rule_name')
    rule_description = data.get('rule_description')
    action = data.get('action')
    risk_level = data.get('risk_level')
    precedence = data.get('precedence')

    if not all([rule_name, action, risk_level, precedence]):
        return jsonify({"error": "Missing required fields."}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO FraudRules (rule_name, rule_description, action, risk_level, precedence)
        VALUES (%s, %s, %s, %s, %s);
    """, (rule_name, rule_description, action, risk_level, precedence))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Fraud rule created successfully."})


@app.route('/api/fraud-logs', methods=['GET'])
def get_fraud_logs():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            f.log_id,
            f.transaction_id,
            COALESCE(t.account_id, 0) AS account_id,  -- make sure if missing, 0 is returned
            f.rule_id,
            f.detected_rule,
            f.status,
            f.created_at,
            t.amount,
            t.transaction_time 
        FROM TransactionLogs f
        LEFT JOIN Transactions t ON f.transaction_id = t.transaction_id;
    """)
    fraud_logs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(fraud_logs)



@app.route('/api/update-fraud-action', methods=['POST'])
def update_fraud_action():
    data = request.get_json()
    log_id = data.get('log_id')
    account_id = data.get('account_id')
    new_status = data.get('new_status')

    if not all([log_id, account_id, new_status]):
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Update FraudLogs
    cur.execute("""
        UPDATE TransactionLogs
        SET status = %s
        WHERE log_id = %s;
    """, (new_status, log_id))

    # Update Accounts
    cur.execute("""
        UPDATE Accounts
        SET account_status = %s
        WHERE account_id = %s;
    """, (new_status, account_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Fraud action updated successfully."})




@app.route('/api/resolve/<int:log_id>', methods=['POST'])
def resolve_fraud(log_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE TransactionLogs SET status='resolved' WHERE log_id = %s;", (log_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Fraud incident marked as resolved."})

if __name__ == '__main__':
    app.run(debug=True)
