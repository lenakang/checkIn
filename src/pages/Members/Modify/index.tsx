import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getMember, modifyMember } from "../../../hooks/useMember";
import { Member, ModifyForm } from "../../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../../../constants";
import { useEffect } from "react";

export default function index() {
    const navigate = useNavigate();

    const { id } = useParams();

    const { data: member } = useQuery<Member>({
        queryKey: [QueryKeys.MEMBER, id],
        queryFn: async () => {
            if (id) {
                return await getMember(id);
            } else {
                return { id: "", name: "", createdAt: 0, uid: "" };
            }
        },
        enabled: !!id,
    });

    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitted },
    } = useForm<ModifyForm>({
        defaultValues: {
            name: member?.name || "",
            age: member?.age || "",
        },
    });

    const mutation = useMutation({
        mutationFn: (formData: ModifyForm) =>
            modifyMember(formData, id ?? null),
        onSuccess: () => {
            alert(id ? "수정했습니다." : "추가했습니다.");
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.MEMBER, id],
            });
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.MEMBER, id],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            navigate("/");
        },
    });

    const onSubmit = (formData: ModifyForm) => {
        if (
            id &&
            member &&
            member.name === formData.name &&
            member.age === formData.age
        ) {
            setError("formError", {
                type: "manual",
                message: "기존과 동일한 학생 정보입니다.",
            });
            return;
        }

        mutation.mutate(formData);
    };

    useEffect(() => {
        if (member) {
            reset({
                name: member.name || "",
                age: member.age || "",
            });
        }
    }, [member]);

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="name" className="required">
                        이름
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register("name", {
                            required: "이름을 입력해주세요.",
                        })}
                    />
                    {isSubmitted && errors.name && (
                        <span>{errors.name.message}</span>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="age">생년월일</label>
                    <input
                        id="age"
                        type="text"
                        placeholder="19980101"
                        {...register("age", {
                            minLength: {
                                value: 8,
                                message: "생년월일은 8자리로 입력해야 합니다.",
                            },
                            maxLength: {
                                value: 8,
                                message: "생년월일은 8자리로 입력해야 합니다.",
                            },
                        })}
                    />
                    {isSubmitted && errors.age && (
                        <span>{errors.age.message}</span>
                    )}
                </div>
                {isSubmitted && errors.formError && (
                    <p>{errors.formError.message}</p>
                )}
                <button className="btn">{id ? "수정하기" : "추가하기"}</button>
            </form>
        </div>
    );
}
