export default async function ProductIdPage(
    { params, }: { params: Promise<{ productId: string }> }
) {
    const productId = (await params).productId;
    let productName = '';
    let productImage = '';

    if (productId === '1') {
        productName = 'ThinkPad T14';
        productImage = 'ThinkPad T14.jpg';
    } if (productId === '2') {
        productName = 'ASUS ROG Strix G15';
        productImage = 'ASUS ROG Strix G15.jpg';
    } if (productId === '3') {
        productName = 'Buds 3 pro';
        productImage = 'Buds 3 pro.jpg';
    } if (productId === '4') {
        productName = 'LG gram 14';
        productImage = 'LG gram 14.jpg';
    } if (productId === '5') {
        productName = 'MacBook Air M1 13';
        productImage = 'MacBook Air M1 13.jpg';
    }

    return (
        <div>
            <h1><p>{productId}번째 제품</p></h1><br />
            <img src={`/images/${productImage}`} width={300} /><br />
            <button><a href='/products'>돌아가기</a></button>
        </div >
    );
}

// if (productId === '1') {
//     productName = 'ThinkPad T14';
//     productImage = 'ThinkPad T14.jpg';
// } if (productId === '2') {
//     productName = 'ASUS ROG Strix G15';
//     productImage = 'ASUS ROG Strix G15.jpg';
// } if (productId === '3') {
//     productName = 'Buds 3 pro';
//     productImage = 'Buds 3 pro.jpg';
// } if (productId === '4') {
//     productName = 'LG gram 14';
//     productImage = 'LG gram 14.jpg';
// } if (productId === '5') {
//     productName = 'MacBook Air M1 13';
//     productImage = 'MacBook Air M1 13.jpg';
// }

// switch (productId) {
//         case '1':
//             productName = 'ThinkPad T14';
//             productImage = 'ThinkPad T14.jpg';
//             break;
//         case '2':
//             productName = 'ASUS ROG Strix G15';
//             productImage = 'ASUS ROG Strix G15.jpg';
//             break;
//         case '3':
//             productName = 'Buds 3 pro';
//             productImage = 'Buds 3 pro.jpg';
//             break;
//         case '4':
//             productName = 'LG gram 14';
//             productImage = 'LG gram 14.jpg';
//             break;
//         case '5':
//             productName = 'MacBook Air M1 13';
//             productImage = 'MacBook Air M1 13.jpg';
//             break;
//         default:
//             break;
//     }