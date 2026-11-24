export default function Hello() {
    let name = '천사무엘';
    name = '인형';
    let address = '경기도 군포시';
    address = '인천광역시 중구';
    const pic = 'lim.jpg';
    return (
        <div>
            <h1>안녕하세요. {name}님</h1><br />
            <p>{address}</p><br />
            <p>{pic}</p><br />
            <img src={`/images/${pic}`} /><br />
            1+2
            <button><a href='/'>돌아가기</a></button>
        </div>
    );
}