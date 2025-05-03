import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { fetchDashboardStats } from "../api/service";

const darkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  highlight: "#BB86FC",
};

const Dashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDashboardStats().then((data) => setStats(data));
  }, []);

  return (
    <Box
      p={3}
      sx={{
        backgroundColor: darkTheme.background,
        minHeight: "100vh",
        color: darkTheme.textPrimary,
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={4}
            sx={{
              backgroundColor: darkTheme.card,
              color: darkTheme.textPrimary,
              transition: "transform 0.3s",
              ":hover": { transform: "scale(1.02)" },
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                style={{ color: darkTheme.textSecondary }}
                gutterBottom
              >
                Total Users
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.total_users || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={4}
            sx={{
              backgroundColor: darkTheme.card,
              color: darkTheme.textPrimary,
              transition: "transform 0.3s",
              ":hover": { transform: "scale(1.02)" },
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                style={{ color: darkTheme.textSecondary }}
                gutterBottom
              >
                Transactions
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.total_transactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={4}
            sx={{
              backgroundColor: darkTheme.card,
              color: darkTheme.textPrimary,
              transition: "transform 0.3s",
              ":hover": { transform: "scale(1.02)" },
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                style={{ color: darkTheme.highlight }}
                gutterBottom
              >
                Fraud Incidents
              </Typography>
              <Typography variant="h4" fontWeight={700} color="error">
                {stats.fraud_incidents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
