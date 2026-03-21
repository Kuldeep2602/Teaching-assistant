import { AppShell } from "../../components/AppShell";
import { HomeWorkspace } from "../../components/WorkspaceShowcase";

export default function HomePage() {
  return (
    <AppShell title="Home" subtitle="Overview for your classroom workflow" breadcrumbLabel="Home">
      <HomeWorkspace />
    </AppShell>
  );
}
