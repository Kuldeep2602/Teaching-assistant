import { AppShell } from "../../components/AppShell";
import { ToolkitWorkspace } from "../../components/WorkspaceShowcase";

export default function ToolkitPage() {
  return (
    <AppShell
      title="AI Teacher's Toolkit"
      subtitle="Prototype reusable AI workflows for daily teaching"
      breadcrumbLabel="AI Toolkit"
    >
      <ToolkitWorkspace />
    </AppShell>
  );
}
