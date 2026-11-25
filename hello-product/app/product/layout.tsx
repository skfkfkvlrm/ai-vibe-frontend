export default function ProductLayout({
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
                <div style={{ flex: 1, width: '200px' }}>{list}</div>
                <div style={{ flex: 2 }}>{detail}</div>
            </div>
        </div >
    );
}