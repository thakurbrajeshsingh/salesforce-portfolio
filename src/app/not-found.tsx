import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f8fc] px-6 text-center">
      <div>
        <p className="section-eyebrow">404 · Record not found</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.06em] text-[#06172c]">
          This mission does not exist.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#607087]">
          Return to Brajesh Kumar&apos;s Salesforce career experience.
        </p>
        <Link href="/" className="button-primary mt-7">
          Return home
        </Link>
      </div>
    </main>
  );
}
