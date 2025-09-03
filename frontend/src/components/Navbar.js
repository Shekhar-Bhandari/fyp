import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('profile');
    navigate('/');
  };

  return (
    <AppBar position="static" color="inherit">
      <Toolbar>
        <Typography component={Link} to="/" variant="h5" align="center" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          LinkedIn Clone
        </Typography>
        {user ? (
          <div>
            <Button component={Link} to="/profile" color="inherit">
              {user.name}
            </Button>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button component={Link} to="/auth" color="inherit">
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;