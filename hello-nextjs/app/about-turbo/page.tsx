import styles from "./about-turbo.module.css"

export default function AboutTurbo() {
    return (
        <div>
            <h1 className={styles.header}>홈페이지 소개 (Turbopack)</h1>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}
