import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

function CertificationForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    axios.post('/certifications/', { name })
      .then(() => navigate('/'))
      .catch(error => {
        if (error.response && error.response.status === 400) {
          setError(error.response.data.name?.[0] || 'Произошла ошибка при добавлении сертификата.');
        } else {
          console.error(error);
        }
      });
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Добавить новый сертификат
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Название сертификата"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Добавить
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default CertificationForm;