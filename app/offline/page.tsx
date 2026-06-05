export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950">
      <div className="max-w-sm space-y-3">
        <span aria-hidden className="text-4xl">
          ⚡
        </span>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Você está offline
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Reconecte para continuar usando o Hub.
        </p>
      </div>
    </div>
  );
}
