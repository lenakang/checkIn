import { auth, db } from "../firebase";
import {
    collection,
    deleteDoc,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import useDate from "./useDate";
import { CheckInFields, CollectionNames } from "../constants";
import { CheckIn, Member, ModifyForm, SetCheckIn } from "../types";
import { deleteUser, updateProfile, User } from "firebase/auth";

const { minDate, thisMonth, todayFormat } = useDate();

// 날짜에 해당하는 CheckIn 문서 가져오기
const getCheckInDateDoc = async (date: string) => {
    const q = query(
        collection(db, CollectionNames.CHECK_IN),
        where("date", "==", date)
    );
    return await getDocs(q);
};

// 멤버 리스트 가져오기
export const fetchMembers = async (): Promise<Member[]> => {
    const user = auth.currentUser;
    if (!user) {
        console.error("사용자가 로그인하지 않았습니다.");
        return [];
    }

    try {
        const q = query(
            collection(db, CollectionNames.MEMBERS),
            orderBy("createdAt", "desc"),
            where("uid", "==", user.uid)
        );
        const querySnaps = await getDocs(q);
        return querySnaps.docs.map((member) => ({
            id: member.id,
            ...(member.data() as Omit<Member, "id">),
        }));
    } catch (error) {
        console.error("멤버를 가져오는 중 오류 발생:", error);
        return [];
    }
};

// 모든 멤버 리스트 가져오기
export const fetchAllMembers = async (): Promise<Member[]> => {
    const user = auth.currentUser;
    if (!user) {
        console.error("사용자가 로그인하지 않았습니다.");
        return [];
    }

    try {
        const q = query(
            collection(db, CollectionNames.MEMBERS),
            orderBy("createdAt", "desc")
        );
        const querySnaps = await getDocs(q);
        return querySnaps.docs.map((member) => ({
            id: member.id,
            ...(member.data() as Omit<Member, "id">),
        }));
    } catch (error) {
        console.error("멤버를 가져오는 중 오류 발생:", error);
        return [];
    }
};

// 오늘 날짜에 대한 CheckIn 정보 가져오기
export const fetchCheckIns = async (): Promise<CheckIn> => {
    try {
        const querySnaps = await getCheckInDateDoc(todayFormat);
        if (querySnaps.empty) {
            return { date: "", members: [] };
        } else {
            const doc = querySnaps.docs[0];
            return doc.data() as CheckIn;
        }
    } catch (error) {
        console.error("CheckIn 정보를 가져오는 중 오류 발생:", error);
        return { date: "", members: [] };
    }
};

// CheckIn 문서 생성하기
const createCheckIn = async ({
    memberId,
    date,
}: {
    memberId: string;
    date: string;
}) => {
    const docId = uuidv4();
    const newCheckIn: CheckIn = {
        date,
        members: [memberId],
    };
    await setDoc(doc(db, CollectionNames.CHECK_IN, docId), newCheckIn);
};

// CheckIn 상태를 토글하기
const toggleCheckIn = async (
    docRef: DocumentReference<CheckIn>,
    memberId: string
) => {
    try {
        const docSnap = await getDoc(docRef);
        const data = docSnap.data() as CheckIn;

        if (!data) {
            console.error(`Document with ID ${docRef.id} not found`);
            return;
        }

        const { members } = data;
        const isMemberCheckedIn = members.includes(memberId);
        const updatedMembers = isMemberCheckedIn
            ? members.filter((id) => id !== memberId)
            : [...members, memberId];

        if (updatedMembers.length === 0) {
            await deleteDoc(docRef); // checkIn이 없다면 문서 삭제
        } else {
            await updateDoc(docRef, { members: updatedMembers });
        }
    } catch (error) {
        console.error("체크인 상태 토글 에러 :", error);
    }
};

// CheckIn 설정하기
export const setCheckIn = async ({
    date,
    memberId,
}: SetCheckIn): Promise<void> => {
    try {
        const querySnaps = await getCheckInDateDoc(date);

        if (querySnaps.empty) {
            await createCheckIn({ memberId, date }); // CheckIn 생성
        } else {
            const docRef = doc(
                db,
                CollectionNames.CHECK_IN,
                querySnaps.docs[0].id
            ) as DocumentReference<CheckIn>;
            await toggleCheckIn(docRef, memberId); // CheckIn 상태 토글
        }
    } catch (error) {
        console.error("CheckIn 설정 중 오류 발생:", error);
    }
};

// 특정 ID의 멤버 가져오기
export const getMember = async (id: string): Promise<Member> => {
    try {
        const docRef = doc(db, CollectionNames.MEMBERS, id);
        const docSnap = await getDoc(docRef);
        return {
            id,
            ...(docSnap.data() as Omit<Member, "id">),
        };
    } catch (error) {
        console.log("멤버를 가져오는 중 오류 발생:", error);
        return { id: "", name: "", createdAt: 0, uid: "" };
    }
};

// 날짜 Format
const formatDate = (date: Date | string) => moment(date).format("YYYY-MM-DD");

// 특정 ID의 멤버의 CheckIn 기록 가져오기
export const getCheckIns = async (id: string) => {
    try {
        const q = query(
            collection(db, CollectionNames.CHECK_IN),
            where(CheckInFields.DATE, ">=", formatDate(minDate)),
            where(CheckInFields.DATE, "<=", formatDate(new Date())),
            where(CheckInFields.MEMBERS, "array-contains", id)
        );
        const querySnaps = await getDocs(q);
        const checkInDates = querySnaps.docs.map(
            (doc) => (doc.data() as CheckIn).date
        );
        return checkInDates;
    } catch (error) {
        console.log("CheckIn 가져오는 중 오류 발생:", error);
        return [];
    }
};

// 멤버 CheckIn 통계 가져오기
export const getCheckInStat = async () => {
    try {
        const q = query(
            collection(db, CollectionNames.CHECK_IN),
            where(CheckInFields.DATE, ">=", formatDate(thisMonth)),
            where(CheckInFields.DATE, "<=", formatDate(new Date()))
        );
        const querySnaps = await getDocs(q);
        const members = querySnaps.docs
            .map((doc) => (doc.data() as CheckIn).members)
            .flat();
        return members
            .flat()
            .reduce((acc: Record<string, number>, user: string) => {
                acc[user] = (acc[user] || 0) + 1;
                return acc;
            }, {});
    } catch (error) {
        console.log("CheckIn 가져오는 중 오류 발생:", error);
        return {};
    }
};

// CheckIn 정보 삭제하기
export const deleteCheckIns = async (id: string) => {
    try {
        const q = query(
            collection(db, CollectionNames.CHECK_IN),
            where(CheckInFields.MEMBERS, "array-contains", id)
        );
        const querySnaps = await getDocs(q);

        const deletePromises = querySnaps.docs.map(async (checkInDoc) => {
            const { members } = checkInDoc.data();
            if (members.length === 1) {
                return deleteDoc(
                    doc(db, CollectionNames.CHECK_IN, checkInDoc.id)
                );
            } else {
                const updatedMembers = members.filter((i: string) => i !== id);
                return updateDoc(
                    doc(db, CollectionNames.CHECK_IN, checkInDoc.id),
                    {
                        members: updatedMembers,
                    }
                );
            }
        });

        await Promise.all(deletePromises);
    } catch (error) {
        console.log("CheckIn 정보 중 오류 발생:", error);
        return {};
    }
};

// 멤버 삭제하기
export const deleteMember = async (id: string): Promise<void> => {
    try {
        if (id) {
            await deleteCheckIns(id);
            const docMemberRef = doc(db, CollectionNames.MEMBERS, id);
            await deleteDoc(docMemberRef);
        }
    } catch (error) {
        console.log("멤버 삭제 중 오류 발생:", error);
    }
};

// 모든 멤버 삭제하기
export const deleteMembers = async (uid: string): Promise<void> => {
    try {
        const q = query(
            collection(db, CollectionNames.MEMBERS),
            where("uid", "==", uid)
        );
        const querySnaps = await getDocs(q);
        const deletePromises: Promise<void>[] = querySnaps.docs.map((doc) =>
            deleteMember(doc.id)
        );
        await Promise.all(deletePromises);
    } catch (error) {
        console.log("유저의 모든 학생 삭제 중 오류 발생:", error);
    }
};

// 유저 삭제하기
export const deleteUserAndInfo = async (user: User) => {
    try {
        await deleteMembers(user.uid);
        await deleteUser(user);
    } catch (error) {
        console.log("유저 삭제 중 오류 발생:", error);
    }
};

// 멤버 정보를 수정 또는 추가하기
export const modifyMember = async (formData: ModifyForm, id: string | null) => {
    const user = auth.currentUser;
    if (!id && user) {
        const member: Omit<Member, "id"> = {
            name: formData.name,
            age: formData.age,
            uid: user.uid,
            createdAt: Date.now(),
        };
        await setDoc(doc(db, CollectionNames.MEMBERS, uuidv4()), member);
    } else if (id) {
        await updateDoc(doc(db, CollectionNames.MEMBERS, id), { ...formData });
    }
};

// 구글 로그인 사용자 이름 변경하기
export const modifyGoogleName = async ({ name }: { name: string }) => {
    try {
        const user = auth.currentUser;
        if (user) {
            await updateProfile(user, {
                displayName: name,
            });
        }
    } catch (error) {
        console.log("사용자 이름 변경 중 오류 발생:", error);
    }
};
