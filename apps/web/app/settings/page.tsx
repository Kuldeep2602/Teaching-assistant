import { AppShell } from "../../components/AppShell";
import { SettingsWorkspace } from "../../components/WorkspaceShowcase";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Profile, preferences, and school defaults" breadcrumbLabel="Settings">
      <SettingsWorkspace />
    </AppShell>
  );
}
