import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { fetchDashboardStats } from "../api/service";

const Dashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDashboardStats().then((data) => setStats(data));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Use sx for responsive widths */}
        <Grid item sx={{ width: { xs: "100%", md: "33.33%" } }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Total Users</Typography>
              <Typography variant="h5">{stats.total_users || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sx={{ width: { xs: "100%", md: "33.33%" } }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Transactions</Typography>
              <Typography variant="h5">{stats.total_transactions || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sx={{ width: { xs: "100%", md: "33.33%" } }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="error">
                Fraud Incidents
              </Typography>
              <Typography variant="h5" color="error">
                {stats.fraud_incidents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
