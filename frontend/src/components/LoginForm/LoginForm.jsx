import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiEyeLine, RiEyeCloseLine } from 'react-icons/ri';
import schema from '../../schemas/validationRegistrSchemas';

import styles from './LoginForm.module.css';
import { yupResolver } from '@hookform/resolvers/yup';

const LoginForm = ({ onSubmit }) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema.validationLoginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          {...register('email', { required: true })}
          type="email"
          placeholder="Enter your email"
        />

        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          {...register('password', {
            required: true,
            minLength: 8,
            maxLength: 32,
          })}
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
        />

        {errors.password && (
          <p className={styles.error}>{errors.password.message}</p>
        )}

        <div className={styles.iconContainer}>
          {showPassword ? (
            <RiEyeLine
              className={styles.icon}
              onClick={togglePasswordVisibility}
            />
          ) : (
            <RiEyeCloseLine
              className={styles.icon}
              onClick={togglePasswordVisibility}
            />
          )}
        </div>
      </div>

      <button className={styles.button} type="submit">
        Log In Now
      </button>
    </form>
  );
};

export default LoginForm;