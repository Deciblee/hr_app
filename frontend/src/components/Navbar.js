import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, TextField, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

function Navbar() {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [searchQuery, setSearchQuery] = React.useState('');
	const navigate = useNavigate();

	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	const handleSearchSubmit = (event) => {
		event.preventDefault();
		navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
	};

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
					HR Management App
				</Typography>
				<Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
					<TextField
						value={searchQuery}
						onChange={handleSearchChange}
						placeholder="Поиск сотрудников"
						variant="outlined"
						size="small"
						sx={{ bgcolor: 'white', borderRadius: 1 }}
					/>
					<IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
						<SearchIcon />
					</IconButton>
				</Box>
				<Box>
					<Button color="inherit" component={Link} to="/">Список сотрудников</Button>
					<Button color="inherit" component={Link} to="/employees/new">Добавить сотрудника</Button>
					<Button color="inherit" onClick={handleMenuClick}>Добавить данные</Button>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
					>
						<MenuItem component={Link} to="/skills/new" onClick={handleMenuClose}>Добавить навык</MenuItem>
						<MenuItem component={Link} to="/certifications/new" onClick={handleMenuClose}>Добавить сертификат</MenuItem>
						<MenuItem component={Link} to="/languages/new" onClick={handleMenuClose}>Добавить язык</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;
