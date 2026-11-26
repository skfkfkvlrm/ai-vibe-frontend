import { T } from "../../../_i18n/I18n";
import styles from "../../japan.module.css";

export default function Loading() {
  return (
    <p className={styles.message}>
      <T k="list.loading" />
    </p>
  );
}
