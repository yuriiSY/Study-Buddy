import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import avatarImg from "../../assets/avatar.png";
import logoImg from "../../assets/logo.png";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/auth/authSlice";
import { Link } from "react-router-dom";
import ProfileModal from "../ProfileModal/ProfileModal";

// 👇 NEW: theme hook
import { useTheme } from "../../context/ThemeContext";

const Header = ({ onMenuClick, hasSidebar = false }) => {
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state) => state.auth);

  // 👇 NEW: access current theme + toggle
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.left}>
            {hasSidebar && (
              <button className={styles.menuBtn} onClick={onMenuClick}>
                ☰
              </button>
            )}
            <div className={styles.logoSection}>
              <Link to="/" className={styles.logoLink}>
                <img
                  src={logoImg}
                  alt="Study Buddy Logo"
                  className={styles.logo}
                />
                <div>
                  <h1 className={styles.title}>Study Buddy</h1>
                  <p className={styles.subtitle}>Your smart learning partner</p>
                </div>
              </Link>
            </div>
          </div>

          <div className={styles.userSection} ref={menuRef}>
            {/* Light and dark mode toggle represented by moon and sun */}
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {isLoggedIn ? (
              <>
                <div
                  className={styles.userMenu}
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <img
                    src={avatarImg}
                    alt="User Avatar"
                    className={styles.avatar}
                  />
                </div>

                {open && (
                  <div className={styles.dropdown}>
                    <button
                      className={styles.menuItem}
                      onClick={() => setOpenProfile(true)}
                    >
                      My Account
                    </button>
                    <hr className={styles.divider} />
                    <button onClick={handleLogout} className={styles.logout}>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.authLinks}>
                <Link to="/login" className={styles.loginLink}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      {openProfile && <ProfileModal onClose={() => setOpenProfile(false)} />}
    </>
  );
};

export default Header;
