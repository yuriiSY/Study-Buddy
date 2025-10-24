import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  RiEyeLine,
  RiEyeCloseLine,
  RiMailLine,
  RiUserLine,
  RiLockLine,
} from "react-icons/ri";
import { yupResolver } from "@hookform/resolvers/yup";
import schema from "../../schemas/validationRegistrSchemas";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema.validationRegistrSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((d) => onSubmit(d))}
      noValidate
    >
      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>
          Full Name
        </label>
        <div className={styles.inputContainer}>
          <RiUserLine className={styles.iconLeft} />
          <input
            id="name"
            className={styles.input}
            {...register("name", { required: true })}
            type="text"
            placeholder="Enter your name"
          />
        </div>
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <div className={styles.inputContainer}>
          <RiMailLine className={styles.iconLeft} />
          <input
            id="email"
            className={styles.input}
            {...register("email", { required: true })}
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
            {...register("password", { required: true })}
            value={password}
            onChange={handlePasswordChange}
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
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

      <button className={styles.button} type="submit">
        Register Now
      </button>
    </form>
  );
};

export default RegistrationForm;
