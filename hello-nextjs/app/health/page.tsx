"use client";
import { useState } from "react";
import { calcBmi } from "../_lib/bmi";

export default function HealthPage() {
    const [height, setHeight] = useState<number>(0);
    const [weight, setWeight] = useState<number>(0);
    const [bmi, setBmi] = useState<number>(0);
    const [result, setResult] = useState<string>('')
    const inputStyle = { width: '60px', textAlign: "right" as const };

    function handleBmi() {
        const value = calcBmi(height, weight);
        setBmi(value);

        if (!isFinite(value) || value <= 0) setResult('존재할 수 없는 수치');
        else if (value < 18.5) setResult('저체중');
        else if (value < 23) setResult('정상');
        else if (value < 25) setResult('과체중');
        else setResult('비만');
    }

    return (
        <div>
            <h1>bmi 계산</h1>
            <p>
                <span style={{ display: "inline-block", width: "70px" }}>키 :</span>
                <input type="text" placeholder="키를 입력해주세요"
                    value={height} onChange={(e) => setHeight(Number(e.target.value))}
                    style={inputStyle}></input>cm
            </p>
            <p>
                <span style={{ display: "inline-block", width: "70px" }}>몸무게 :</span>
                <input type="text" placeholder="몸무게를 입력해주세요"
                    value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                    style={inputStyle}></input>kg
            </p>
            <button onClick={handleBmi} style={{
                backgroundColor: "#000fff",
                color: "#ffffff",
                padding: "10px 20px"
            }}>=</button>
            <p>bmi : {bmi.toFixed(1)}({result})</p>
            <button><a href='/'>돌아가기</a></button>
        </div >
    );
}