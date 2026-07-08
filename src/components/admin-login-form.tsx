"use client";

import { useActionState } from "react";
import { FormAlert, FormCard } from "@/components/form-fields";
import { loginAdmin } from "@/lib/actions/workshop";
import {
  initialAdminLoginState,
  type AdminLoginState,
} from "@/lib/actions/workshop.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    initialAdminLoginState
  );

  return (
    <FormCard title="Admin login" description="Workshop organizer access only.">
      <form action={action} className="space-y-5">
        <FormAlert ok={state.ok} message={state.message} />
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </FormCard>
  );
}
