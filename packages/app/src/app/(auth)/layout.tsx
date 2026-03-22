export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">Carolina</h1>
          <p className="text-sm text-muted-foreground">
            Automação de Execuções e Cobranças
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
