"use client";
import { useState } from "react";

//외부 API를 연결하는 화면에서 클라이언트 모듈을 사용해서 처리
export default function CalcPage() {
    const [firstNum, setFirstNum] = useState<number>(0);
    const [secondNum, setSecondNum] = useState<number>(0);
    const [sum, setSum] = useState<number>(0);

    function addSum() {
        const sum = firstNum + secondNum;
        setSum(sum);
    }

    return (
        <div>
            <h1>덧셈 계산기입니다.</h1>
            <p>
                첫번째 숫자:
                <input type="text" placeholder="첫번째 숫자를 입력하세요"
                    value={firstNum} onChange={(e) => setFirstNum(Number(e.target.value))}></input><br />
                두번째 숫자:
                <input type="text" placeholder="두번째 숫자를 입력하세요"
                    value={secondNum} onChange={(e) => setSecondNum(Number(e.target.value))}></input><br />
            </p>
            <button onClick={addSum} style={{
                backgroundColor: "#000fff",
                color: "#ffffff",
                padding: "10px 20px"
            }}>+</button>
            <p>합계: {sum}</p>
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}