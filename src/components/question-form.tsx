"use client";

import { HelpCircle, Mail, User } from "lucide-react";
import { useActionState } from "react";
import { FieldError, FormAlert, FormCard, SelectField } from "@/components/form-fields";
import { submitWorkshopQuestion } from "@/lib/actions/workshop";
import {
  initialQuestionState,
  type QuestionState,
} from "@/lib/actions/workshop.types";
import type { AttendeeSession } from "@/lib/workshop/attendee-session";
import { questionLabOptions } from "@/lib/workshop-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuestionFormProps = {
  attendee: AttendeeSession;
  defaultLab?: string;
};

export function QuestionForm({ attendee, defaultLab = "general" }: QuestionFormProps) {
  const [state, action, pending] = useActionState<QuestionState, FormData>(
    submitWorkshopQuestion,
    initialQuestionState
  );

  const labValue = questionLabOptions.some((o) => o.value === defaultLab)
    ? defaultLab
    : "general";

  return (
    <FormCard
      title="Ask a question"
      description={`Signed in as ${attendee.name}. Questions are tagged by lab and visible to the organizer.`}
    >
      <form action={action} className="space-y-5" key={labValue}>
        <FormAlert ok={state.ok} message={state.message} />

        <input type="hidden" name="email" value={attendee.email} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="q-name">Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q-name"
                value={attendee.name}
                className="pl-11"
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q-email"
                value={attendee.email}
                type="email"
                className="pl-11"
                readOnly
                tabIndex={-1}
              />
            </div>
            <FieldError message={state.fieldErrors?.email} />
          </div>
        </div>

        <SelectField
          id="lab_id"
          name="lab_id"
          label="Related lab"
          defaultValue={labValue}
          options={questionLabOptions}
          error={state.fieldErrors?.lab_id}
        />

        <div className="space-y-2">
          <Label htmlFor="question">Your question</Label>
          <div className="relative">
            <HelpCircle className="pointer-events-none absolute left-4 top-4 size-4 text-muted-foreground" />
            <textarea
              id="question"
              name="question"
              rows={4}
              required
              placeholder="How does credential injection work with Claude Code OAuth?"
              className="flex min-h-[120px] w-full resize-y rounded-[10px] border border-border bg-input py-3 pl-11 pr-4 text-[15px] leading-relaxed tracking-[-0.022em] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_15%,transparent)]"
            />
          </div>
          <FieldError message={state.fieldErrors?.question} />
        </div>

        <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
          {pending ? "Sending…" : "Submit question"}
        </Button>
      </form>
    </FormCard>
  );
}
