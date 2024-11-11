import moment from "moment";

export default function useDate() {
    const today = new Date();
    const todayFormat = moment().format("YYYY-MM-DD");

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 이번 달

    const minDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 한달 전

    return {
        minDate,
        thisMonth,
        todayFormat,
    };
}
