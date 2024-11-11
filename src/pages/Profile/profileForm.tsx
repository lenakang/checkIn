import { useMutation } from "@tanstack/react-query";
import { modifyGoogleName } from "../../hooks/useMember";
import { useForm } from "react-hook-form";
import { containsProfanity } from "../Auth/api";
import Popup from "../../components/Popup";

interface PopupProps {
    setIsPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProfileForm({ setIsPopup }: PopupProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{ name: string }>();

    const mutation = useMutation({
        mutationFn: modifyGoogleName,
        onSuccess: () => {
            alert("수정했습니다.");
            setIsPopup(false);
        },
    });

    const onSubmit = ({ name }: { name: string }) => {
        mutation.mutate({ name });
    };

    const children = (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    placeholder="name"
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
                />

                {errors.name && <span>{errors.name.message} </span>}
            </div>
            <button className="btn">수정하기</button>
        </form>
    );

    return (
        <Popup
            children={children}
            setIsPopup={setIsPopup}
            noConfirm
            style={{ textAlign: "left" }}
        />
    );
}
