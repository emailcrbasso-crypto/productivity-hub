"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = { error: null };

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Definir nova senha
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Escolha uma nova senha para sua conta.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            name="confirm"
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
          {pending ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </div>
  );
}
