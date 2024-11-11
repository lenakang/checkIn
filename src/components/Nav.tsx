import { NavLink } from "react-router-dom";
import styles from "../styles/nav.module.scss";
import { auth } from "../firebase";
import Popup from "./Popup";
import { useState } from "react";

export default function Nav() {
    const [isPopup, setIsPopup] = useState(false);
    const user = auth.currentUser;

    const verifyCheck = (e: any) => {
        if (user && !user.emailVerified) {
            setIsPopup(true);
            e.preventDefault();
        }
    };

    return (
        <>
            <nav className={styles.nav}>
                <ul>
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? styles.active : ""
                            }
                            onClick={verifyCheck}
                        >
                            <svg viewBox="0 0 576 512">
                                <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
                            </svg>
                            홈
                        </NavLink>
                    </li>
                    <li className={styles.profile}>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? styles.active : ""
                            }
                        >
                            {" "}
                            <svg viewBox="0 0 448 512">
                                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
                            </svg>
                            마이페이지
                        </NavLink>
                    </li>
                </ul>
            </nav>
            {isPopup && (
                <Popup
                    setIsPopup={setIsPopup}
                    children="이메일 인증 후 이용해 주세요."
                />
            )}
        </>
    );
}
