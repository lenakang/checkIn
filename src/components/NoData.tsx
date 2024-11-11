import IconFrown from "../assets/IconFrown";
import styles from "../styles/list.module.scss";

export default function NoData() {
    return (
        <div className={styles.noData}>
            <div>
                <IconFrown width="3.2rem" />
                <p>No Data</p>
            </div>
        </div>
    );
}
