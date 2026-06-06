"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { error: null };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initial);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-950/40">
          ✉️
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Verifique seu email
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            Se existir uma conta com esse email, enviamos um link para você
            redefinir a senha.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Voltar para login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Esqueceu a senha?
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Informe seu email e enviaremos um link para redefinir.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link de redefinição"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
