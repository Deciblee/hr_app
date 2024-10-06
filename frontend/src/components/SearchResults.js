import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from '../services/api';
import { Container, Typography, List, Card, CardContent } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery();
  const searchQuery = query.get('query');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      axios
        .get(`/employees/?search=${encodeURIComponent(searchQuery)}`)
        .then((response) => {
          setResults(response.data);
        })
        .catch((error) => console.error(error));
    }
  }, [searchQuery]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Результаты поиска для: "{searchQuery}"
      </Typography>
      {results.length > 0 ? (
        <List>
          {results.map((employee) => (
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
        </List>
      ) : (
        <Typography>Нет результатов.</Typography>
      )}
    </Container>
  );
}

export default SearchResults;
