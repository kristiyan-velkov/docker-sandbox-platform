import { CommandBlock } from "@/components/command-block";
import { DocLink } from "@/components/doc-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommandGroup } from "@/lib/learning-data";

export function CommandReferenceCard({ group }: { group: CommandGroup }) {
  return (
    <Card id={group.id} className="scroll-mt-24 overflow-hidden">
      <CardHeader className="border-b border-slate-200 bg-slate-50/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-[22px]">{group.title}</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-[15px]">
              {group.description}
            </CardDescription>
          </div>
          <DocLink href={group.docsUrl} className="text-[14px]">
            Docker docs
          </DocLink>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {group.commands.map((cmd) => (
          <div key={cmd.command} className="space-y-2">
            <CommandBlock command={cmd.command} />
            <p className="text-[15px] leading-relaxed text-muted-foreground">{cmd.summary}</p>
            {cmd.docsUrl ? (
              <DocLink href={cmd.docsUrl} className="text-[13px]">
                Learn more
              </DocLink>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
