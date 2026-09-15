import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Ingresar — Cobb Logistic",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center overflow-hidden rounded-xl bg-brand-black">
          <Image
            src="/cobb_logo.png"
            alt="Cobb Logistic"
            width={1367}
            height={1150}
            priority
            className="h-16 w-auto"
          />
        </div>
        <div className="rounded-xl border border-brand-300 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}