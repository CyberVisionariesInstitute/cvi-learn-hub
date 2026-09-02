import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { pki } from "@/lib/demo-lab/programs";

export const Route = createFileRoute("/pki")({
  component: PkiLayout,
});

function PkiLayout() {
  return (
    <DemoLabShell themeClass={pki.themeClass}>
      <Outlet />
    </DemoLabShell>
  );
}
