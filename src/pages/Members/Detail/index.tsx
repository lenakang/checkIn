import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getMember, getCheckIns, setCheckIn } from "../../../hooks/useMember";
import moment from "moment";
import Calendar from "react-calendar";
import useDate from "../../../hooks/useDate";
import { QueryKeys } from "../../../constants";
import { Member } from "../../../types";
import styles from "../../../styles/detail.module.scss";
import IconPencil from "../../../assets/IconPencil";
import "react-calendar/dist/Calendar.css";
import "../../../styles/calendar.scss";

export default function index() {
    const { id } = useParams();
    const queryClient = useQueryClient();

    const { data: member, isLoading: loadingMember } = useQuery<Member>({
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
    const { data: checkIns, isLoading: loadingCheckIn } = useQuery<String[]>({
        queryKey: [QueryKeys.CHECK_IN, id],
        queryFn: async () => {
            if (id) {
                return await getCheckIns(id);
            } else {
                return [];
            }
        },
        enabled: !!id,
    });

    const mutation = useMutation({
        mutationFn: async (date: Date) => {
            return await setCheckIn({
                date: moment(date).format("YYYY-MM-DD"),
                memberId: id || "",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.CHECK_IN],
            });
            queryClient.refetchQueries({
                queryKey: [QueryKeys.CHECK_IN],
            });
        },
        onError: (e) => {
            console.log(e);
        },
    });

    const { minDate } = useDate();

    if (loadingMember || loadingCheckIn) return <>Loading...</>;

    return (
        <div className={styles.wrapper}>
            {member && (
                <div className={styles.user}>
                    <ul>
                        <li className={styles.name}>
                            {member.name}
                            <Link to={`/members/modify/${id}`}>
                                <IconPencil width="2rem" />
                            </Link>
                        </li>
                        <li>
                            가입일 :{" "}
                            {moment(member.createdAt).format("YYYY-MM-DD")}
                        </li>
                        <li>
                            생년월일 :{" "}
                            {member.age
                                ? `${member.age.slice(0, 4)}-${member.age.slice(
                                      4,
                                      6
                                  )}-${member.age.slice(6, 8)}`
                                : "정보 없음"}
                        </li>
                    </ul>
                    {checkIns && (
                        <div className={styles.checkIns}>
                            <Calendar
                                tileClassName={({ date, view }) =>
                                    view === "month" && date.getDay() === 0
                                        ? "sunday"
                                        : null
                                }
                                tileContent={({ date, view }) =>
                                    view === "month" &&
                                    checkIns.some(
                                        (x) =>
                                            x ===
                                            moment(date).format("YYYY-MM-DD")
                                    ) ? (
                                        <span className="dot" />
                                    ) : null
                                }
                                minDate={minDate}
                                maxDate={new Date()}
                                formatDay={(_, date) =>
                                    date.getDate().toString()
                                }
                                onClickDay={(date) => {
                                    if (date && date.getDay() === 0) {
                                        const ok = confirm(
                                            `${date.getDate()}일 수정하시겠습니까?`
                                        );
                                        if (ok && id) mutation.mutate(date);
                                    }
                                }}
                            />
                            <div className={styles.info}>
                                * 날짜를 클릭해 출석을 수정할 수 있습니다.
                                (일요일만 가능)
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
