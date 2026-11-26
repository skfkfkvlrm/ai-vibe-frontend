import Link from "next/link";
import { destinations } from "../api/japan/data";

export default function DestinationList() {
  return (
    <nav aria-label="여행지 목록">
      <h2 className="mb-3 text-lg font-semibold">여행지 목록</h2>
      <ul className="flex flex-col gap-1">
        {destinations.map((d) => (
          <li key={d.id}>
            <Link
              href={`/japan/${d.id}`}
              className="block rounded-md px-3 py-2 hover:bg-black/10 dark:hover:bg-white/10"
            >
              {d.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
