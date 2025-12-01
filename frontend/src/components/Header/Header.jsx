import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import avatarImg from "../../assets/avatar.png";
import logoImg from "../../assets/logo.svg";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/auth/authSlice";
import { Link } from "react-router-dom";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useTheme } from "../../context/ThemeContext";
import CommandPalette from "../CommandPalette/CommandPalette";

const Header = ({ onMenuClick, hasSidebar = false }) => {
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shrink header + add shadow when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K for command palette
  useEffect(() => {
    const handleKey = (e) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
  };

  return (
    <>
      <header
        className={`${styles.header} ${
          isScrolled ? styles.headerScrolled : ""
        }`}
      >
        <div
          className={`${styles.container} ${
            isScrolled ? styles.containerScrolled : ""
          }`}
        >
          <div className={styles.left}>
            {hasSidebar && (
              <button className={styles.menuBtn} onClick={onMenuClick}>
                ☰
              </button>
            )}
            <div className={styles.logoSection}>
              <Link to="/" className={styles.logoLink}>
                <div className={styles.logoWrapper}>
                  <img
                    src={logoImg}
                    alt="Study Buddy Logo"
                    className={styles.logo}
                  />
                </div>
                <div>
                  <h1 className={styles.title}>Study Buddy</h1>
                  <p className={styles.subtitle}>
                    Your smart learning partner
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className={styles.userSection} ref={menuRef}>
            {/* Dark / light mode toggle */}
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

            {/* Command palette (also opens with Ctrl+K / Cmd+K) */}
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Open command palette (Ctrl+K / Cmd+K)"
            >
              ⌘K
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

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </>
  );
};

export default Header;
