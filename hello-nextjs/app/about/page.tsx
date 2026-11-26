import styles from "./about.module.css"

export default function About() {
    return (
        <div>
            <h1 className={styles.header}>홈페이지 소개</h1>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}