import ModalProvider from "../_components/ModalProvider";
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
        <header className={styles.header}>
          <span className={styles.sun} aria-hidden="true" />
          <div>
            <h1 className={styles.title}>hello-japan</h1>
            <p className={styles.subtitle}>日本 旅行地 案内</p>
          </div>
        </header>
        <div className={styles.body}>
          <aside className={styles.side}>{list}</aside>
          <main className={styles.main}>{detail}</main>
        </div>
      </div>
      </ModalProvider>
    </div>
  );
}
