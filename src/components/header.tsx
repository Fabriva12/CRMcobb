import Image from "next/image";
import Link from "next/link";
import { getSessionUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-brand-500 bg-brand-black">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/cobb_logo.png"
              alt="Cobb Logistic"
              width={1367}
              height={1150}
              priority
              className="h-14 w-auto sm:h-18"
            />
          </Link>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <Link
              href="/"
              className="rounded-md px-3 py-2 font-medium text-brand-white transition hover:bg-white/10 hover:text-brand-300"
            >
              Panel
            </Link>
            <Link
              href="/paquetes"
              className="rounded-md px-3 py-2 font-medium text-brand-white transition hover:bg-white/10 hover:text-brand-300"
            >
              Paquetes
            </Link>
            <Link
              href="/clientes"
              className="rounded-md px-3 py-2 font-medium text-brand-white transition hover:bg-white/10 hover:text-brand-300"
            >
              Clientes
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-400 sm:block">
            {user?.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md px-3 py-2 text-sm font-medium text-brand-white transition hover:bg-white/10 hover:text-brand-300"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
      <nav className="flex flex-wrap items-center gap-1 border-t border-white/10 px-4 py-2 text-sm sm:hidden">
        <Link
          href="/"
          className="rounded-md px-3 py-2 font-medium text-brand-white hover:bg-white/10 hover:text-brand-300"
        >
          Panel
        </Link>
        <Link
          href="/paquetes"
          className="rounded-md px-3 py-2 font-medium text-brand-white hover:bg-white/10 hover:text-brand-300"
        >
          Paquetes
        </Link>
        <Link
          href="/clientes"
          className="rounded-md px-3 py-2 font-medium text-brand-white hover:bg-white/10 hover:text-brand-300"
        >
          Clientes
        </Link>
      </nav>
    </header>
  );
}