"use client";

import { Building2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import {
  FieldError,
  FormAlert,
  FormCard,
} from "@/components/form-fields";
import { registerForWorkshop } from "@/lib/actions/workshop";
import {
  initialRegisterState,
  type RegisterState,
} from "@/lib/actions/workshop.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function InputGroup({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: typeof User;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <div className="[&_input]:pl-11">{children}</div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerForWorkshop,
    initialRegisterState,
  );

  return (
    <FormCard
      title="Join the workshop"
      description="Create an account with email and password to access labs, Q&A, and progress tracking."
    >
      <form action={action} className="space-y-5">
        <FormAlert ok={state.ok} message={state.message} />

        <div className="grid gap-5 sm:grid-cols-2">
          <InputGroup
            id="name"
            label="Full name"
            icon={User}
            error={state.fieldErrors?.name}
          >
            <Input
              id="name"
              name="name"
              placeholder="Your full name"
              required
              autoComplete="name"
            />
          </InputGroup>

          <InputGroup
            id="email"
            label="Email"
            icon={Mail}
            error={state.fieldErrors?.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </InputGroup>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputGroup
            id="password"
            label="Password"
            icon={Lock}
            error={state.fieldErrors?.password}
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </InputGroup>

          <InputGroup
            id="confirm_password"
            label="Confirm password"
            icon={Lock}
            error={state.fieldErrors?.confirm_password}
          >
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Repeat password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </InputGroup>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputGroup
            id="company"
            label="Company"
            icon={Building2}
            error={state.fieldErrors?.company}
          >
            <Input
              id="company"
              name="company"
              placeholder="Acme GmbH"
              autoComplete="organization"
            />
          </InputGroup>

          <div className="space-y-2">
            <Label htmlFor="role">Role (optional)</Label>
            <Input id="role" name="role" placeholder="Platform Engineer" />
            <FieldError message={state.fieldErrors?.role} />
          </div>
        </div>

        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="w-full sm:w-auto"
        >
          {pending ? "Creating account…" : "Register for workshop"}
        </Button>
      </form>

      <p className="mt-6 text-[14px] text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
        .
      </p>
    </FormCard>
  );
}
