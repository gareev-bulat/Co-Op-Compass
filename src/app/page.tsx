import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-16 py-32 sm:items-start">
        Hello
      </main>
    </div>
  );
}
