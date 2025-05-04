// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { fetchDashboardStats } from "../api/service";

const darkTheme = {
  background:     "#121212",
  card:           "#1E1E1E",
  textPrimary:    "#FFFFFF",
  textSecondary:  "#B0B0B0",
  highlight:      "#BB86FC",
};

export default function Dashboard() {
  const [stats,  setStats]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadStats = () => {
    setLoading(true);
    setError(null);
    fetchDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={loadStats}>
          Retry
        </Button>
      </Box>
    );
  }

  // At this point stats is guaranteed to be non-null
  const { total_users, total_transactions, fraud_incidents } = stats;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: darkTheme.background,
        minHeight: "100vh",
        color: darkTheme.textPrimary,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          onClick={loadStats}
          sx={{ color: darkTheme.textPrimary, borderColor: darkTheme.textSecondary }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {[
          {
            label: "Total Users",
            value: total_users,
            subtitleColor: darkTheme.textSecondary,
          },
          {
            label: "Transactions",
            value: total_transactions,
            subtitleColor: darkTheme.textSecondary,
          },
          {
            label: "Fraud Incidents",
            value: fraud_incidents,
            subtitleColor: darkTheme.highlight,
            valueColor: "error.main",
          },
        ].map(({ label, value, subtitleColor, valueColor }, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card
              elevation={4}
              sx={{
                backgroundColor: darkTheme.card,
                color: darkTheme.textPrimary,
                borderRadius: 3,
                transition: "transform 0.3s",
                ":hover": { transform: "scale(1.02)" },
              }}
              aria-label={label}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: subtitleColor }}
                >
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: valueColor }}>
                  {value ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
