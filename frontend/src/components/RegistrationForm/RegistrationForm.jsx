import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiEyeLine, RiEyeCloseLine } from 'react-icons/ri';
import { yupResolver } from '@hookform/resolvers/yup';

import styles from './RegistrationForm.module.css';
import schema from '../../schemas/validationRegistrSchemas';

const RegistrationForm = ({ onSubmit }) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema.validationRegistrSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((d) => onSubmit(d))}
      noValidate
    >
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          {...register('name', { required: true })}
          type="text"
          placeholder="Enter you name"
        />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          {...register('email', { required: true })}
          type="email"
          placeholder="Enter you email"
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          {...register('password', { required: true })}
          value={password}
          onChange={handlePasswordChange}
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
        />

        {errors.password && (
          <p className={styles.error} style={{ fontWeight: 500 }}>
            {errors.password.message}
          </p>
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
        Register Now
      </button>
    </form>
  );
};

export default RegistrationForm;