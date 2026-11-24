export default function PlaceLayout({
    children,
    list,
    detail
}: {
    children: React.ReactNode;
    list: React.ReactNode;
    detail: React.ReactNode;
}) {
    return (
        <div>
            <div>{children}</div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>{list}</div>
                    <div>{detail}</div>
                </div>
            </div>
        </div>
    );
}