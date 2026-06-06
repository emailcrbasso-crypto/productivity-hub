"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail, signInWithGoogle, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, initial);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-950/40">
          ✉️
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Confirme seu email
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            Enviamos um link de confirmação para o seu email. Clique nele para
            ativar sua conta e começar a usar o hub.
          </p>
        </div>
        <p className="text-xs text-zinc-400">
          Não recebeu? Verifique a caixa de spam ou{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white"
          >
            tente novamente
          </Link>
          .
        </p>
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
          Criar conta
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Comece a usar seu hub em segundos.
        </p>
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          Continuar com Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            ou
          </span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome</Label>
          <Input id="full_name" name="full_name" type="text" autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Já tem conta?{" "}
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
