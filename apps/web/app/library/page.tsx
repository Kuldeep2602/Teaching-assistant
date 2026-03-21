import { AppShell } from "../../components/AppShell";
import { LibraryWorkspace } from "../../components/WorkspaceShowcase";

export default function LibraryPage() {
  return (
    <AppShell title="My Library" subtitle="Store and revisit reusable teaching assets" breadcrumbLabel="My Library">
      <LibraryWorkspace />
    </AppShell>
  );
}
