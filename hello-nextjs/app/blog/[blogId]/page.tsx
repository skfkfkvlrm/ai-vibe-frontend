export default async function BlogDetail({
    params,
}: {
    params: Promise<{ blogId: string }>
}) {
    const blogId = (await params).blogId;
    return (
        <div>
            <p>{blogId}번째 게시글</p>
            <button><a href='/blog'>돌아가기</a></button>
        </div>
    );
}