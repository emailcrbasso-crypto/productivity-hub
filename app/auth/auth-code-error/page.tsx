import Link from "next/link";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Não conseguimos entrar
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {reason ?? "Algo deu errado na autenticação."}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
