const API_BASE_URL = "http://127.0.0.1:5000/api"; // Use IP 127.0.0.1 or localhost

export const fetchDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  return response.json();
};

export const fetchAccounts = async () => {
  const response = await fetch(`${API_BASE_URL}/accounts`);
  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  return response.json();
};

export const fetchFraudRules = async () => {
  const response = await fetch(`${API_BASE_URL}/fraud-rules`);
  return response.json();
};

export const fetchFraudLogs = async () => {
  const response = await fetch(`${API_BASE_URL}/fraud-logs`);
  return response.json();
};

export const resolveFraud = async (logId) => {
  const response = await fetch(`${API_BASE_URL}/resolve/${logId}`, {
    method: "POST",
  });
  return response.json();
};


export const createFraudRule = async (ruleData) => {
  const response = await fetch(`${API_BASE_URL}/fraud-rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ruleData),
  });
  return response.json();
};
