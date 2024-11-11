import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useForm } from "react-hook-form";
import { auth } from "../../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { containsProfanity, formatMessage } from "../api";
import styles from "../../../styles/auth.module.scss";
import IconLoading from "../../../assets/IconLoading";

interface FormData {
    name: string;
    email: string;
    password: string;
    formError?: string;
}

export default function index() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async ({ email, password, name }: FormData) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;
            if (user) {
                await updateProfile(userCredential.user, {
                    displayName: name,
                });
            }
            alert("회원가입이 완료되었습니다. \n이메일을 인증해주세요.");
            navigate("/profile");
        } catch (e) {
            if (e instanceof FirebaseError) {
                const msg = formatMessage(e);

                setError("formError", {
                    type: "manual",
                    message: msg ?? e.code,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>
                <h2>
                    가입하기
                    <span>
                        가입 후 이메일 인증이 필요합니다. <br />
                        실제 사용하시는 이메일로 가입해주세요.
                    </span>
                </h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        placeholder="name"
                        type="name"
                        {...register("name", {
                            required: "이름을 입력해주세요.",
                            minLength: {
                                value: 2,
                                message: "이름은 한 글자 이상 입력해 주세요.",
                            },
                            validate: (name) =>
                                containsProfanity(name) ||
                                "이름에 욕설이나 비속어는 사용할 수 없습니다.",
                        })}
                        onChange={() => clearErrors()}
                    />
                    {errors.name && <span>{errors.name.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        placeholder="name@user.com"
                        type="email"
                        {...register("email", {
                            required: "이메일을 입력해주세요.",
                        })}
                        onChange={() => clearErrors()}
                    />
                    {errors.email && <span>{errors.email.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        placeholder="password"
                        type="password"
                        {...register("password", {
                            required: "비밀번호를 입력해주세요.",
                            minLength: {
                                value: 6,
                                message:
                                    "비밀번호는 6자 이상으로 설정해 주세요.",
                            },
                        })}
                        onChange={() => clearErrors()}
                    />
                    {errors.password && <span>{errors.password.message}</span>}
                    {errors.formError && (
                        <span>{errors.formError.message}</span>
                    )}
                </div>

                <button className="btn" type="submit">
                    {loading ? (
                        <IconLoading width="2rem" color="#fff" />
                    ) : (
                        "Sign up"
                    )}
                </button>
                <div className={styles.info}>
                    가입하시려면 쿠키 사용을 포함해 <br />
                    <Link to="/agreement">이용약관</Link>과{" "}
                    <Link to="/privacy">개인정보 처리방침</Link>에 동의해야
                    합니다.
                </div>
            </form>
            <div className={styles.switcher}>
                <Link to="/login">
                    이미 계정이 있으신가요? 로그인{" "}
                    <i className="xi-arrow-right" />
                </Link>
            </div>
        </div>
    );
}
