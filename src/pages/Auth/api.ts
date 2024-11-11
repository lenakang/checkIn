import { FirebaseError } from "firebase/app";

// 안내 문구 반환 함수
export const formatMessage = (e: FirebaseError) => {
    switch (e.code) {
        case "auth/invalid-credential":
            return "사용자 이름 또는 비밀번호가 올바르지 않습니다.";
        case "auth/too-many-requests":
            return "여러 번의 로그인 시도로 인해 계정 접근이 일시적으로 비활성화되었습니다. 잠시 후에 다시 시도해 주세요.";
        case "auth/user-not-found" || "auth/wrong-password":
            return "이메일 혹은 비밀번호가 일치하지 않습니다.";
        case "auth/email-already-in-use":
            return "이미 사용 중인 이메일입니다.";
        case "auth/weak-password":
            return "비밀번호는 6글자 이상이어야 합니다.";
        case "auth/network-request-failed":
            return "네트워크 연결에 실패 하였습니다.";
        case "auth/invalid-email":
            return "잘못된 이메일 형식입니다.";
        case "auth/internal-error":
            return "잘못된 요청입니다.";
        default:
            return "로그인에 실패 하였습니다.";
    }
};

// 욕설이나 비속어를 체크하는 함수
export const containsProfanity = (input: string): boolean => {
    const profanities = [
        "시발",
        "씨발",
        "개새",
        "개새끼",
        "미친",
        "병신",
        "지랄",
        "멍청이",
        "돌아이",
        "염병",
        "빡대가리",
        "꼴통",
        "쌍놈",
        "후레",
        "쓰레기",
        "썩을",
    ];

    const regex = new RegExp(profanities.join("|"), "i");
    return !regex.test(input); // 욕설이 포함되어 있지 않아야 true 반환
};
