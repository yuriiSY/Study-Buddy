import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import avatarImg from "../../assets/avatar.png";
import logoImg from "../../assets/logo.png";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/auth/authSlice";

const Header = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state) => state.auth);

  // Close dropdown if clicking outside
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
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <a href="/" className={styles.logoLink}>
          <img src={logoImg} alt="Study Buddy Logo" className={styles.logo} />
          <div>
            <h1 className={styles.title}>Study Buddy</h1>
            <p className={styles.subtitle}>Your smart learning partner</p>
          </div>
        </a>
      </div>

      {/* Stats (visible only when logged in) */}
      {isLoggedIn && (
        <ul className={styles.stats}>
          <li>
            <a className={styles.statLink} href="#">
              <span>🏅</span> 1,245
            </a>
          </li>
          <li>
            <a className={styles.statLink} href="#">
              <span>📈</span> Rank #42
            </a>
          </li>
          <li>
            <a className={styles.statLink} href="#">
              <span>🔥</span> Streak Master
            </a>
          </li>
          <li>
            <a className={styles.statLink} href="#">
              <span>🎯</span> Quick Learner
            </a>
          </li>
        </ul>
      )}

      {/* Right side: User avatar or Sign In */}
      <div className={styles.userSection} ref={menuRef}>
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
                <a href="/account" className={styles.menuItem}>
                  My Account
                </a>
                <hr className={styles.divider} />
                <button onClick={handleLogout} className={styles.logout}>
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.authLinks}>
            <a href="/login" className={styles.loginLink}>
              Sign In
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
