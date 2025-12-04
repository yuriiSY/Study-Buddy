import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { toast } from "react-toastify";
import logoImg from "../../assets/logo2.png";

import LoginForm from "../../components/LoginForm/LoginForm";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const handleLogin = async (data) => {
    setLoginError("");
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("✓ Login successful!");
    } catch (error) {
      setLoginError(error || "Login failed. Please try again.");
    }
  };

  const handleRegister = async (formData) => {
    setRegisterError("");
    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.success("✓ Registration successful! Redirecting to login...");
      setTimeout(() => setIsLogin(true), 1500);
    } catch (error) {
      setRegisterError(error || "Registration failed. Please try again.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src={logoImg}
            alt="Study Buddy Logo"
            className={styles.logo}
          />
          <h2 className={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? "Sign in to continue your learning journey"
              : "Join Study Buddy and start learning today"}
          </p>
        </div>

        <div className={styles.formContainer}>
          {isLogin ? (
            <LoginForm 
              onSubmit={handleLogin} 
              loading={loading}
              error={loginError}
            />
          ) : (
            <RegistrationForm 
              onSubmit={handleRegister} 
              loading={loading}
              error={registerError}
            />
          )}
        </div>

        <div className={styles.toggleText}>
          {isLogin ? (
            <p>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className={styles.toggleButton}
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className={styles.toggleButton}
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
