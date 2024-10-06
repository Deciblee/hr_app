import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/api';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get('/employees/')
      .then(response => setEmployees(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Список сотрудников
        </Typography>
        {employees.map(employee => (
          <Card key={employee.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {employee.first_name} {employee.last_name}
              </Typography>
              <Link to={`/employees/${employee.id}`} style={{ textDecoration: 'none', color: 'blue' }}>
                Подробнее
              </Link>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}

export default EmployeeList;
