import ModalProvider from "../_components/ModalProvider";
import SiteHeader from "../_components/SiteHeader";
import styles from "./japan.module.css";

export default function JapanLayout({
  list,
  detail,
}: {
  children: React.ReactNode;
  list: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <ModalProvider>
        <div className={styles.container}>
          <SiteHeader />
          <div className={styles.body}>
            <aside className={styles.side}>{list}</aside>
            <main className={styles.main}>{detail}</main>
          </div>
        </div>
      </ModalProvider>
    </div>
  );
}
