"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { updateProfileName, type UpdateNameState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: UpdateNameState = { error: null };

export function ProfileNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(updateProfileName, initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nome de exibição</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={currentName}
          maxLength={80}
          autoComplete="name"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : saved ? (
          <>
            <Check size={14} /> Salvo
          </>
        ) : (
          "Salvar"
        )}
      </Button>
    </form>
  );
}
