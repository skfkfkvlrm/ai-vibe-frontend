import { T } from "../../../_i18n/I18n";
import styles from "../../japan.module.css";

export default function DetailNotFound() {
  return (
    <p className={styles.error}>
      <T k="detail.notFound" />
    </p>
  );
}
