import Link from "next/link";
import { FileText, Scale, Calculator, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <Scale className="h-7 w-7 text-navy" />
          <span className="text-xl font-bold text-navy">Carolina</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-navy hover:bg-slate-100"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90"
          >
            Criar Conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Automacao de{" "}
          <span className="text-navy">Execucoes Bancarias</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Do documento ao protocolo em minutos. OCR inteligente, calculos
          automaticos, geracao de peticoes com IA e gestao completa do fluxo
          processual.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-navy px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-navy/90"
            >
              Comecar Agora
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Ja tenho conta
            </Link>
          </div>
          <a
            href="/api/demo-login"
            className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-8 py-3 text-base font-semibold text-blue-700 shadow-sm hover:bg-blue-100 hover:border-blue-400 transition-colors"
          >
            Ver Demonstracao
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <FileText className="h-10 w-10 text-navy" />
            <h3 className="mt-4 font-semibold text-gray-900">OCR Inteligente</h3>
            <p className="mt-2 text-sm text-gray-600">
              Extracao automatica de dados de documentos bancarios via Google Document AI
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <Calculator className="h-10 w-10 text-navy" />
            <h3 className="mt-4 font-semibold text-gray-900">Calculos Precisos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Correcao monetaria, juros e encargos com indices oficiais do BCB
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <Scale className="h-10 w-10 text-navy" />
            <h3 className="mt-4 font-semibold text-gray-900">Peticoes com IA</h3>
            <p className="mt-2 text-sm text-gray-600">
              Geracao automatica de peticoes com fundamentacao juridica via GPT-4o
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <Shield className="h-10 w-10 text-navy" />
            <h3 className="mt-4 font-semibold text-gray-900">Fluxo Completo</h3>
            <p className="mt-2 text-sm text-gray-600">
              Dashboard, notificacoes, excecoes e controle total do pipeline processual
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
        Carolina &mdash; Automacao de Execucoes e Cobrancas Bancarias
      </footer>
    </main>
  );
}
