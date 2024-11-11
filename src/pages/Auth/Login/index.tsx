import styles from "../../../styles/auth.module.scss";
import {
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { useForm } from "react-hook-form";
import { auth } from "../../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { formatMessage } from "../api";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../../../constants";
import IconLoading from "../../../assets/IconLoading";

interface FormData {
    email: string;
    password: string;
    formError?: string;
}

export default function index() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const providerGoogle = new GoogleAuthProvider();

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async ({ email, password }: FormData) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            navigate("/");
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

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, providerGoogle);
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            navigate("/");
        } catch (e) {
            console.log("구글 로그인에 실패했습니다.", e);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.title}>
                <h2>로그인</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                        })}
                        onChange={() => clearErrors()}
                    />
                    {errors.password && <span>{errors.password.message}</span>}
                    {errors.formError && (
                        <span>{errors.formError.message}</span>
                    )}
                </div>
                <button type="submit" className="btn">
                    {loading ? (
                        <IconLoading width="2rem" color="#fff" />
                    ) : (
                        "Login"
                    )}
                </button>
                <button
                    type="button"
                    onClick={loginWithGoogle}
                    className={`${styles.google} btn`}
                >
                    <img src="/google.svg" alt="google logo" />
                    Login With Google
                </button>
            </form>
            <div className={styles.switcher}>
                <Link to="/createAccount">
                    계정이 없으신가요? 회원가입 <i className="xi-arrow-right" />
                </Link>
            </div>
        </div>
    );
}
