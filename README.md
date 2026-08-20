# CVI Demo Lab

Yes. It cut off near the QA section. Here is the complete prompt from beginning to end so you can paste it into the new Lovable project in one shot.

Build a new standalone web application called:

CVI DEMO LAB

CyberVisionaries Institute

==================================================
PRODUCT PURPOSE
==================================================

CVI Demo Lab is a permanent interactive teaching application for CyberVisionaries Institute.

This is NOT:

- the CyberFoundations Lab Portal
- a lab submission system
- an LMS
- a quiz application
- a replacement for the Learning Lab
- a student VM management system

CVI Demo Lab is the interactive experience layer used during live classes and available afterward for student reinforcement.

It will support multiple CVI programs and accumulate interactive demonstrations, live missions, scenarios, and guided investigations over time.

The initial programs are:

1. CyberFoundations
2. PKI

The architecture must allow additional programs later without redesigning the application.

The first flagship mission will eventually be:

CyberFoundations
Week 6
From The Grid to Cloud Heights

DO NOT build the complete Week 6 mission in this first pass.

First build the permanent Demo Lab architecture, navigation, visual system, mission framework, and reusable interaction engine.

==================================================
CORE EXPERIENCE PRINCIPLE
==================================================

This application should feel like:

interactive professional training
+
visual storytelling
+
hands-on technical reasoning

NOT:

- an LMS
- a slide deck
- a collection of quiz cards
- a dashboard full of rectangular tiles
- a gamified children's learning app

Students should feel like junior practitioners participating in realistic situations.

The central teaching pattern is:

OBSERVE
→ PREDICT
→ INTERACT
→ GATHER EVIDENCE
→ INTERPRET
→ EXPLAIN

Technical concepts should emerge from realistic situations.

==================================================
REALISM RULE
==================================================

This rule applies across the entire application.

Students should NOT be portrayed as:

- packets traveling through networks
- people physically inside computers
- people walking through routers
- people standing inside virtual machines
- people traveling through cables
- people physically entering ports
- people living inside abstract network diagrams

Instead:

Students and characters exist in believable real-world environments.

Examples:

- neighborhood
- home/office workstation
- IT support workspace
- datacenter campus
- Network Operations Center
- incident response room
- conference/briefing room
- security operations workspace
- PKI operations room

Technical abstractions appear naturally through:

- monitors
- terminal windows
- dashboards
- whiteboards
- network maps
- diagrams
- evidence boards
- tickets
- logs
- tools

The visual metaphor supports the technical concept without turning the technical abstraction into a fantasy world.

==================================================
APPLICATION ARCHITECTURE
==================================================

Design the application to support:

PROGRAM
→ MODULE / PHASE
→ WEEK / TOPIC
→ EXPERIENCE
→ SCENES

Example:

CyberFoundations
  Module 2 — Networking & Cloud Foundations
    Week 5
    Week 6
      From The Grid to Cloud Heights
        Scene 1
        Scene 2
        Scene 3
        etc.

PKI
  Foundations
  Phase 1
  Phase 2
  Phase 3
  etc.

Do not tightly couple the application to Week 6.

Week 6 is only the first major experience.

==================================================
EXPERIENCE TYPES
==================================================

The architecture should support these reusable experience types:

LIVE MISSION

A longer instructor-facilitated interactive experience with multiple scenes and a narrative.

MINI DEMO

A short instructor demonstration of one technical concept.

INTERACTIVE SCENARIO

Students investigate a realistic technical situation.

REPLAY / REINFORCEMENT

A completed live experience students can revisit independently.

Do not require every week to have every experience type.

==================================================
DATA-DRIVEN EXPERIENCE MODEL
==================================================

Do not hard-code every future experience into the main application shell.

Create a reusable experience configuration/model.

A mission should be able to define:

- program
- module / phase
- week / topic
- experience type
- title
- subtitle
- description
- learning objectives
- estimated time
- character(s)
- environment(s)
- scenes
- scene order
- dialogue
- evidence
- interactions
- feedback
- completion criteria
- instructor notes
- replay availability

Each scene should support:

- scene ID
- title
- environment
- character state
- objective
- introductory dialogue
- interactive objects
- evidence
- success state
- retry state
- completion transition

Use reusable components rather than creating an entirely new architecture for every mission.

==================================================
STUDENT MODE
==================================================

Create a Student Experience mode.

Students should be able to:

- browse available programs
- choose a program
- browse available experiences
- launch an experience
- progress one scene at a time
- interact with the environment
- retry safely
- go back when appropriate
- reset only the current scene
- replay completed experiences

Do not require student authentication in this first version.

Do not collect student PII.

Do not create grading.

Do not create leaderboards.

Do not create required completion tracking.

Local browser progress may be supported for convenience.

==================================================
INSTRUCTOR MODE
==================================================

Create the architecture and UI shell for an Instructor Console.

This is important because the Demo Lab will be used during live instruction.

Instructor controls should eventually support:

- launch an experience
- present full screen
- move to next scene
- move to previous scene
- jump to a scene
- reset current scene
- reveal evidence
- reveal explanation
- reveal expected reasoning
- hide/show Ivy dialogue
- restart experience
- open replay mode

For this first pass:

Build the Instructor Console interface and state model.

Do NOT build complex multi-user synchronization yet.

Do NOT require student browsers to follow the instructor browser in real time.

That may be added later.

==================================================
CHARACTER SYSTEM
==================================================

Create a reusable character framework.

The first CyberFoundations character is:

IVY

Role:
Grid Technician

Personality:

- peer
- technically curious
- calm
- practical
- collaborative
- never condescending
- not a professor
- not an AI assistant
- not a mascot

Ivy works alongside the student.

She should not:

- explain every answer
- congratulate every click
- constantly occupy screen space
- behave like Clippy
- lecture students through long dialogue

Ivy should speak primarily to:

- establish context
- pose a problem
- challenge an assumption
- point out contradictory evidence
- transition between scenes
- summarize an important insight

==================================================
CHARACTER MOTION FRAMEWORK
==================================================

The architecture must support animated character states.

Do not create final Ivy animations yet.

Create the framework so future assets can be assigned to states such as:

ivy-idle
ivy-enter
ivy-walk-left
ivy-walk-right
ivy-working
ivy-type
ivy-read-screen
ivy-point
ivy-whiteboard
ivy-thinking
ivy-react
ivy-nod
ivy-briefing

A scene should be able to specify Ivy's current state.

Character motion must:

- be optional
- never block progress
- be interruptible/skippable
- respect prefers-reduced-motion
- fall back gracefully to static imagery

Do not assume every Ivy asset will be a GIF.

Support future use of:

- WebM
- MP4
- animated WebP
- static PNG/WebP

Prefer transparent-background WebM where supported for character overlays.

==================================================
ENVIRONMENT SYSTEM
==================================================

Create reusable environments.

Initial CyberFoundations environment categories:

THE GRID
- neighborhood
- Ivy workstation
- troubleshooting room

CLOUD HEIGHTS
- technology campus
- secure lobby
- Network Operations Center
- remote-access workstation
- incident response room
- briefing room

Initial PKI environment placeholders:

- PKI operations center
- certificate authority workspace
- HSM / key-management operations room
- trust architecture room
- incident room
- briefing room

Do NOT create generic cyberpunk hacker environments.

==================================================
VISUAL DIRECTION
==================================================

The application should be cinematic, dimensional, modern, professional, and technically credible.

Visual inspiration:

- realistic technology environments
- architectural depth
- professional NOC environments
- modern datacenter/cloud campuses
- sophisticated training simulation
- environmental storytelling

CyberFoundations / Cloud Heights direction:

- dark navy / midnight blue
- deep architectural blues
- cyan / teal infrastructure lighting
- warm amber highlights
- subtle violet accents
- cloud / atmospheric depth
- glass and metal used realistically
- realistic workstation lighting

Avoid:

- excessive neon
- Matrix code rain
- hooded hackers
- cartoon cybersecurity clichés
- glowing text everywhere
- generic stock-photo dashboards
- giant empty gradient boxes
- endless rectangular cards
- childish game graphics

The experience should feel appropriate for adult learners entering cybersecurity.

==================================================
ENVIRONMENT + UI INTEGRATION
==================================================

Do not simply display:

background image
+
floating quiz card

Interactive UI should feel integrated into the environment.

Examples:

A support ticket appears on a workstation monitor.

Terminal output appears on a terminal monitor.

A network topology appears on the NOC wall.

Troubleshooting steps appear as cards on a real whiteboard.

Evidence appears on an incident room board.

The final analyst statement appears on a briefing display.

The environment itself should participate in the interaction.

==================================================
INTERACTION ENGINE
==================================================

Create reusable support for multiple interaction patterns.

Include architecture for:

- select an object
- select a location
- drag/drop
- tap-select → tap-place
- ordering / sequencing
- evidence sorting
- evidence linking
- terminal simulation
- command selection
- optional safe command typing
- topology investigation
- status classification
- hypothesis testing
- branching choices
- scene exploration
- evidence board
- briefing construction

Do not implement these as eight versions of multiple choice.

==================================================
WRONG-ANSWER PHILOSOPHY
==================================================

Do not use:

WRONG
red X
try again

as the default educational response.

When possible, incorrect reasoning should:

- reveal additional evidence
- show a contradiction
- produce a believable result
- demonstrate what the chosen tool actually does
- ask the student what their conclusion failed to explain

Example:

Student sees:

Gateway ping:
NO RESPONSE

and declares:

NETWORK OUTAGE

Do not simply say incorrect.

Instead show:

Grid Beacon:
HEALTHY

DNS:
RESOLVING

SSH:
CONNECTED

Then:

"Your conclusion does not explain the remaining evidence."

This is the default learning philosophy.

==================================================
SCENE NAVIGATION
==================================================

Experiences should show one scene at a time.

Do NOT build long scrolling pages containing every scene.

Persistent experience navigation should support:

BACK

RESET THIS SCENE

CONTINUE

Optional:

SCENE / MISSION PROGRESS

Never require:

RESET ALL PROGRESS

to recover from a mistake.

A scene reset must reset only the current scene.

==================================================
ACCESSIBILITY
==================================================

This application must support neurodivergent learners and varied accessibility needs.

Requirements:

- no punitive timers
- no forced speed
- no flashing content
- one primary objective at a time
- persistent instructions where needed
- clear progress
- predictable navigation
- large interaction targets
- keyboard accessibility
- strong focus states
- screen-reader labels
- aria-live for important dynamic feedback
- reduced-motion support
- high contrast
- readable typography
- mobile-friendly interaction fallbacks
- no information communicated only through color
- no required audio

If drag/drop is used:

Desktop:
drag/drop

Keyboard:
select → navigate target → place

Mobile:
tap-select → tap-target

==================================================
AUDIO / VOICE
==================================================

Do not make audio required.

Architecture may support optional:

- environmental sound
- terminal confirmation
- door/access sound
- short Ivy voice transitions

Any audio must:

- default to safe/non-disruptive behavior
- have mute controls
- include equivalent text
- never contain required information

Do not implement full voice functionality in this first pass.

==================================================
HOME PAGE
==================================================

Build a polished CVI Demo Lab landing page.

Headline:

CVI DEMO LAB

Supporting concept:

Interactive demonstrations, live missions, and technical scenarios for CyberVisionaries Institute.

Primary program choices:

CYBERFOUNDATIONS

PKI

Do not make these generic SaaS cards.

Create a visually rich program-selection experience.

CyberFoundations visual identity:

The Grid → Cloud Heights
navy
teal
blue
violet/pink used sparingly as accents

PKI visual identity:

lighter architectural blues
gold
warm trust/security visual language

Each program should feel like entering a different training environment.

==================================================
CYBERFOUNDATIONS PROGRAM PAGE
==================================================

Create the permanent CyberFoundations Demo Lab page.

Organize experiences by week/module.

Initial content may show:

Module 1
Weeks 1–4

Module 2 — Networking & Cloud Foundations
Week 5 — The Grid
Week 6 — Cloud Heights
Week 7 — Coming Next

For Week 6 include a flagship experience placeholder:

FROM THE GRID TO CLOUD HEIGHTS

Type:
Live Mission

Status:
In Development

Description:

Bridge Week 5 networking fundamentals into real cloud troubleshooting through a guided investigation with Ivy.

Do not build the full mission yet.

==================================================
PKI PROGRAM PAGE
==================================================

Create a PKI Demo Lab landing area using its own visual identity.

Use placeholders for future experiences.

Do not copy CyberFoundations styling directly.

PKI should feel:

- trust
- identity
- certificate infrastructure
- enterprise security
- architectural clarity

Do not build actual PKI demos in this pass.

==================================================
INSTRUCTOR CONSOLE
==================================================

Create:

/instructor

This is an instructor-facing shell.

It should show:

- program selector
- experience selector
- experience status
- scene list
- current scene
- Present button
- Previous
- Next
- Jump to Scene
- Reset Scene
- Reveal Evidence
- Reveal Explanation
- Show/Hide Character Dialogue
- Restart Experience

For now, this console can operate against demo/mock experience state.

Do not expose instructor controls in normal student mode.

==================================================
ROUTING
==================================================

Recommended routes:

/

CVI Demo Lab home

/cyberfoundations

CyberFoundations experiences

/cyberfoundations/week-06/from-the-grid-to-cloud-heights

Week 6 flagship mission placeholder / future experience route

/pki

PKI experiences

/instructor

Instructor console

Use the existing framework/router conventions appropriate to the Lovable project.

==================================================
FIRST-PASS CONTENT
==================================================

Build only enough sample content to prove the architecture.

Create:

1. Home page
2. CyberFoundations program page
3. PKI program page
4. Instructor Console shell
5. From The Grid to Cloud Heights experience shell
6. ONE sample/prototype scene for the Week 6 mission

The prototype scene should be:

MISSION 01
KNOW YOUR NEIGHBORHOOD

But do NOT attempt the final cinematic artwork yet.

Use the prototype to demonstrate:

- environment layer
- Ivy character layer / placeholder
- dialogue layer
- interactive-object layer
- feedback
- current-scene reset
- continue behavior
- reduced-motion fallback

The final Mission 01 visual design will be specified separately.

==================================================
KNOW YOUR NEIGHBORHOOD — PROTOTYPE LOGIC
==================================================

The final mission will eventually take place in a believable neighborhood.

For this architecture prototype, establish the logic:

Ivy's workstation:
10.20.5.42/24

Local destinations:
10.20.5.20
10.20.5.99

Remote destinations:
10.20.7.20
10.21.5.42

Gateway:
10.20.5.1

Learning rule for this specific /24 example:

same 10.20.5 neighborhood
→ communicate locally

different neighborhood
→ use gateway

Do not introduce binary subnetting.

Do not imply this simplified visual rule applies to every possible subnet mask.

Explicitly frame it:

"For this /24 example..."

==================================================
SECURITY / DATA
==================================================

Do not include:

- real student credentials
- Bastion shareable URLs
- Azure secrets
- Azure subscription IDs
- private student information
- real student VM assignments

No student PII should be required.

Use simulated/sample infrastructure values only where needed.

==================================================
DO NOT ADD YET
==================================================

Do NOT add:

- Supabase unless genuinely necessary for this architecture
- authentication
- student accounts
- grading
- XP
- leaderboards
- student analytics
- multiplayer
- synchronized instructor/student browsers
- payments
- lab submissions
- VM lifecycle controls
- real Azure calls
- real PKI infrastructure calls

Keep the first architecture intentionally clean.

==================================================
CODE QUALITY
==================================================

Use reusable components.

Avoid giant route components.

Suggested conceptual components:

DemoLabShell
ProgramExperienceBrowser
ExperiencePlayer
SceneRenderer
EnvironmentLayer
CharacterLayer
DialogueLayer
InteractionLayer
EvidencePanel
TerminalSimulation
SceneNavigation
InstructorConsole

Names may differ based on existing conventions.

Separate:

content/configuration
from
presentation
from
interaction state.

Future missions should not require copying an entire page implementation.

==================================================
FINAL FIRST-PASS QA
==================================================

After implementation verify:

HOME
- renders
- CyberFoundations selectable
- PKI selectable
- visually distinct program identities

CYBERFOUNDATIONS
- module/week structure renders
- Week 6 flagship mission visible
- route works
- does not resemble an LMS course catalog

PKI
- separate visual identity
- placeholder architecture works
- route works
- no CyberFoundations-specific visual leakage

EXPERIENCE ENGINE
- one scene at a time
- Back works
- Reset This Scene works
- Continue works
- experience config drives scene content
- Ivy state can be specified
- environment can be specified
- interaction state is isolated to the current scene
- scene reset does not reset previous scenes
- reduced-motion fallback exists

KNOW YOUR NEIGHBORHOOD PROTOTYPE
- local/remote logic correct
- `10.20.5.20` = local
- `10.20.5.99` = local
- `10.20.7.20` = gateway
- `10.21.5.42` = gateway
- incorrect choice does not trap student
- feedback explains reasoning
- reset affects only current scene
- no global reset required
- language clearly says "for this /24 example"

INSTRUCTOR
- console route exists
- program selector works
- experience selector works
- scene list renders
- mock Previous/Next/Jump controls work
- Reset Scene control works
- Reveal Evidence control has a defined state
- Reveal Explanation control has a defined state
- character-dialogue toggle works
- student view does not expose instructor controls

ACCESSIBILITY
- keyboard navigation PASS
- visible focus PASS
- reduced motion PASS
- screen-reader dynamic feedback PASS
- mobile interaction fallback PASS
- no information conveyed only through color PASS
- no required audio PASS

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cvi-learn-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7435b6fb-90c9-493a-a553-2c70b12230ab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
