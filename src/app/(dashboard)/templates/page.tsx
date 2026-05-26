import { TemplatesLibrary } from "@/components/templates/templates-library";
import { StudioPageShell } from "@/components/layout/studio-page-shell";

export default function TemplatesPage() {
  return (
    <StudioPageShell
      eyebrow="Library"
      title="Visual templates"
      description="A+ modules, infographics, lifestyle frames, and PDP galleries. Use a template as the base — we swap palette, product, and benefit copy to your brand."
    >
      <TemplatesLibrary />
    </StudioPageShell>
  );
}
