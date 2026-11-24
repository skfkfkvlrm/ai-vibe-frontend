import { calcBmi } from "../_lib/bmi";
export default function HealthPage() {
    let height = 170;
    let weight = 60;
    let result = '';
    let bmi = Number(calcBmi(height, weight)).toFixed(1);
    if (bmi < '0.1') {
        result = '존재할 수 없는 수치';
    } else if (bmi < '18.5') {
        result = '저체중';
    } else if (bmi < '23') {
        result = '정상';
    } else if (bmi < '25') {
        result = '과체중';
    } else {
        result = '비만';
    }
    return (
        <div>
            <h1>bmi 계산</h1>
            <p>키 : {height}cm</p>
            <p>몸무게 : {weight}kg</p>
            <p>bmi : {bmi}({result})</p>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}