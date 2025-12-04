import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { RiBookOpenLine } from "react-icons/ri";

import LoginForm from "../../components/LoginForm/LoginForm";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";

// Centralised toast helpers
import {
  notifySuccess,
  notifyError,
} from "../../utils/notify";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      notifySuccess("🎉 Login successful!");
      // navigation handled by useEffect as well
      navigate("/home");
    } catch (error) {
      const message =
        error?.message || "❌ Login failed. Please try again.";
      notifyError(message);
    }
  };

  const handleRegister = async (formData) => {
    try {
      await dispatch(registerUser(formData)).unwrap();
      notifySuccess("🎉 Registration successful!");
      
    } catch (error) {
      const message =
        error?.message ||
        "❌ Registration failed. Please try again.";
      notifyError(message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <RiBookOpenLine className={styles.icon} />
          </div>
          <h2 className={styles.title}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? "Sign in to continue your learning journey."
              : "Join Study Buddy and start learning today."}
          </p>
        </div>

        <div className={styles.formContainer}>
          {isLogin ? (
            <LoginForm onSubmit={handleLogin} loading={loading} />
          ) : (
            <RegistrationForm
              onSubmit={handleRegister}
              loading={loading}
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
                type="button"
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
                type="button"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
