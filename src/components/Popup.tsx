import { Link } from "react-router-dom";
import IconClose from "../assets/IconClost";

interface IPopUp {
    style?: React.CSSProperties;
    children?: React.ReactNode | string;
    icon?: React.ReactNode;
    link?: string;
    noConfirm?: boolean;
    setOkay?: React.Dispatch<React.SetStateAction<boolean>>;
    ok?: boolean;
    setIsPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Popup({
    children,
    setIsPopup,
    style,
    icon,
    link,
    noConfirm,
    setOkay,
}: IPopUp) {
    return (
        <div className="popup">
            <div className="popup-layout">
                <div
                    className="popup-close"
                    onClick={() => setIsPopup((prev) => !prev)}
                >
                    <IconClose width="2.5rem" />
                </div>
                {icon && (
                    <div className="popup-icon">
                        <i>{icon}</i>
                    </div>
                )}
                <div className="popup-body" style={style ? style : {}}>
                    <span className="popup-children">{children}</span>
                </div>
                {!noConfirm && (
                    <div className="popup-button">
                        {link ? (
                            <Link className="btn" to={link}>
                                확인
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsPopup((prev) => !prev);
                                    setOkay && setOkay((prev) => !prev);
                                }}
                                className="btn"
                            >
                                확인
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
