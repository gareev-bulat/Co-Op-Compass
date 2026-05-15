"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat font-sans dark:bg-black">
      <nav className="absolute top-0 left-0 w-full flex items-center px-8 py-6">
        <span className="text-brand-yellow font-bold text-xl">
          CO-OP COMPASS
        </span>
      </nav>

      <main className="text-white max-w-lg ml-30 -mt-30">
        <h1 className="text-6xl font-bold">Track. Analyze.</h1>
        <h1 className="text-6xl font-bold text-brand-yellow">Succeed.</h1>
        <p className="text-gray-300 mt-4 max-w-md text-lg">
          The all-in-one platform for Drexel students to manage co-op
          applications and insights together.
        </p>

        <div className="flex gap-4 mt-8">
          <Link href="/dashboard">
            <button className="bg-brand-yellow text-black font-semibold px-6 py-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110">
              Get Started
            </button>
          </Link>
          <Link href="/learn-more">
          <button className="border border-white text-white px-6 py-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-white/10">
            Learn More
          </button>
          </Link>
        </div>

        <p className="mt-8 text-gray-400 text-sm flex items-center gap-2">
          Built for Drexel students. Always free.
        </p>
      </main>
    </div>
  );
}
