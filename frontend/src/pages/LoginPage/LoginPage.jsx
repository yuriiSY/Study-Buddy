import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

import LoginForm from "../../components/LoginForm/LoginForm";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const handleLogin = (data) => {
    console.log("Login");
    dispatch(loginUser(data));
  };

  const handleRegister = (data) => {
    console.log("Register");
    dispatch(registerUser(data));
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <div className={styles.containerPage}>
        <div className={styles.container}>
          <div className={styles.imageContainer}>
            <img
              src={isLogin ? "/login.png" : "/register.png"}
              alt={isLogin ? "Login" : "Register"}
              className={styles.formImage}
            />
          </div>
          <div className={styles.toggleHeader}>
            <span
              className={`${styles.toggleOption} ${
                isLogin ? styles.active : ""
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </span>
            <span className={styles.separator}>/</span>
            <span
              className={`${styles.toggleOption} ${
                !isLogin ? styles.active : ""
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </span>
          </div>
          {isLogin ? (
            <LoginForm onSubmit={handleLogin} />
          ) : (
            <RegistrationForm onSubmit={handleRegister} />
          )}
        </div>
      </div>
    </>
  );
};
