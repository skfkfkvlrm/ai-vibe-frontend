export default function JapanLayout({
  list,
  detail,
}: {
  children: React.ReactNode;
  list: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">🗾 hello-japan 여행지</h1>
      <div className="flex flex-1 gap-6">
        <aside className="w-56 shrink-0">{list}</aside>
        <main className="flex-1">{detail}</main>
      </div>
    </div>
  );
}
