import React, { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { fetchCustomers } from "../api/service";

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers().then((data) => setCustomers(data));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="customers table">
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.user_id}>
                <TableCell>{customer.user_id}</TableCell>
                <TableCell>{customer.username}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Customers;
