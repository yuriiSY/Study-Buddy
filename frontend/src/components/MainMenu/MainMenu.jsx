import React from "react";
import styles from "./MainMenu.module.css"
import icons from "../../assets/symbol-defs.svg";

const MainMenu = () => {
    
    return (
        <>
            <nav className={styles.header}>
                <ul className={styles.menuList}>
                    <li className={styles.menuItem}>
                        <a className={styles.link} href="/">
                            <svg width="24" height="24" fill="currentColor">
                                <use href={`${icons}#icon-home`} />
                            </svg>
                        </a>
                    </li>
                    <li className={styles.menuItem}><a className={styles.link} href="#0">Modules</a></li>
                    <li className={styles.menuItem}><a className={styles.link} href="#0">Duels</a></li>
                    <li className={styles.menuItem}>
                        <a className={styles.link} href="/login">
                            <svg width="24" height="24" fill="currentColor">
                                <use href={`${icons}#icon-profile`} />
                            </svg>
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    )
}


export default MainMenu;