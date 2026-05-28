export interface PublicShowcaseEntry {
  badge: string
  category: "entry" | "pattern" | "system"
  description: string
  eyebrow: string
  key: string
  stat: string
  storyId: string
  title: string
}

export const createStoryPath = (storyId: string) => `/?path=/story/${storyId}`

export const publicShowcaseEntries: PublicShowcaseEntry[] = [
  {
    badge: "entry",
    category: "entry",
    description:
      "Lead with the preset thesis, the phase-one contract, and the public-luxe visual promise.",
    eyebrow: "Brand lane",
    key: "brand-showcase",
    stat: "Preset thesis",
    storyId: "public-luxe-showcase-brand-showcase--landing",
    title: "Brand Showcase",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review elegance, color-role, radius, and composition rules before judging page-level polish.",
    eyebrow: "Governance lane",
    key: "design-principles",
    stat: "Design rubric",
    storyId: "public-luxe-foundations-design-principles--overview",
    title: "Design Principles",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Approve theme family, radius scale, action hierarchy, owner docs, and accessible states before adding more ornament.",
    eyebrow: "Review lane",
    key: "design-review-checklist",
    stat: "Approval gate",
    storyId: "public-luxe-foundations-design-review-checklist--overview",
    title: "Design Review Checklist",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Summarize release gates across theme proof, visual discipline, component evidence, pattern readiness, and operability blockers.",
    eyebrow: "Release lane",
    key: "release-gate-dashboard",
    stat: "Release gates",
    storyId: "public-luxe-foundations-release-gate-dashboard--overview",
    title: "Release Gate Dashboard",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review color-role jobs, radius scale, blockers, and approval checks before accepting visual polish.",
    eyebrow: "Discipline lane",
    key: "radius-color-discipline",
    stat: "Color + radius",
    storyId: "public-luxe-foundations-radius-color-discipline--overview",
    title: "Radius & Color Discipline",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Inspect rejected theme examples for color drift, mode mismatch, ornament overspend, action conflict, and radius drift.",
    eyebrow: "Failure lane",
    key: "theme-failure-gallery",
    stat: "Reject cases",
    storyId: "public-luxe-foundations-theme-failure-gallery--overview",
    title: "Theme Failure Gallery",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Scan every foundations governance page by approval lane, risk surface, and next review entry before entering component details.",
    eyebrow: "Index lane",
    key: "foundations-index",
    stat: "Governance map",
    storyId: "public-luxe-foundations-index--coverage",
    title: "Foundations Index",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Read theme families and semantic slots before reviewing any component or page surface.",
    eyebrow: "Token lane",
    key: "theme-tokens",
    stat: "Semantic tokens",
    storyId: "public-luxe-foundations-theme-tokens--overview",
    title: "Theme Tokens",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Inspect semantic token groups, paired text roles, status meaning, and material slots against the active toolbar theme.",
    eyebrow: "Theme lane",
    key: "theme-system-spec",
    stat: "Role map",
    storyId: "public-luxe-foundations-theme-system-spec--overview",
    title: "Theme System Spec",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Audit semantic token pairs, on-container text partners, base reading roles, and live paired specimens before approving luminous color.",
    eyebrow: "Pairing lane",
    key: "token-pairing-ledger",
    stat: "Pair ledger",
    storyId: "public-luxe-foundations-token-pairing-ledger--overview",
    title: "Token Pairing Ledger",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Compare launch theme families by surface, content, emphasis, status, and material responsibilities across light and dark mode.",
    eyebrow: "Role lane",
    key: "theme-role-matrix",
    stat: "Role matrix",
    storyId: "public-luxe-foundations-theme-role-matrix--overview",
    title: "Theme Role Matrix",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review every launch theme family as an intent, best-fit surface, paired mode proof, role promise, ornament budget, and reject-line packet.",
    eyebrow: "Dossier lane",
    key: "theme-family-dossier",
    stat: "Family packets",
    storyId: "public-luxe-foundations-theme-family-dossier--overview",
    title: "Theme Family Dossier",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Choose a launch family by user job, recommended fit, alternate fit, blocked misuse, and reachable proof before approving visual polish.",
    eyebrow: "Selection lane",
    key: "theme-selection-playbook",
    stat: "Choice map",
    storyId: "public-luxe-foundations-theme-selection-playbook--overview",
    title: "Theme Selection Playbook",
  },
  {
    badge: "entry",
    category: "entry",
    description:
      "Try launch theme families as a user-facing chooser with local preview, expression level, and toolbar apply links.",
    eyebrow: "Theme lane",
    key: "theme-chooser",
    stat: "User choice",
    storyId: "public-luxe-foundations-theme-chooser--overview",
    title: "Theme Chooser",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Compare each launch family as a light/dark composition with fixed primary, secondary, accent, and neutral roles.",
    eyebrow: "Composition lane",
    key: "theme-composition",
    stat: "Color discipline",
    storyId: "public-luxe-foundations-theme-composition--overview",
    title: "Theme Composition",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Approve theme family fit, light/dark proof, accent discipline, and surface majority before polishing page visuals.",
    eyebrow: "Readiness lane",
    key: "theme-readiness",
    stat: "Approval matrix",
    storyId: "public-luxe-foundations-theme-readiness--overview",
    title: "Theme Readiness",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Define what users may customize safely, what needs mode proof, and which color and radius roles must remain locked.",
    eyebrow: "Customization lane",
    key: "theme-customization-guardrails",
    stat: "Safe theming",
    storyId: "public-luxe-foundations-theme-customization-guardrails--overview",
    title: "Theme Customization Guardrails",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Prove every launch family keeps primary action, status evidence, neutral surfaces, and recovery paths readable in light and dark mode.",
    eyebrow: "Mode lane",
    key: "mode-pairing-lab",
    stat: "Light + dark proof",
    storyId: "public-luxe-foundations-mode-pairing-lab--overview",
    title: "Mode Pairing Lab",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Apply a chosen family to hero, data, form recovery, and editorial glint surfaces without drifting color roles.",
    eyebrow: "Recipe lane",
    key: "theme-application-recipes",
    stat: "Page recipes",
    storyId: "public-luxe-foundations-theme-application-recipes--overview",
    title: "Theme Application Recipes",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Inspect how token, component shell, local state, and page composition form one governed visual grammar.",
    eyebrow: "Anatomy lane",
    key: "component-anatomy",
    stat: "Structure rules",
    storyId: "public-luxe-foundations-component-anatomy--overview",
    title: "Component Anatomy",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Choose public primitives by user job, risk surface, and pattern recipe before asking for more decoration.",
    eyebrow: "Component lane",
    key: "component-usage-matrix",
    stat: "Usage matrix",
    storyId: "public-luxe-foundations-component-usage-matrix--overview",
    title: "Component Usage Matrix",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Assemble public primitives into reusable action, form, recovery, editorial, identity, loading, and confirmation bundles before pattern review.",
    eyebrow: "Component lane",
    key: "component-composition-matrix",
    stat: "Composition matrix",
    storyId: "public-luxe-foundations-component-composition-matrix--overview",
    title: "Component Composition Matrix",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Scan every documented public component with its owner-doc metrics and detailed scenario story links.",
    eyebrow: "Coverage lane",
    key: "component-index",
    stat: "Scenario map",
    storyId: "public-luxe-components-index--coverage",
    title: "Component Index",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Inspect the active theme against a live specimen wall that combines actions, form controls, feedback, navigation, and summary primitives.",
    eyebrow: "Specimen lane",
    key: "component-theme-specimen-wall",
    stat: "Live components",
    storyId: "public-luxe-components-theme-specimen-wall--overview",
    title: "Component Theme Specimen Wall",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Choose public primitives by user job, proof links, rejection lines, and a live decision specimen before approving component polish.",
    eyebrow: "Decision lane",
    key: "component-decision-workshop",
    stat: "Job mapping",
    storyId: "public-luxe-components-decision-workshop--overview",
    title: "Component Decision Workshop",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Approve public primitives in narrow surfaces where labels, actions, recovery, and ornament trimming must still hold together.",
    eyebrow: "Density lane",
    key: "component-mobile-density-review",
    stat: "Mobile proof",
    storyId: "public-luxe-components-mobile-density-review--overview",
    title: "Component Mobile Density Review",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Approve each public primitive by owner docs, scenario depth, risk focus, state accessibility, and misuse boundaries.",
    eyebrow: "Acceptance lane",
    key: "component-acceptance-board",
    stat: "Acceptance board",
    storyId: "public-luxe-components-acceptance-board--coverage",
    title: "Component Acceptance Board",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review every public primitive as a handoff packet with intent, contract, proof, risk, and rejection boundaries in one place.",
    eyebrow: "Handoff lane",
    key: "component-handoff-dossier",
    stat: "Dossier map",
    storyId: "public-luxe-components-handoff-dossier--coverage",
    title: "Component Handoff Dossier",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Scan every public component prop, state, accessibility note, decision rule, and anti-pattern from the owner docs in one fast reference.",
    eyebrow: "API lane",
    key: "component-api-reference",
    stat: "API table",
    storyId: "public-luxe-components-api-reference--coverage",
    title: "Component API Reference",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review which owner-documented props create variants, which states raise risk, and which detailed stories prove expansion safely.",
    eyebrow: "Variant lane",
    key: "component-variant-matrix",
    stat: "Variant proof",
    storyId: "public-luxe-components-variant-matrix--coverage",
    title: "Component Variant Matrix",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Audit every public component state, accessibility note, risky scenario, and recovery blocker before approving visual polish.",
    eyebrow: "State lane",
    key: "component-state-matrix",
    stat: "State proof",
    storyId: "public-luxe-components-state-matrix--coverage",
    title: "Component State Matrix",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Trace every detailed component scenario by review focus, component family, and risky user job before approving new variants.",
    eyebrow: "Scenario lane",
    key: "component-scenario-atlas",
    stat: "Scenario atlas",
    storyId: "public-luxe-components-scenario-atlas--coverage",
    title: "Component Scenario Atlas",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review high-risk component states such as focus, repair, validation, selection, loading, and bounded progress before approving visual polish.",
    eyebrow: "Component lane",
    key: "component-operability-board",
    stat: "Operability board",
    storyId: "public-luxe-components-operability-board--coverage",
    title: "Component Operability Board",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Inspect rejected primitive usage for semantic drift, decorative actions, missing labels, hidden workflows, and final-state placeholders.",
    eyebrow: "Component lane",
    key: "component-failure-gallery",
    stat: "Reject primitives",
    storyId: "public-luxe-components-component-failure-gallery--overview",
    title: "Component Failure Gallery",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review how hero, media, signals, actions, and recovery compose into coherent public page patterns.",
    eyebrow: "Pattern lane",
    key: "pattern-composition",
    stat: "Assembly rules",
    storyId: "public-luxe-foundations-pattern-composition--overview",
    title: "Pattern Composition",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Scan every public-luxe page pattern by primary action, proof, recovery evidence, and blocking risk.",
    eyebrow: "Pattern lane",
    key: "pattern-index",
    stat: "Pattern evidence",
    storyId: "public-luxe-patterns-index--coverage",
    title: "Pattern Index",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Trace every page pattern by user job, action proof, theme and mobile evidence, recovery path, and blocker before readiness review.",
    eyebrow: "Pattern lane",
    key: "pattern-evidence-atlas",
    stat: "Evidence atlas",
    storyId: "public-luxe-patterns-evidence-atlas--coverage",
    title: "Pattern Evidence Atlas",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review every page pattern by theme proof, component evidence, mobile order, recovery, and handoff blockers before it graduates.",
    eyebrow: "Pattern lane",
    key: "pattern-readiness-board",
    stat: "Handoff board",
    storyId: "public-luxe-patterns-readiness-board--coverage",
    title: "Pattern Readiness Board",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Inspect rejected page compositions for competing actions, missing recovery, weak repair copy, ornament drift, and theme role drift.",
    eyebrow: "Pattern lane",
    key: "pattern-failure-gallery",
    stat: "Reject patterns",
    storyId: "public-luxe-patterns-pattern-failure-gallery--overview",
    title: "Pattern Failure Gallery",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review background, primary surface, local rhythm, density, and anti-nesting rules before polishing page layouts.",
    eyebrow: "Rhythm lane",
    key: "surface-rhythm",
    stat: "Layer hierarchy",
    storyId: "public-luxe-foundations-surface-rhythm--overview",
    title: "Surface Rhythm",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review hover, focus, loading, invalid, disabled, selected, and feedback states before approving visual polish.",
    eyebrow: "State lane",
    key: "interaction-states",
    stat: "State matrix",
    storyId: "public-luxe-foundations-interaction-states--overview",
    title: "Interaction States",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review primary, secondary, ghost, link, badge, alert, empty-state, and blocked-action hierarchy before approving flows.",
    eyebrow: "Action lane",
    key: "action-hierarchy",
    stat: "CTA order",
    storyId: "public-luxe-foundations-action-hierarchy--overview",
    title: "Action Hierarchy",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review global lanes, local sections, breadcrumbs, links, and route recovery before approving public navigation.",
    eyebrow: "Navigation lane",
    key: "navigation-wayfinding",
    stat: "Route clarity",
    storyId: "public-luxe-foundations-navigation-wayfinding--overview",
    title: "Navigation & Wayfinding",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review stat, badge, progress, divider, and supporting copy rules before approving data-heavy public surfaces.",
    eyebrow: "Data lane",
    key: "data-display-summary",
    stat: "Summary grammar",
    storyId: "public-luxe-foundations-data-display-summary--overview",
    title: "Data Display & Summary",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review display, body, helper, link, and visible copy rules so ornate surfaces still speak clearly.",
    eyebrow: "Content lane",
    key: "typography-voice",
    stat: "Type + copy",
    storyId: "public-luxe-foundations-typography-voice--overview",
    title: "Typography & Voice",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review crystal surfaces, sheen, glow, shimmer, and reveal motion before adding ornament to pages.",
    eyebrow: "Material lane",
    key: "material-motion",
    stat: "Motion rules",
    storyId: "public-luxe-foundations-material-motion--overview",
    title: "Material & Motion",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Assign quiet, luminous, ceremonial, or blocked ornament budgets before approving glow, sheen, and accent memory.",
    eyebrow: "Ornament lane",
    key: "ornament-budget",
    stat: "Restraint gate",
    storyId: "public-luxe-foundations-ornament-budget--overview",
    title: "Ornament Budget",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review responsive order, mobile stacking, density bands, and ornament trimming before approving layouts.",
    eyebrow: "Layout lane",
    key: "layout-density",
    stat: "Responsive rhythm",
    storyId: "public-luxe-foundations-layout-density--overview",
    title: "Layout & Density",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review imagery roles, aspect ratios, avatar fallbacks, icon grammar, and asset inspiration boundaries.",
    eyebrow: "Asset lane",
    key: "imagery-iconography",
    stat: "Asset grammar",
    storyId: "public-luxe-foundations-imagery-iconography--overview",
    title: "Imagery & Iconography",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Review keyboard flow, focus visibility, contrast discipline, validation copy, reduced motion, and non-color state cues.",
    eyebrow: "Inclusion lane",
    key: "accessibility-inclusion",
    stat: "A11y review",
    storyId: "public-luxe-foundations-accessibility-inclusion--overview",
    title: "Accessibility & Inclusion",
  },
  {
    badge: "entry",
    category: "entry",
    description:
      "Compare all launch theme families as curated cards instead of scanning raw token tables.",
    eyebrow: "Theme lane",
    key: "theme-gallery",
    stat: "4 families",
    storyId: "public-luxe-foundations-theme-gallery--overview",
    title: "Theme Gallery",
  },
  {
    badge: "entry",
    category: "entry",
    description:
      "Use a DemoHub-style navigation surface to move between brand, tokens, components, and page patterns.",
    eyebrow: "Showcase lane",
    key: "showcase-hub",
    stat: "Navigation hub",
    storyId: "public-luxe-showcase-showcase-hub--overview",
    title: "Showcase Hub",
  },
  {
    badge: "system",
    category: "system",
    description:
      "Scan the high-frequency public primitives and interaction baselines in one governed gallery.",
    eyebrow: "Component lane",
    key: "frequent-components",
    stat: "25 components",
    storyId: "public-luxe-showcase-component-gallery--gallery",
    title: "Component Gallery",
  },
  {
    badge: "pattern",
    category: "pattern",
    description:
      "Validate a member-facing front-stage layout with reward cues, settings, and section switching.",
    eyebrow: "Pattern lane",
    key: "creator-center",
    stat: "Front-stage account",
    storyId: "public-luxe-patterns-creator-center--showcase",
    title: "Creator Center",
  },
  {
    badge: "pattern",
    category: "pattern",
    description:
      "Validate a member rewards surface with claim hierarchy, tier progress, scarcity cues, and quiet history recovery.",
    eyebrow: "Pattern lane",
    key: "member-rewards",
    stat: "Reward claims",
    storyId: "public-luxe-patterns-member-rewards--showcase",
    title: "Member Rewards",
  },
  {
    badge: "pattern",
    category: "pattern",
    description:
      "Validate an editorial collection with governed imagery, reading order, content lanes, and quiet archive recovery.",
    eyebrow: "Pattern lane",
    key: "editorial-collection",
    stat: "Content feature",
    storyId: "public-luxe-patterns-editorial-collection--showcase",
    title: "Editorial Collection",
  },
  {
    badge: "pattern",
    category: "pattern",
    description:
      "Validate an event landing page with one registration path, seat progress, agenda rhythm, and access recovery.",
    eyebrow: "Pattern lane",
    key: "event-landing",
    stat: "Live release",
    storyId: "public-luxe-patterns-event-landing--showcase",
    title: "Event Landing",
  },
  {
    badge: "pattern",
    category: "pattern",
    description:
      "Validate field labels, validation, consent, progress, feedback, and recovery states in a real public-luxe form flow.",
    eyebrow: "Pattern lane",
    key: "forms-feedback",
    stat: "Form recovery",
    storyId: "public-luxe-patterns-forms-feedback--showcase",
    title: "Forms & Feedback",
  },
  {
    badge: "pattern",
    category: "pattern",
    description:
      "Validate a curated preference studio for theme family, density, and sync behavior.",
    eyebrow: "Pattern lane",
    key: "theme-atelier",
    stat: "Theme governance",
    storyId: "public-luxe-patterns-theme-atelier--showcase",
    title: "Theme Atelier",
  },
]
