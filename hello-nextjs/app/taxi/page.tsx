export default function TaxiPage() {
    let money = 4000;
    const canTaxi = money >= 3000;
    return (
        <div>
            <h1>{money >= 3000 ? '택시입니다' : '걸어갑니다'}</h1>
            <a href='/'>홈으로</a>
        </div>
    );
}