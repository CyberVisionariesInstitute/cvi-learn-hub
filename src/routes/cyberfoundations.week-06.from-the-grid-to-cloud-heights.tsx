import { createFileRoute } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { ExperiencePlayer } from "@/components/demo-lab/ExperiencePlayer";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { fromTheGridToCloudHeights } from "@/lib/demo-lab/experiences/from-the-grid-to-cloud-heights";

export const Route = createFileRoute(
  "/cyberfoundations/week-06/from-the-grid-to-cloud-heights",
)({
  head: () => ({
    meta: [
      { title: "From The Grid to Cloud Heights — CVI Demo Lab" },
      {
        name: "description",
        content:
          "Week 6 live mission: carry networking fundamentals into cloud troubleshooting through a guided investigation with Ivy.",
      },
      {
        property: "og:title",
        content: "From The Grid to Cloud Heights — CVI Demo Lab",
      },
      {
        property: "og:description",
        content:
          "Week 6 live mission: carry networking fundamentals into cloud troubleshooting through a guided investigation with Ivy.",
      },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <ExperiencePlayer
        experience={fromTheGridToCloudHeights}
        environments={cyberfoundations.environments}
      />
    </DemoLabShell>
  );
}
