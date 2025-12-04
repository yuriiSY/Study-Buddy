// src/utils/notify.js
import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 2500,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: true,
  theme: "colored",
};

export const notifySuccess = (message, options = {}) =>
  toast.success(message, { ...baseOptions, ...options });

export const notifyError = (message, options = {}) =>
  toast.error(message, { ...baseOptions, ...options });

export const notifyInfo = (message, options = {}) =>
  toast.info(message, { ...baseOptions, ...options });

export const notifyWarning = (message, options = {}) =>
  toast.warn(message, { ...baseOptions, ...options });
