import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-navy-900 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="VentureOS" width={32} height={32} className="rounded-lg" />
          <span className="font-display text-lg font-bold text-white">
            Venture<span className="text-gold-400">OS</span>
          </span>
        </Link>
        <div>
          <p className="font-display text-3xl font-semibold leading-snug text-white">
            The operating system for entrepreneurs.
          </p>
          <p className="mt-4 max-w-md text-navy-100/60">
            Plan with AI, find your co-founder, and grow inside a community built for founders.
          </p>
        </div>
        <p className="text-xs text-navy-100/40">© {new Date().getFullYear()} VentureOS</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src="/logo.png" alt="VentureOS" width={28} height={28} className="rounded-lg" />
            <span className="font-display text-base font-bold text-navy">
              Venture<span className="text-gold-600">OS</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
          <p className="mt-2 text-sm text-navy-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
