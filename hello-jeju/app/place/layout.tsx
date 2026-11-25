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
            {/* <div>{children}</div> */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '200px' }}>{list}</div>
                <div style={{ flex: 1 }}>{detail}</div>
            </div>
        </div >
    );
}