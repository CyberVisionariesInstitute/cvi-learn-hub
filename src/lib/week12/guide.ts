/**
 * Week 12 guided instructions — presentation only.
 * Steps never read answer keys, never write learner content and never change
 * Final QA. Checkmarks and guide position are browser-local coaching only.
 */
import type { ExecOption } from "./model";

export interface GuideTarget { label: string; stage: number; anchor: string; /** Stage 3 pager index to select before focusing (navigation only). */ section?: number }
export interface GuideStep {
  id: string;
  /** Only shown when the student has chosen this Stage 4 path. */
  branch?: "written" | "video";
  doing: string; where: string; lookFor: string; whenDone: string;
  links: GuideTarget[];
  help?: string;
}

const t = (label: string, stage: number, anchor: string, section?: number): GuideTarget => (section === undefined ? { label, stage, anchor } : { label, stage, anchor, section });

export const GUIDE_STEPS: Record<number, GuideStep[]> = {
  1: [
    { id: "s1-read", doing: "Read your own Week 11 source, one finding at a time.", where: "Stage 1 → \"Your Week 11 source\" card. Open each finding to expand it.", lookFor: "The finding title, the event IDs shown next to it, and the observation, conclusion and uncertainty you wrote in Week 11.", whenDone: "You can say in one sentence what each of your Week 11 findings is about.", links: [t("Your Week 11 source", 1, "w12-source")], help: "This is a frozen, read-only copy of your Week 11 Lab 06 Case File. Nothing you do in Week 12 changes Week 11." },
    { id: "s1-draft", doing: "Check whether your source says DRAFT SOURCE.", where: "Top of the page, under the hero image: the source badge and the yellow DRAFT SOURCE box (only shown if Lab 06 was not complete).", lookFor: "\"Source: Week 11 Lab 06 complete\" means you can move on. \"DRAFT SOURCE\" means some Lab 06 work was missing when Week 12 copied it.", whenDone: "Your source is complete — or you know you must fix it: open Week 11 Lab 06 with this same account, complete the missing work, come back here and choose \"Refresh from Week 11…\". Your Week 12 writing is kept; then check your evidence references still match.", links: [t("Source badge", 1, "w12-top")], help: "You can keep working while the source is a draft. Week 12 only becomes final-ready after the source is complete and you have refreshed it yourself — it never refreshes on its own." },
    { id: "s1-labels", doing: "Learn the six labels before you start sorting.", where: "\"Classify your source statements\" card → \"What do the labels mean?\".", lookFor: "Fact, Evidence, Finding, Interpretation, Unknown, Recommendation — and the fictional example about a library badge reader.", whenDone: "You can explain the difference between a fact and an interpretation.", links: [t("What do the labels mean?", 1, "w12-labels")] },
    { id: "s1-classify", doing: "Label one statement, then move to the next.", where: "\"Classify your source statements\" card → \"This is a…\" menu. Use \"Next statement →\" to move on.", lookFor: "Is the statement directly recorded (fact), a record ID (evidence), a supported conclusion (finding), a possible meaning (interpretation), an open question (unknown), or an action (recommendation)?", whenDone: "Every statement has a label. The counter shows all statements labelled.", links: [t("Classify your source statements", 1, "w12-classify")], help: "Labelling is a learning review activity to sharpen your thinking. There are no right-answer marks and it is NOT a Final QA check." },
  ],
  2: [
    { id: "s2-language", doing: "Read the defensible language tips.", where: "Stage 2 → \"Defensible language\" card.", lookFor: "Phrases like \"The records show…\" and \"We could not confirm…\".", whenDone: "You know how to say only what your evidence shows.", links: [t("Defensible language", 2, "w12-language")] },
    { id: "s2-pick", doing: "Pick ONE finding to work on.", where: "Stage 2 → \"Finding X of Y\" bar. Use \"← Previous finding\" / \"Next finding →\".", lookFor: "Which Week 11 finding this came from (shown above the title).", whenDone: "One finding is on screen.", links: [t("Finding picker", 2, "w12-finding-picker")], help: "Work on Finding 1 fully, then Finding 2. You need at least two evidence-linked findings." },
    { id: "s2-statement", doing: "Rewrite the finding statement.", where: "Current finding → \"Report-ready finding statement\".", lookFor: "One or two sentences naming what the records show. Starter: \"The records show…\"", whenDone: "The statement is at least one full sentence (20+ characters) and makes no claim your records cannot show.", links: [t("Report-ready finding statement", 2, "w12-f-statement")] },
    { id: "s2-refs", doing: "Add the evidence or event IDs that support it.", where: "Current finding → \"Evidence / event references\". Copy IDs from Stage 1.", lookFor: "Each ID turns into a ✓ badge. A \"✕ not in source\" badge means the ID is not in your Week 11 source.", whenDone: "At least one ✓ badge and no ✕ badges.", links: [t("Evidence / event references", 2, "w12-f-refs"), t("Your Week 11 source", 1, "w12-source")] },
    { id: "s2-confidence", doing: "Choose your confidence.", where: "Current finding → \"Confidence\".", lookFor: "Confirmed by records, Likely, or Possible — pick the one your evidence honestly supports.", whenDone: "A confidence is chosen.", links: [t("Confidence", 2, "w12-f-confidence")] },
    { id: "s2-uncertain", doing: "Write what remains uncertain.", where: "Current finding → \"What remains uncertain?\".", lookFor: "What these records cannot tell you. Starter: \"The records do not show…\"", whenDone: "One short sentence is written.", links: [t("What remains uncertain?", 2, "w12-f-uncertainty")] },
    { id: "s2-wording", doing: "Check for high-certainty wording.", where: "Bottom of Stage 2 → yellow \"Can your evidence support this statement?\" box (only shown if flagged).", lookFor: "Flagged words such as \"breach\" or \"proven\".", whenDone: "Each flagged word is reworded or has an evidence note. Unreviewed flags block Final QA.", links: [t("Wording check", 2, "w12-coach")] },
    { id: "s2-next", doing: "Repeat for your second finding.", where: "\"Next finding →\" — or \"+ Add another evidence-supported finding\" if you have fewer than two.", lookFor: "Finding 2 with its own statement, references, confidence and uncertainty.", whenDone: "At least two findings each have a statement and a ✓ reference.", links: [t("Finding picker", 2, "w12-finding-picker")] },
  ],
  3: [
    { id: "s3-header", doing: "Fill in the report header.", where: "Stage 3 → section \"Report header\": \"Report title\" and \"Analyst (your name)\".", lookFor: "A clear title and your own name.", whenDone: "Both boxes are filled.", links: [t("Report header", 3, "w12-report-section", 0)] },
    { id: "s3-sections", doing: "Write ONE report section, then choose \"Save & next section →\".", where: "Stage 3 → \"Section X of 10\" bar. Each section has its own prompt and sentence starter.", lookFor: "The \"What belongs here?\" prompt for the section on screen.", whenDone: "Each written section has at least one or two full sentences (20+ characters).", links: [t("Current report section", 3, "w12-report-section")], help: "Your typing autosaves. Moving between sections never deletes anything." },
    { id: "s3-auto", doing: "Check sections 5 and 7 — you do not write them here.", where: "Section 5 (Findings) and Section 7 (Recommendations) in the Stage 3 section bar.", lookFor: "Section 5 is filled automatically from Stage 2. Section 7 is filled automatically from Stage 5.", whenDone: "You know recommendations wait until Stage 5 — no copy-paste needed.", links: [t("Stage 2 findings", 2, "w12-finding-picker"), t("Stage 5 recommendations", 5, "w12-rec-picker")] },
    { id: "s3-limits", doing: "Write the limitations section.", where: "Section 8 \"Limitations / unknowns\".", lookFor: "What the evidence cannot tell you and data you did not have.", whenDone: "At least one full sentence (20+ characters).", links: [t("Section 8 Limitations / unknowns", 3, "w12-report-section", 8)] },
    { id: "s3-wording", doing: "Check for high-certainty wording in the report.", where: "Bottom of Stage 3 → yellow wording box (only shown if flagged).", lookFor: "Flagged words in Purpose, Timeline, Impact or Conclusion.", whenDone: "Each flag is reworded or has an evidence note.", links: [t("Wording check", 3, "w12-coach")] },
  ],
  4: [
    { id: "s4-choose", doing: "Choose ONE executive communication.", where: "Stage 4 → \"A. Written Executive Summary\" or \"B. Video Executive Briefing\".", lookFor: "Both options are equally weighted. The Technical Incident Report from Stage 3 is required for BOTH.", whenDone: "One option is selected. Switching later keeps both drafts; only the selected one is checked and exported.", links: [t("Choose your option", 4, "w12-exec-choice")] },
    { id: "s4-w-happened", branch: "written", doing: "Answer \"What happened?\" in plain language.", where: "Written Executive Summary → \"What happened?\".", lookFor: "Two or three sentences a leader with no IT background understands.", whenDone: "The box has a short plain-language answer.", links: [t("What happened?", 4, "w12-w-whatHappened")] },
    { id: "s4-w-why", branch: "written", doing: "Answer \"Why does it matter?\".", where: "Written Executive Summary → \"Why does it matter?\".", lookFor: "Business impact: who or what could be affected.", whenDone: "The box has an answer without jargon.", links: [t("Why does it matter?", 4, "w12-w-whyMatters")] },
    { id: "s4-w-found", branch: "written", doing: "Answer \"What did we find?\".", where: "Written Executive Summary → \"What did we find?\".", lookFor: "Your Stage 2 findings, said simply.", whenDone: "The box has an answer.", links: [t("What did we find?", 4, "w12-w-whatFound")] },
    { id: "s4-w-next", branch: "written", doing: "Answer \"What should happen next?\".", where: "Written Executive Summary → \"What should happen next?\".", lookFor: "The main actions from your recommendations.", whenDone: "The box has an answer.", links: [t("What should happen next?", 4, "w12-w-nextSteps")] },
    { id: "s4-w-uncertain", branch: "written", doing: "If it matters, answer \"What remains uncertain?\".", where: "Written Executive Summary → \"What remains uncertain? (if material)\".", lookFor: "Only open questions a leader needs to know about.", whenDone: "Written if material — or left empty if not.", links: [t("What remains uncertain?", 4, "w12-w-uncertain")] },
    { id: "s4-w-count", branch: "written", doing: "Check your total word count.", where: "Written Executive Summary card header: \"N words · target about 250–400\".", lookFor: "The total across all five boxes.", whenDone: "About 250–400 words and nothing listed under \"Still needed\".", links: [t("Written Executive Summary", 4, "w12-exec-form")] },
    { id: "s4-v-link", branch: "video", doing: "Paste your video link.", where: "Video Executive Briefing → \"Video link (https)\". Links only — no uploads.", lookFor: "A link starting with https://.", whenDone: "No red message under the link.", links: [t("Video link", 4, "w12-v-url")] },
    { id: "s4-v-meta", branch: "video", doing: "Add the platform and duration.", where: "\"Platform\" and \"Duration\" boxes.", lookFor: "Duration as m:ss — about 2–3 minutes.", whenDone: "Both boxes filled and duration shows about 2:00–3:00.", links: [t("Platform and duration", 4, "w12-v-meta")] },
    { id: "s4-v-check", branch: "video", doing: "Test playback while signed out.", where: "Open your link in a private / signed-out window, then tick \"I opened the link in a private/signed-out window…\".", lookFor: "The video plays for anyone with the link.", whenDone: "The box is ticked only after the video played signed out.", links: [t("Playback check", 4, "w12-v-check")] },
    { id: "s4-v-outline", branch: "video", doing: "Write your outline.", where: "\"Outline / speaker notes\".", lookFor: "One line per point you make — at least 3 lines.", whenDone: "3 or more bullet lines.", links: [t("Outline / speaker notes", 4, "w12-v-outline")] },
    { id: "s4-v-reflect", branch: "video", doing: "Write a short reflection.", where: "\"Reflection — how did you adapt this for leadership?\".", lookFor: "2–4 sentences (at least 20 words).", whenDone: "Nothing listed under \"Still needed\". The notes and reflection are submission notes, not part of the recorded video.", links: [t("Reflection", 4, "w12-v-reflection")] },
  ],
  5: [
    { id: "s5-format", doing: "Read the actionable format.", where: "Stage 5 → \"From vague to actionable\" card.", lookFor: "The fictional example: action, owner, priority, timeframe, success measure.", whenDone: "You can tell a vague recommendation from an actionable one.", links: [t("From vague to actionable", 5, "w12-recs-format")] },
    { id: "s5-pick", doing: "Pick ONE recommendation to work on.", where: "\"Recommendation X of Y\" bar — or \"+ Add recommendation\" if there are none.", lookFor: "The recommendation key (R1, R2…).", whenDone: "One recommendation is on screen.", links: [t("Recommendation picker", 5, "w12-rec-picker")] },
    { id: "s5-action", doing: "Write the specific action.", where: "\"What — the specific action\".", lookFor: "A full sentence naming exactly what changes, on which account, group or control. Starter: \"Within [timeframe], [team] will…\"", whenDone: "The action is a full sentence, not \"improve security\".", links: [t("What — the specific action", 5, "w12-r-action")] },
    { id: "s5-owner", doing: "Add owner, timeframe and priority.", where: "\"Who owns it\", \"Timeframe\" and \"Priority\".", lookFor: "A team or role, a time limit, and High / Medium / Low.", whenDone: "All three are filled.", links: [t("Owner, timeframe, priority", 5, "w12-r-meta")] },
    { id: "s5-why", doing: "Explain why.", where: "\"Why — which risk it reduces\".", lookFor: "The risk this action lowers.", whenDone: "One sentence written.", links: [t("Why", 5, "w12-r-why")] },
    { id: "s5-link", doing: "Link it to a finding.", where: "\"Linked finding(s)\" checkboxes.", lookFor: "The Stage 2 finding this recommendation responds to.", whenDone: "At least one finding is ticked.", links: [t("Linked finding(s)", 5, "w12-r-linked")] },
    { id: "s5-measure", doing: "Write the success measure.", where: "\"Success measure — how you'll know it worked\".", lookFor: "Something someone could check afterwards.", whenDone: "The card header shows \"✓ Actionable\". It now appears automatically in Section 7 of your report.", links: [t("Success measure", 5, "w12-r-measure")] },
  ],
  6: [
    { id: "s6-qa", doing: "Run through Final QA.", where: "Stage 6 → \"Final QA\" card. Use \"Go to Stage N\" on any ◌ item.", lookFor: "Each ◌ item and the short list under it.", whenDone: "Every item shows ✓. This checks completeness — it is not your instructor's grade.", links: [t("Final QA", 6, "w12-qa")] },
    { id: "s6-status", doing: "Read your saved status.", where: "\"Where is my work?\" card.", lookFor: "Autosaved, final-ready, downloaded, uploaded and submitted are five different things.", whenDone: "You know which ones are done and which still need you.", links: [t("Where is my work?", 6, "w12-status")] },
    { id: "s6-download", doing: "Download your Week 12 ZIP.", where: "\"Download & GitHub\" card → \"Download complete Week 12 ZIP\".", lookFor: "The file name. \"-DRAFT\" in the name means Final QA is not complete.", whenDone: "The ZIP is saved on your computer.", links: [t("Download & GitHub", 6, "w12-download")] },
    { id: "s6-unzip", doing: "Unzip it and keep the folders.", where: "Your computer's Downloads folder.", lookFor: "A week-12 folder containing the report, your executive file, README and source/.", whenDone: "You can see the week-12 folder.", links: [t("Upload steps", 6, "w12-github")] },
    { id: "s6-upload", doing: "Upload the week-12 folder to your own GitHub repository.", where: "Your own CyberFoundations portfolio repository on GitHub — the one that already has week-11/. Add file → Upload files → Commit changes.", lookFor: "week-12/ sitting next to week-11/.", whenDone: "week-12/ is committed in your repository.", links: [t("Upload steps", 6, "w12-github")] },
    { id: "s6-links", doing: "Check the Week 11 link works on GitHub.", where: "GitHub → week-12/technical-incident-report.md → the Week 11 case file link.", lookFor: "The link opens your Week 11 Lab 06 file.", whenDone: "The link opens. If not, check week-11/ and week-12/ are side by side.", links: [t("Upload steps", 6, "w12-github")] },
    { id: "s6-submit", doing: "Complete the submission handoff.", where: "Your course's Lab Submissions / Submission Tracker (outside this site).", lookFor: "Where to provide or confirm your GitHub repository link and Week 12 submission.", whenDone: "Your repository link and Week 12 submission are recorded there for instructor review.", links: [t("Submission handoff", 6, "w12-submit")] },
  ],
};

export function stageSteps(stage: number, opt: ExecOption): GuideStep[] {
  return (GUIDE_STEPS[stage] ?? []).filter((s) => !s.branch || s.branch === opt);
}

export interface StagePref { current: number; completed: string[] }
export interface GuidePrefs { stages: Record<string, StagePref>; lastStage?: number }

export const guideKey = (userId: string, attemptId: string) => `cvi:w12:guide:v1:${userId}:${attemptId}`;

export function parseGuidePrefs(raw: string | null): GuidePrefs {
  try {
    const p = JSON.parse(raw ?? "") as GuidePrefs;
    if (!p || typeof p !== "object" || typeof p.stages !== "object" || !p.stages) return { stages: {} };
    const stages: Record<string, StagePref> = {};
    for (const [k, v] of Object.entries(p.stages)) {
      if (v && Number.isInteger(v.current) && Array.isArray(v.completed)) stages[k] = { current: Math.max(0, v.current), completed: v.completed.filter((x) => typeof x === "string") };
    }
    const last = Number(p.lastStage);
    return { stages, ...(Number.isInteger(last) && last >= 1 && last <= 6 ? { lastStage: last } : {}) };
  } catch { return { stages: {} }; }
}

export function stageProgress(steps: GuideStep[], pref?: StagePref) {
  const current = Math.min(Math.max(pref?.current ?? 0, 0), Math.max(steps.length - 1, 0));
  const completed = steps.filter((s) => pref?.completed.includes(s.id)).length;
  return { current, completed, remaining: steps.length - completed };
}
