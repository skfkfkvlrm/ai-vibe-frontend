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
            <style>{`.place-children a, .place-children br { display: none; }`}</style>
            <div className="place-children">{children}</div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>{list}</div>
                    <div>{detail}</div>
                </div>
            </div>
        </div>
    );
}