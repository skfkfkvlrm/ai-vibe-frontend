export default function HealthPage() {
    let height = 170;
    let weight = 65;
    let cul = weight / (height / 100 * height / 100);
    const bmi = Number(cul).toFixed(3);
    return (
        <div>
            <h1>bmi 계산</h1>
            <p>키 : {height}cm</p>
            <p>몸무게 : {weight}kg</p>
            <p>bmi : {bmi}</p>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}