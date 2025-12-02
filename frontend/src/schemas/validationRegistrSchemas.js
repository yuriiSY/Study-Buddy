import * as yup from 'yup';

const validationRegistrSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .matches(
      /^[a-zA-Zа-яА-ЯґҐєЄіІїЇ0-9\s!@#$%^&*()_+-=`~[\]{}|\\:;"'<>,.?/]+$/,
      'Invalid characters in name'
    )
    .min(2, 'Name must be at least 2 characters')
    .max(32, 'Name cannot exceed 32 characters'),
  email: yup
    .string()
    .required('Email is required')
    .test(
      'has-one-at-symbol',
      'Email must contain exactly one "@" symbol',
      (value) => (value.match(/@/g) || []).length === 1
    )
    .test(
      'has-dot-after-at-symbol',
      'Email must contain a dot after the "@" symbol',
      (value) => {
        const atIndex = value.indexOf('@');
        const dotIndex = value.indexOf('.', atIndex);
        return dotIndex > atIndex;
      }
    )
    .matches(
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      'Invalid email format'
    ),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'The password length should not exceed 64 characters')
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+{}|:"<>?]{8,64}$/,
      'Invalid password format'
    )
    .required('Password is required'),
});

const validationLoginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .test(
      'has-one-at-symbol',
      'Email must contain exactly one "@" symbol',
      (value) => (value.match(/@/g) || []).length === 1
    )
    .test(
      'has-dot-after-at-symbol',
      'Email must contain a dot after the "@" symbol',
      (value) => {
        const atIndex = value.indexOf('@');
        const dotIndex = value.indexOf('.', atIndex);
        return dotIndex > atIndex;
      }
    )
    .matches(
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      'Invalid email format'
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'The password length should not exceed 64 characters')
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+{}|:"<>?]{8,64}$/,
      'Invalid password format'
    ),
});

const validationEditUSerSchema = yup.object().shape({
  avatar: yup.mixed(),
  name: yup
    .string()
    .matches(
      /^[a-zA-Zа-яА-ЯґҐєЄіІїЇ0-9\s!@#$%^&*()_+-=`~[\]{}|\\:;"'<>,.?/]+$/,
      'Invalid characters in name'
    )
    .min(2, 'Name must be at least 2 characters')
    .max(32, 'Name cannot exceed 32 characters'),
  email: yup
    .string()
    .test(
      'has-one-at-symbol',
      'Email must contain exactly one "@" symbol',
      (value) => (value.match(/@/g) || []).length === 1
    )
    .test(
      'has-dot-after-at-symbol',
      'Email must contain a dot after the "@" symbol',
      (value) => {
        const atIndex = value.indexOf('@');
        const dotIndex = value.indexOf('.', atIndex);
        return dotIndex > atIndex;
      }
    )
    .matches(
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      'Invalid email format'
    ),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'The password length should not exceed 64 characters')
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+{}|:"<>?]{8,64}$/,
      'Invalid password format'
    ),
});

export default {
  validationLoginSchema,
  validationRegistrSchema,
  validationEditUSerSchema,
};