import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <ul>
        <li>
          <Link href="/comments">Comments</Link>
        </li>
      </ul>
    </div>
  );
}
