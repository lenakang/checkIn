import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../constants";
import { fetchAllMembers, getCheckInStat } from "../../hooks/useMember";
import styles from "../../styles/list.module.scss";
import NoData from "../../components/NoData";

export default function index() {
    const { data: members, isLoading: loadingMembers } = useQuery({
        queryKey: [QueryKeys.ALL_MEMBERS],
        queryFn: fetchAllMembers,
    });
    const { data: checkIns, isLoading: loadingCheckIns } = useQuery({
        queryKey: [QueryKeys.CHECK_IN_ALL],
        queryFn: getCheckInStat,
    });

    if (loadingMembers || loadingCheckIns) return <p>Loading...</p>;

    return (
        <div className={styles.wrapper}>
            <h3>이번달 출석 현황</h3>
            {members && members?.length > 0 && checkIns ? (
                <ul style={{ marginTop: "2rem" }}>
                    {members.map((m) => (
                        <li key={m.id}>
                            {m.name}
                            <span style={{ marginLeft: "1rem" }}>
                                {checkIns[m.id] ?? 0}회
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <NoData />
            )}
        </div>
    );
}
