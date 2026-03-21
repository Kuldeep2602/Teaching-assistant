import { AppShell } from "../../components/AppShell";
import { GroupsWorkspace } from "../../components/WorkspaceShowcase";

export default function GroupsPage() {
  return (
    <AppShell title="My Groups" subtitle="Organize classes, sections, and activity" breadcrumbLabel="My Groups">
      <GroupsWorkspace />
    </AppShell>
  );
}
