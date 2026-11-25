"use client"
import { useState, useEffect } from "react";

type Dog = {
    message: string;
}

export default function DogsPage() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    async function loadDogs() {
        const response = await fetch("https://dog.ceo/api/breeds/image/random");
        const data = await response.json();
        setDogs([data]);
    }
    useEffect(() => {
        loadDogs();
    }, []);
    return (
        <div>
            <h1>강아지 페이지</h1>
            <ul>
                {dogs.map((dog) => (
                    <li key={dog.message}>
                        <img src={dog.message} width={300}></img>
                    </li>
                ))}
            </ul>
            <button onClick={loadDogs}
                style={{
                    backgroundColor: "#000fff",
                    color: "#ffffff",
                    padding: "10px 20px"
                }}>더보기</button><br />
            <button><a href='/'>돌아가기</a></button>

        </div>
    );
}
