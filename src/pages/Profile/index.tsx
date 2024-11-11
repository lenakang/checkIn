import styles from "../../styles/profile.module.scss";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { useQuery } from "@tanstack/react-query";
import { Member } from "../../types";
import { QueryKeys } from "../../constants";
import { deleteUserAndInfo, fetchMembers } from "../../hooks/useMember";
import { useState } from "react";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import IconPencil from "../../assets/IconPencil";
import ProfileForm from "./profileForm";

export default function index() {
    const [isPopup, setIsPopup] = useState(false);
    const user = auth.currentUser;
    const navigate = useNavigate();

    const {
        data: members,
        isLoading,
        error,
    } = useQuery<Member[]>({
        queryKey: [QueryKeys.MEMBERS],
        queryFn: fetchMembers,
    });

    const deleteAccount = () => {
        if (user) {
            const ok = confirm(
                "정말 탈퇴하시겠습니까?\n모든 학생 정보도 함께 삭제됩니다."
            );
            if (ok) {
                deleteUserAndInfo(user);
                alert("회원 탈퇴가 완료되었습니다.");
                navigate("/login");
            }
        }
    };

    const sendEmail = () => {
        if (user) {
            const ok = confirm("인증메일을 보내시겠습니까?");
            if (ok) {
                sendEmailVerification(user);
                alert("인증 이메일을 발송했습니다.");
            }
        }
    };

    const signOut = () => {
        if (user) {
            const ok = confirm("로그아웃 하시겠습니까?");
            if (ok) {
                auth.signOut();
                navigate("/login");
            }
        }
    };

    const resetPassword = async () => {
        if (user && user.email) {
            const ok = confirm("비밀번호 재설정 이메일을 보내시겠습니까?");
            if (ok) {
                await sendPasswordResetEmail(auth, user.email);
                alert("비밀번호 재설정 이메일을 보냈습니다.");
            }
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error</div>;

    return (
        <>
            {user ? (
                <div className={styles.profile}>
                    <div className={styles.account}>
                        <div className={styles.name}>
                            <span>{user.displayName}</span>
                            <button
                                onClick={() => setIsPopup((prev) => !prev)}
                                className={styles.edit}
                            >
                                <IconPencil width="2rem" />
                            </button>
                        </div>
                        <div className={styles.email}>
                            {user.email}
                            {!user.emailVerified && (
                                <button className="btn" onClick={sendEmail}>
                                    인증 이메일 보내기
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.info}>
                        <h3>학생 정보</h3>
                        <div>
                            학생 <span>{members?.length}명</span>
                        </div>
                    </div>
                    <div className={styles.setting}>
                        <h3>설정</h3>
                        <div>
                            <button onClick={signOut}>로그아웃</button>
                            {user.emailVerified && (
                                <button onClick={resetPassword}>
                                    비밀번호 변경
                                </button>
                            )}
                            <button onClick={deleteAccount}>회원탈퇴</button>
                        </div>
                    </div>

                    {/* 팝업 */}
                    {isPopup && <ProfileForm setIsPopup={setIsPopup} />}
                </div>
            ) : (
                "유저 정보가 없습니다."
            )}
        </>
    );
}
