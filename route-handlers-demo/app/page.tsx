import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <ul>
        <li>
          <Link href="/comments">Comments</Link><br />
          <Link href="/movie">Movie</Link><br />
          <Link href="/login">Login</Link><br />
        </li>
      </ul>
    </div>
  );
}
