// src/api/service.js

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const signup = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
};

export const login = async (creds) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || "Login failed");
  }
  return res.json(); // { access_token, role }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const fetchDashboardStats = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};

export const fetchUsersAdmin = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const fetchFraudRulesAdmin = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/fraud-rules`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch fraud rules");
  return res.json();
};

export const createFraudRule = async (ruleData) => {
  const res = await fetch(`${API_BASE_URL}/admin/fraud-rules`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(ruleData),
  });
  if (!res.ok) throw new Error("Failed to create fraud rule");
  return res.json();
};

export const fetchFraudLogsAdmin = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/fraud-logs`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch fraud logs");
  return res.json();
};

export const updateFraudAction = async ({ log_id, account_id, new_status }) => {
  const res = await fetch(`${API_BASE_URL}/admin/update-fraud-action`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ log_id, account_id, new_status }),
  });
  if (!res.ok) throw new Error("Failed to update fraud action");
  return res.json();
};

export const resolveFraud = async (logId) => {
  const res = await fetch(`${API_BASE_URL}/admin/resolve/${logId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to resolve fraud");
  return res.json();
};

// ─── USER ─────────────────────────────────────────────────────────────────────

export const fetchUserAccounts = async () => {
  const res = await fetch(`${API_BASE_URL}/user/accounts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch your accounts");
  return res.json();
};

export const createUserAccount = async () => {
  const res = await fetch(`${API_BASE_URL}/user/accounts`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to create account");
  return res.json();
};

export const deposit = async (acctId, amount) => {
  const res = await fetch(`${API_BASE_URL}/user/accounts/${acctId}/deposit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error("Deposit failed");
  return res.json();
};

export const withdraw = async (acctId, amount) => {
  const res = await fetch(`${API_BASE_URL}/user/accounts/${acctId}/withdraw`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error("Withdrawal failed");
  return res.json();
};

export const transfer = async (source_id, dest_id, amount) => {
  const res = await fetch(`${API_BASE_URL}/user/transfer`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ source_id, dest_id, amount }),
  });
  if (!res.ok) throw new Error("Transfer failed");
  return res.json();
};

export const fetchUserTransactions = async () => {
  const res = await fetch(`${API_BASE_URL}/user/transactions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch your transactions");
  return res.json();
};

// ─── LEGACY ALIASES ──────────────────────────────────────────────────────────
export const fetchUsers        = fetchUsersAdmin;
export const fetchAccounts     = fetchUserAccounts;      // was pointing at the old /accounts
export const fetchTransactions = fetchUserTransactions;   // now hits /user/transactions
export const fetchFraudRules   = fetchFraudRulesAdmin;
export const fetchFraudLogs    = fetchFraudLogsAdmin;
