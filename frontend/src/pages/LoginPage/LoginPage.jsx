import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { RiBookOpenLine } from "react-icons/ri";
import { toast } from "react-toastify";

/**
 * LoginPage
 *
 * - Renders email/password fields.
 * - Calls your backend POST /api/auth/login via login({...}).
 * - On success, stores the token and navigates to /study (or the originally requested page).
 * - Shows helpful error messages on failure.
 *
 * Backend contract (customize as needed):
 *   POST { email, password } -> 200 { token, user? } | 4xx { error }
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/study";

  // Form state
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");

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

  async function onSubmit(e) {
    e.preventDefault();                // prevent full page reload
    setErr("");

    if (!email || !pass) {
      setErr("Please enter both email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

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
}