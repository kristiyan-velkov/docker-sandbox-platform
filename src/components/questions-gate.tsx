import { FormCard } from "@/components/form-fields";
import { LinkButton } from "@/components/link-button";

export function QuestionsGate() {
  return (
    <FormCard
      title="Registration required"
      description="Only registered workshop attendees can ask questions. Create an account or log in to continue."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/register" size="lg">
          Register for the workshop
        </LinkButton>
        <LinkButton href="/login" variant="secondary" size="lg" hardNav>
          Log in
        </LinkButton>
      </div>

      <p className="mt-6 text-[14px] text-muted-foreground">
        After registering, you&apos;ll use your email and password to sign in on any device.
      </p>
    </FormCard>
  );
}
