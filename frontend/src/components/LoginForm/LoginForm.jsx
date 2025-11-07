import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  RiEyeLine,
  RiEyeCloseLine,
  RiMailLine,
  RiLockLine,
} from "react-icons/ri";
import schema from "../../schemas/validationRegistrSchemas";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./LoginForm.module.css";
import { ClipLoader } from "react-spinners";

const LoginForm = ({ onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema.validationLoginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <div className={styles.inputContainer}>
          <RiMailLine className={styles.iconLeft} />
          <input
            id="email"
            className={styles.input}
            {...register("email")}
            type="email"
            placeholder="your.email@example.com"
          />
        </div>
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.inputContainer}>
          <RiLockLine className={styles.iconLeft} />
          <input
            id="password"
            className={styles.input}
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
          />
          <div className={styles.iconRight} onClick={togglePasswordVisibility}>
            {showPassword ? (
              <RiEyeLine className={styles.icon} />
            ) : (
              <RiEyeCloseLine className={styles.icon} />
            )}
          </div>
        </div>
        {errors.password && (
          <p className={styles.error}>{errors.password.message}</p>
        )}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.remember}>
          <input type="checkbox" /> Remember me
        </label>
        <a href="/forgot-password" className={styles.link}>
          Forgot password?
        </a>
      </div>

      <button className={styles.button} type="submit">
        {loading ? <ClipLoader size={20} color="#fff" /> : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
