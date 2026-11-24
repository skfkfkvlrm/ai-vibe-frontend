export default function DashboardLayout({
    children,
    memberManage,
    notification,
    salesManage
}: {
    children: React.ReactNode;
    memberManage: React.ReactNode;
    notification: React.ReactNode;
    salesManage: React.ReactNode;

}) {
    return (
        <div>
            <div>{children}</div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>{memberManage}</div>
                    <div>{salesManage}</div>
                </div>
                <div>{notification}</div>
            </div>
        </div>
    );
}