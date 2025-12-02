import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import logoImg from "../../assets/logo2.png";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/auth/authSlice";
import { Link, useLocation } from "react-router-dom";
import ProfileModal from "../ProfileModal/ProfileModal";
import {
  Home,
  // MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Search,
  XCircle,
  Sun,
  Moon,
  Book,
} from "lucide-react";

const Header = ({
  onMenuClick,
  hasSidebar = false,
  searchQuery = "",
  onSearchChange = () => {},
  hideSearch = false,
}) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileThemeSubmenuOpen, setMobileThemeSubmenuOpen] = useState(false);

  // --- THEME STATE: "light" | "dark" | "sepia" ---
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";

    const stored = window.localStorage.getItem("sb-theme");
    if (stored === "light" || stored === "dark" || stored === "sepia") {
      return stored;
    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark ? "dark" : "light";
  });

  const menuRef = useRef();
  const searchRef = useRef();
  const themeDropdownRef = useRef();
  const dispatch = useDispatch();
  const location = useLocation();

  const { isLoggedIn } = useSelector((state) => state.auth);

  // Apply theme to <html data-theme="..."> and persist preference
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("sb-theme", theme);
  }, [theme]);

  // Close mobile menus/search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
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

          {isLoggedIn && (
            <>
              {!hideSearch && (
                <>
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search modules..."
                      className={styles.searchBar}
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className={styles.clearSearchBtn}
                        onClick={() => onSearchChange("")}
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                  <button
                    className={styles.mobileSearchBtn}
                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    title="Search"
                  >
                    <Search size={20} />
                  </button>
                </>
              )}
              <nav className={styles.navbar}>
                <Link
                  to="/"
                  className={`${styles.navItem} ${
                    location.pathname === "/" ? styles.active : ""
                  }`}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                {/* <Link
                  to="/discussions"
                  className={`${styles.navItem} ${
                    location.pathname === "/discussions" ? styles.active : ""
                  }`}
                >
                  <MessageSquare size={18} />
                  <span>Discussions</span>
                </Link> */}
                <button
                  className={styles.navItem}
                  onClick={() => setOpenProfile(true)}
                >
                  <User size={18} />
                  <span>My Account</span>
                </button>
                <button className={styles.navItem} onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </nav>
            </>
          )}

          {/* === DESKTOP THEME TOGGLER ====================== */}
          <div
            className={styles.themeToggle}
            role="group"
            aria-label="Theme toggle"
          >
            <button
              type="button"
              className={`${styles.themeToggleButton} ${
                theme === "light" ? styles.themeToggleButtonActive : ""
              }`}
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              title="Light mode"
            >
              ☀️
            </button>
            <button
              type="button"
              className={`${styles.themeToggleButton} ${
                theme === "sepia" ? styles.themeToggleButtonActive : ""
              }`}
              onClick={() => setTheme("sepia")}
              aria-pressed={theme === "sepia"}
              title="Sepia mode"
            >
              📖
            </button>
            <button
              type="button"
              className={`${styles.themeToggleButton} ${
                theme === "dark" ? styles.themeToggleButtonActive : ""
              }`}
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              title="Dark mode"
            >
              🌙
            </button>
          </div>

          {/* === MOBILE THEME DROPDOWN ====================== */}
          <div
            className={styles.mobileThemeToggle}
            ref={themeDropdownRef}
            role="group"
            aria-label="Theme toggle"
          >
            <button
              type="button"
              className={styles.mobileThemeToggleButton}
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              aria-label="Theme options"
              title="Change theme"
            >
              {theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "📖"}
            </button>
            {themeDropdownOpen && (
              <div className={styles.themeDropdownMenu}>
                <button
                  type="button"
                  className={`${styles.themeDropdownItem} ${
                    theme === "light" ? styles.themeDropdownItemActive : ""
                  }`}
                  onClick={() => {
                    setTheme("light");
                    setThemeDropdownOpen(false);
                  }}
                  aria-label="Light mode"
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  className={`${styles.themeDropdownItem} ${
                    theme === "sepia" ? styles.themeDropdownItemActive : ""
                  }`}
                  onClick={() => {
                    setTheme("sepia");
                    setThemeDropdownOpen(false);
                  }}
                  aria-label="Sepia mode"
                >
                  📖 Sepia
                </button>
                <button
                  type="button"
                  className={`${styles.themeDropdownItem} ${
                    theme === "dark" ? styles.themeDropdownItemActive : ""
                  }`}
                  onClick={() => {
                    setTheme("dark");
                    setThemeDropdownOpen(false);
                  }}
                  aria-label="Dark mode"
                >
                  🌙 Dark
                </button>
              </div>
            )}
          </div>
          {/* ======================================================= */}

          <div className={styles.mobileMenu} ref={menuRef}>
            {isLoggedIn ? (
              <>
                <button
                  className={styles.mobileMenuBtn}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {mobileMenuOpen && (
                  <div className={styles.mobileDropdown}>
                    <Link
                      to="/"
                      className={styles.mobileNavItem}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home size={18} />
                      Dashboard
                    </Link>
                    {/* <Link
                      to="/discussions"
                      className={styles.mobileNavItem}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageSquare size={18} />
                      Discussions
                    </Link> */}
                    <button
                      className={styles.mobileNavItem}
                      onClick={() => {
                        setOpenProfile(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User size={18} />
                      My Account
                    </button>

                    <div className={styles.mobileMenuDivider} />

                    <button
                      className={styles.mobileNavItem}
                      onClick={() => setMobileThemeSubmenuOpen(!mobileThemeSubmenuOpen)}
                    >
                      {theme === "light" ? (
                        <Sun size={18} />
                      ) : theme === "dark" ? (
                        <Moon size={18} />
                      ) : (
                        <Book size={18} />
                      )}
                      Theme
                    </button>

                    {mobileThemeSubmenuOpen && (
                      <div className={styles.mobileSubmenu}>
                        <button
                          className={`${styles.mobileSubmenuItem} ${
                            theme === "light" ? styles.mobileThemeActive : ""
                          }`}
                          onClick={() => {
                            setTheme("light");
                            setMobileThemeSubmenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          title="Light mode"
                        >
                          <Sun size={18} />
                          Light
                        </button>
                        <button
                          className={`${styles.mobileSubmenuItem} ${
                            theme === "sepia" ? styles.mobileThemeActive : ""
                          }`}
                          onClick={() => {
                            setTheme("sepia");
                            setMobileThemeSubmenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          title="Sepia mode"
                        >
                          <Book size={18} />
                          Sepia
                        </button>
                        <button
                          className={`${styles.mobileSubmenuItem} ${
                            theme === "dark" ? styles.mobileThemeActive : ""
                          }`}
                          onClick={() => {
                            setTheme("dark");
                            setMobileThemeSubmenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          title="Dark mode"
                        >
                          <Moon size={18} />
                          Dark
                        </button>
                      </div>
                    )}

                    <div className={styles.mobileMenuDivider} />

                    <button
                      className={styles.mobileNavItem}
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
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

      {mobileSearchOpen && (
        <div className={styles.mobileSearchOverlay} ref={searchRef}>
          <div className={styles.mobileSearchContainer}>
            <input
              type="text"
              placeholder="Search modules..."
              className={styles.mobileSearchInput}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => onSearchChange("")}
                title="Clear search"
                aria-label="Clear search"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {openProfile && <ProfileModal onClose={() => setOpenProfile(false)} />}
    </>
  );
};

export default Header;