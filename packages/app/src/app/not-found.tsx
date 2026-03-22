import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1E3A5F]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Página não encontrada
        </h2>
        <p className="mt-2 text-gray-500">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
