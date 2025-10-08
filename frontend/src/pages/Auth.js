// src/pages/Auth.js
import React, { useState } from "react";
import { Avatar, Button, Paper, Grid, Typography, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import AuthServices from "../Services/AuthServices";
import toast from "react-hot-toast";
import Input from "../components/Input";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignup) {
        await AuthServices.registerUser(formData);
        toast.success("Registered successfully! Please login.");
        setIsSignup(false);
      } else {
        const res = await AuthServices.loginUser(formData);

        // ✅ Save token separately
        localStorage.setItem("token", res.data.token);

        // Save user info (optional)
        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: res.data._id,
            name: res.data.name,
            email: res.data.email,
          })
        );

        toast.success("Login successful!");
        navigate("/home"); // redirect to home page
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error(error);
    }
  };

  const switchMode = () => setIsSignup((prev) => !prev);

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Avatar sx={{ margin: 1, backgroundColor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {isSignup ? "Sign Up" : "Sign In"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSignup && (
              <Input name="name" label="Name" handleChange={handleChange} autoFocus half />
            )}
            <Input name="email" label="Email" handleChange={handleChange} type="email" />
            <Input name="password" label="Password" handleChange={handleChange} type="password" />
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ margin: "20px 0" }}
          >
            {isSignup ? "Sign Up" : "Sign In"}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button onClick={switchMode}>
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign Up"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Auth;
