import { createFileRoute } from "@tanstack/react-router";
import { DemoLabShell } from "@/components/demo-lab/DemoLabShell";
import { ExperiencePlayer } from "@/components/demo-lab/ExperiencePlayer";
import { cyberfoundations } from "@/lib/demo-lab/programs";
import { cloudHeightsGuardPost } from "@/lib/demo-lab/experiences/cloud-heights-guard-post";

const description =
  "Week 7 live mission: work security incident CH-8080 at the Cloud Heights Guard Post — rule priority, least privilege, and paired positive and negative testing.";

export const Route = createFileRoute(
  "/cyberfoundations/week-07/cloud-heights-guard-post",
)({
  head: () => ({
    meta: [
      { title: "Cloud Heights Guard Post — CVI Demo Lab" },
      { name: "description", content: description },
      { property: "og:title", content: "Cloud Heights Guard Post — CVI Demo Lab" },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <DemoLabShell themeClass={cyberfoundations.themeClass}>
      <ExperiencePlayer
        experience={cloudHeightsGuardPost}
        environments={cyberfoundations.environments}
      />
    </DemoLabShell>
  );
}
