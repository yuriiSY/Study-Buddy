import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { RiBookOpenLine } from "react-icons/ri";
import { toast } from "react-toastify";

import LoginForm from "../../components/LoginForm/LoginForm";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (data) => {
    await dispatch(loginUser(data));
    try {
      dispatch(loginUser(data)).unwrap();
      toast.success("🎉 Login successful!");
    } catch (error) {
      toast.error(error || "❌ Login failed. Please try again.");
    }
  };

  const handleRegister = async (formData) => {
    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.success("🎉 Registration successful!");
    } catch (error) {
      toast.error(error || "❌ Registration failed. Please try again.");
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
          <div className={styles.iconCircle}>
            <RiBookOpenLine className={styles.icon} />
          </div>
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
            <LoginForm onSubmit={handleLogin} />
          ) : (
            <RegistrationForm onSubmit={handleRegister} />
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
