"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { FieldError, FormAlert, FormCard } from "@/components/form-fields";
import { loginAttendee } from "@/lib/actions/workshop";
import {
  initialLoginState,
  type LoginState,
} from "@/lib/actions/workshop.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function loginNextPath(searchParams: ReturnType<typeof useSearchParams>) {
  const next = searchParams.get("next");
  return next?.startsWith("/") ? next : "/profile";
}

export function AttendeeLoginForm() {
  const searchParams = useSearchParams();
  const next = loginNextPath(searchParams);
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAttendee,
    initialLoginState
  );

  return (
    <FormCard
      title="Log in"
      description="Sign in with the email and password you used to register."
    >
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <FormAlert ok={state.ok} message={state.message} />

        <div className="space-y-2">
          <Label htmlFor="login-email">Workshop email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              name="email"
              type="email"
              className="pl-11"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <FieldError message={state.fieldErrors?.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              name="password"
              type="password"
              className="pl-11"
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </div>
          <FieldError message={state.fieldErrors?.password} />
        </div>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          <LogIn className="size-4" />
          {pending ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-[14px] text-muted-foreground">
        New to the workshop?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register first
        </Link>
        .
      </p>
    </FormCard>
  );
}
