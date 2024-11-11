import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteMember,
    fetchCheckIns,
    fetchMembers,
    setCheckIn,
} from "../../../hooks/useMember";
import { Link, useNavigate } from "react-router-dom";
import { QueryKeys } from "../../../constants";
import { CheckIn, Member } from "../../../types";
import styles from "../../../styles/list.module.scss";
import IconRightArr from "../../../assets/IconRightArr";
import IconPlus from "../../../assets/IconPlus";
import useDate from "../../../hooks/useDate";
import IconCircleChecked from "../../../assets/IconCircleChecked";
import IconCircle from "../../../assets/IconCircle";
import NoData from "../../../components/NoData";

export default function index() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { todayFormat } = useDate();

    const {
        data,
        isLoading: loadingMembers,
        error: errorMembers,
    } = useQuery({
        queryKey: [QueryKeys.MEMBERS],
        queryFn: fetchMembers,
    });

    const {
        data: checkIn,
        isLoading: loadingCheckIn,
        error: errorCheckIn,
    } = useQuery<CheckIn>({
        queryKey: [QueryKeys.CHECK_IN],
        queryFn: fetchCheckIns,
    });

    const mutationDelete = useMutation({
        mutationFn: deleteMember,
        onSuccess: () => {
            navigate("/");
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.MEMBERS],
            });
        },
    });

    const mutationCheckIn = useMutation({
        mutationFn: async (id: string) => {
            return await setCheckIn({ date: todayFormat, memberId: id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.CHECK_IN],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.CHECK_IN],
            });
        },
    });

    const onDelete = (name: string, id: string) => {
        const ok = confirm(`[${name}] 삭제 하시겠습니까?`);
        if (ok) {
            mutationDelete.mutate(id);
        }
    };

    if (loadingMembers || loadingCheckIn) return <p>Loading...</p>;

    if (errorMembers)
        return <p>Members error occurred: {errorMembers.message}</p>;
    if (errorCheckIn)
        return <p>CheckIn error occurred: {errorCheckIn.message}</p>;

    return (
        <div className={styles.wrapper}>
            {data && data.length > 0 ? (
                <div className={styles.list}>
                    <ul>
                        {data.map((member: Member) => (
                            <li key={member.id}>
                                <div>
                                    <button
                                        className={styles.name}
                                        onClick={() =>
                                            mutationCheckIn.mutate(member.id)
                                        }
                                    >
                                        {checkIn &&
                                        checkIn.members.includes(member.id) ? (
                                            <IconCircleChecked width="1.8rem" />
                                        ) : (
                                            <IconCircle width="1.8rem" />
                                        )}
                                        <span>{member.name}</span>
                                    </button>
                                    <button
                                        className={styles.delete}
                                        onClick={() =>
                                            onDelete(member.name, member.id)
                                        }
                                    >
                                        삭제
                                    </button>
                                </div>
                                <Link to={`members/${member.id}`}>
                                    <IconRightArr width="1.5rem" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <NoData />
            )}
            <Link to="/members/modify" className={styles.modify}>
                <IconPlus width="2rem" color="white" />
            </Link>
        </div>
    );
}
