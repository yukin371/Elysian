export type ElyPublicComponentCategory =
  | "actions"
  | "content"
  | "feedback"
  | "form"
  | "navigation"

export interface ElyPublicComponentPropDoc {
  defaultValue?: string
  description: string
  name: string
  required?: boolean
  type: string
}

export interface ElyPublicComponentStateDoc {
  description: string
  name: string
}

export interface ElyPublicComponentDoc {
  accessibility: string[]
  antiPatterns: string[]
  category: ElyPublicComponentCategory
  composition: string[]
  decision: string[]
  description: string
  name: string
  props: ElyPublicComponentPropDoc[]
  states: ElyPublicComponentStateDoc[]
  usage: string[]
}

type ElyPublicComponentBaseDoc = Omit<
  ElyPublicComponentDoc,
  "antiPatterns" | "composition" | "decision"
>

const publicComponentBaseDocs = {
  Accordion: {
    name: "Accordion",
    category: "content",
    description:
      "Progressive disclosure primitive for FAQ, policy notes, settings explanations, and compact editorial details that should stay readable without adding nested cards.",
    usage: [
      "Use Accordion when related content can be disclosed on demand while the surrounding surface keeps one main decision.",
      "Keep titles specific and outcome-oriented so users can decide whether to open a section before reading the body.",
      "Use multiple mode only when comparing several open explanations is useful and does not bury the main action.",
    ],
    states: [
      {
        name: "Collapsed",
        description:
          "Closed sections keep the title visible and preserve page rhythm without creating hidden navigation.",
      },
      {
        name: "Expanded",
        description:
          "Open sections expose a region linked to the trigger through aria-controls and aria-labelledby.",
      },
      {
        name: "Single open",
        description:
          "Default behavior keeps one section open at a time so disclosure does not become another page layout.",
      },
      {
        name: "Multiple open",
        description:
          "Multiple mode allows several sections to remain open for FAQ, policy, or comparison contexts.",
      },
      {
        name: "Empty",
        description:
          "A lightweight empty message explains that there is no optional disclosure content without creating another card.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicAccordionItem[]",
        required: true,
        description:
          "Ordered disclosure items with key, title, content, and optional eyebrow.",
      },
      {
        name: "modelValue",
        type: "string[]",
        defaultValue: "[]",
        description: "Controlled list of open item keys.",
      },
      {
        name: "multiple",
        type: "boolean",
        defaultValue: "false",
        description: "Allows more than one section to stay open.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No sections to show yet.'",
        description:
          "Visible copy shown when items is empty; reserve EmptyState for actionable recovery.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Disclosure sections'",
        description: "Accessible label for the accordion group.",
      },
      {
        name: "idBase",
        type: "string",
        description:
          "Optional stable id prefix for linking triggers and panels.",
      },
    ],
    accessibility: [
      "Each trigger is a native button with aria-expanded and aria-controls.",
      "Each expanded panel is a labelled region connected back to its trigger.",
      "Empty copy remains visible in the labelled group so assistive users do not encounter a silent disclosure shell.",
      "Disclosure state is not represented by color alone; expanded content remains structurally available.",
    ],
  },
  Button: {
    name: "Button",
    category: "actions",
    description:
      "Primary public-facing action surface with restrained radii, luminous tone, loading feedback, and clear disabled semantics.",
    usage: [
      "Use primary for the page's main next step, secondary for peer actions, and ghost for low-emphasis exits.",
      "Keep labels action-oriented and short; avoid decorative buttons that do not trigger a user-visible change.",
      "Use block layout only in narrow forms or mobile stacked action lanes.",
    ],
    states: [
      {
        name: "Tone",
        description:
          "primary, secondary, and ghost cover the public preset hierarchy.",
      },
      {
        name: "Size",
        description:
          "sm, md, and lg map to compact controls, default flows, and hero actions.",
      },
      {
        name: "Busy",
        description: "loading disables the control and exposes aria-busy.",
      },
      {
        name: "Disabled",
        description:
          "disabled removes the action from interaction without changing copy.",
      },
    ],
    props: [
      {
        name: "tone",
        type: "'primary' | 'secondary' | 'ghost'",
        defaultValue: "'primary'",
        description: "Visual hierarchy of the action.",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        description: "Button density and tap target scale.",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description: "Shows spinner, disables interaction, and sets aria-busy.",
      },
      {
        name: "block",
        type: "boolean",
        defaultValue: "false",
        description: "Expands the button to the width of its container.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the native button.",
      },
      {
        name: "type",
        type: "'button' | 'submit' | 'reset'",
        defaultValue: "'button'",
        description: "Native button type.",
      },
    ],
    accessibility: [
      "Uses a native button element.",
      "Loading state sets aria-busy and disables accidental duplicate submission.",
      "Visible focus treatment is provided by the public preset CSS.",
    ],
  },
  IconButton: {
    name: "Icon Button",
    category: "actions",
    description:
      "Compact icon-only action control for local toolbars, media controls, quick recovery, and small support exits with a required accessible label.",
    usage: [
      "Use when the surrounding surface already explains the context and a compact icon action prevents action lanes from becoming noisy.",
      "Keep the icon decorative and provide ariaLabel so the action remains understandable to assistive technology.",
      "Use danger tone only for local reversible or clearly explained destructive actions.",
    ],
    states: [
      {
        name: "Tone",
        description:
          "ghost, primary, secondary, and danger map compact actions to the same hierarchy discipline as Button.",
      },
      {
        name: "Size",
        description:
          "sm, md, and lg cover dense toolbars, default touch targets, and media surfaces.",
      },
      {
        name: "Busy",
        description:
          "loading replaces the icon with a spinner, disables interaction, and exposes aria-busy.",
      },
      {
        name: "Pressed",
        description:
          "pressed exposes aria-pressed only for toggle-style icon actions such as favorite, mute, or pin.",
      },
      {
        name: "Disabled",
        description:
          "disabled preserves the compact footprint while clearly blocking interaction.",
      },
    ],
    props: [
      {
        name: "ariaLabel",
        type: "string",
        required: true,
        description:
          "Accessible name for the icon-only action; must describe the action result.",
      },
      {
        name: "tone",
        type: "'danger' | 'ghost' | 'primary' | 'secondary'",
        defaultValue: "'ghost'",
        description: "Compact action hierarchy and risk emphasis.",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        description: "Square tap target scale.",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description:
          "Shows a compact spinner, disables interaction, and sets aria-busy.",
      },
      {
        name: "pressed",
        type: "boolean",
        description:
          "Optional pressed state for toggle-style icon actions; omitted for one-shot actions.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the native button.",
      },
      {
        name: "type",
        type: "'button' | 'reset' | 'submit'",
        defaultValue: "'button'",
        description: "Native button type.",
      },
    ],
    accessibility: [
      "Uses a native button element with required aria-label for the icon-only affordance.",
      "The slotted icon is hidden from assistive technology so the label remains the single action name.",
      "Only toggle-style uses should pass pressed so aria-pressed does not mislabel ordinary one-shot actions.",
      "Loading state sets aria-busy and disables duplicate activation while preserving focus styling.",
    ],
  },
  Link: {
    name: "Link",
    category: "navigation",
    description:
      "Inline navigation surface for public copy, support actions, and lightweight escapes with governed tone, underline behavior, and external-link handling.",
    usage: [
      "Use Link for lightweight navigation or supporting actions that should not compete with primary buttons.",
      "Keep link labels explicit about destination or result instead of relying on surrounding decorative copy.",
      "Use the external variant only when the destination truly leaves the current product context.",
    ],
    states: [
      {
        name: "Primary",
        description:
          "Default inline navigation carries the brand-aligned emphasis for content and supporting actions.",
      },
      {
        name: "Accent and muted",
        description:
          "accent raises editorial emphasis while muted supports quieter references and secondary exits.",
      },
      {
        name: "Underline behavior",
        description:
          "auto, always, and none allow the component to adapt to dense copy or editorial sections without losing consistency.",
      },
      {
        name: "External",
        description:
          "External links add a trailing mark and safe rel plus target attributes for new-tab behavior.",
      },
    ],
    props: [
      {
        name: "href",
        type: "string",
        defaultValue: "'#'",
        description: "Destination URL for the anchor element.",
      },
      {
        name: "tone",
        type: "'accent' | 'muted' | 'primary'",
        defaultValue: "'primary'",
        description: "Visual emphasis for the inline navigation surface.",
      },
      {
        name: "underline",
        type: "'always' | 'auto' | 'none'",
        defaultValue: "'auto'",
        description:
          "Controls underline visibility across copy-heavy contexts.",
      },
      {
        name: "external",
        type: "boolean",
        defaultValue: "false",
        description:
          "Opens the destination in a new tab and adds external-link affordance.",
      },
    ],
    accessibility: [
      "Uses a native anchor element so browser link semantics and keyboard behavior remain intact.",
      "External links set rel=noreferrer noopener and target=_blank for safer new-tab behavior.",
      "Tone and underline are visual refinements only; the slot label still needs to describe destination or outcome.",
    ],
  },
  Menu: {
    name: "Menu",
    category: "actions",
    description:
      "Lightweight action-menu primitive for secondary actions, local item operations, support exits, and compact overflow choices that should not become another row of primary buttons.",
    usage: [
      "Use Menu when a surface has several low-frequency actions and one visible trigger keeps the main decision path clear.",
      "Keep menu items short, specific, and local to the surface that owns the action.",
      "Use disabled, current, danger, and href items only when those states reflect real interaction or navigation semantics.",
    ],
    states: [
      {
        name: "Closed and open",
        description:
          "The trigger owns aria-expanded and controls a single menu panel that appears only while open.",
      },
      {
        name: "Action and link items",
        description:
          "Items can render as buttons for local actions or anchors for lightweight exits without becoming global navigation.",
      },
      {
        name: "Disabled and current",
        description:
          "Disabled items remain visible but cannot be focused or selected; current links expose aria-current.",
      },
      {
        name: "Unavailable",
        description:
          "A disabled trigger or a menu with no enabled actions does not render an empty panel, even when open is controlled.",
      },
      {
        name: "Keyboard review",
        description:
          "Arrow keys, Home, End, Escape, Enter, and Space support basic menu operation without a command-palette abstraction.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicMenuItem[]",
        required: true,
        description:
          "Ordered menu items with key, label, optional description, optional meta, href, disabled/current flags, and optional tone.",
      },
      {
        name: "open",
        type: "boolean",
        description:
          "Optional controlled open state; omit it to let the component manage local disclosure.",
      },
      {
        name: "triggerLabel",
        type: "string",
        defaultValue: "'More actions'",
        description: "Visible fallback label for the menu trigger slot.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Action menu'",
        description: "Accessible label for the menu panel.",
      },
      {
        name: "align",
        type: "'end' | 'start'",
        defaultValue: "'start'",
        description: "Horizontal alignment of the floating menu panel.",
      },
      {
        name: "placement",
        type: "'bottom' | 'top'",
        defaultValue: "'bottom'",
        description: "Vertical placement of the floating menu panel.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the trigger and prevents opening the menu.",
      },
    ],
    accessibility: [
      "The trigger is a native button with aria-haspopup=menu, aria-expanded, and aria-controls.",
      "The panel uses role=menu and items use role=menuitem while preserving native button or anchor behavior.",
      "Empty or fully disabled action sets keep the trigger closed instead of exposing a hollow menu to keyboard or screen-reader users.",
      "Keyboard support includes open from Enter/Space/Arrow keys, item movement with arrows, Home/End, Escape close, and outside-click dismissal.",
    ],
  },
  Toolbar: {
    name: "Toolbar",
    category: "actions",
    description:
      "Flat local action lane for grouping primary actions, secondary actions, compact view controls, and support exits without adding another card layer.",
    usage: [
      "Use Toolbar when related controls belong to the same current surface and should scan as one action lane.",
      "Keep one primary action visible; move lower-frequency choices into Menu or a quiet Link.",
      "Use compact density for review headers, mobile preference rows, and dense creator work surfaces.",
    ],
    states: [
      {
        name: "Grouped",
        description:
          "The root exposes role=group and an accessible label while child controls keep their native semantics.",
      },
      {
        name: "Leading and trailing",
        description:
          "Optional slots can pin context or support exits without creating nested layout containers.",
      },
      {
        name: "Density",
        description:
          "comfortable and compact adjust spacing only; they do not change action hierarchy or theme roles.",
      },
      {
        name: "Responsive",
        description:
          "The action lane stacks on narrow screens so controls remain reachable without horizontal overflow.",
      },
    ],
    props: [
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Toolbar'",
        description: "Accessible label for the grouped local action lane.",
      },
      {
        name: "density",
        type: "'comfortable' | 'compact'",
        defaultValue: "'comfortable'",
        description: "Controls toolbar spacing without changing semantics.",
      },
      {
        name: "justify",
        type: "'between' | 'end' | 'start'",
        defaultValue: "'between'",
        description: "Controls horizontal distribution of the toolbar groups.",
      },
    ],
    accessibility: [
      "Uses role=group instead of claiming a custom roving ARIA toolbar model.",
      "The toolbar label names the local action set; child controls keep Button, Link, Menu, or radiogroup semantics.",
      "Responsive stacking preserves DOM order so keyboard and reading order remain predictable.",
    ],
  },
  List: {
    name: "List",
    category: "content",
    description:
      "Flat structured list primitive for settings rows, content indexes, activity summaries, and lightweight navigation where repeated information should stay readable without becoming a stack of cards.",
    usage: [
      "Use List when several peer items share the same structure and should scan as one surface.",
      "Use href only when the row genuinely navigates; otherwise keep the item as static content and put actions nearby.",
      "Use compact density for side panels, account history, and mobile review lanes where vertical space is constrained.",
    ],
    states: [
      {
        name: "Plain row",
        description:
          "Static rows present title, optional meta, and optional description without introducing a new action surface.",
      },
      {
        name: "Linked row",
        description:
          "Rows with href render as anchors with a trailing affordance while preserving list semantics.",
      },
      {
        name: "Current and disabled",
        description:
          "Current rows expose aria-current for links, while disabled rows stay visible but are not navigable.",
      },
      {
        name: "Comfortable and compact",
        description:
          "Density changes spacing only; it does not change the row contract or turn the list into navigation tabs.",
      },
      {
        name: "Empty",
        description:
          "A lightweight empty message explains missing rows inside the same list surface instead of forcing another EmptyState card.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicListItem[]",
        required: true,
        description:
          "Ordered row items with key, title, optional meta, optional description, optional href, optional current/disabled flags, and optional tone.",
      },
      {
        name: "density",
        type: "'comfortable' | 'compact'",
        defaultValue: "'comfortable'",
        description:
          "Controls row rhythm for normal content lanes or denser review/history lanes.",
      },
      {
        name: "divided",
        type: "boolean",
        defaultValue: "true",
        description:
          "Shows subtle separators between rows instead of making every row a separate card.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No items to show yet.'",
        description:
          "Visible copy shown when items is empty; use EmptyState only when a recovery action is needed.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'List'",
        description: "Accessible label for the structured list section.",
      },
    ],
    accessibility: [
      "Uses a semantic list so repeated rows remain understandable as one grouped collection.",
      "Rows with href render as native anchors; current linked rows expose aria-current=page.",
      "Empty copy is visible in the owning section so absence does not require a nested card or decorative placeholder.",
      "Tone and marker are supplemental; row title and description must carry status or destination meaning.",
    ],
  },
  DescriptionList: {
    name: "DescriptionList",
    category: "content",
    description:
      "Semantic description-list primitive for profile facts, order summaries, event rules, and compact specification blocks where label-value pairs should read as one information surface instead of many tiny cards.",
    usage: [
      "Use DescriptionList when users need to scan stable facts, attributes, constraints, or summary fields.",
      "Keep labels short and values meaningful; move long explanations into Text, Alert, Accordion, or a support route.",
      "Use tone sparingly to mark one or two important facts, not to recolor every row.",
    ],
    states: [
      {
        name: "Single column",
        description:
          "Single column keeps dense or narrow detail groups readable without forcing horizontal comparison.",
      },
      {
        name: "Double column",
        description:
          "Double column supports compact profile or summary surfaces when facts are short and comparable.",
      },
      {
        name: "Comfortable and compact",
        description:
          "Density changes spacing and value type scale while preserving the same semantic dl contract.",
      },
      {
        name: "Semantic tones",
        description:
          "Primary, accent, muted, success, and warning tones can highlight fact importance without becoming status badges.",
      },
      {
        name: "Empty",
        description:
          "A flat empty message keeps missing facts inside the detail block without introducing a replacement card.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicDescriptionItem[]",
        required: true,
        description:
          "Ordered description items with key, label, value, optional description, and optional semantic tone.",
      },
      {
        name: "columns",
        type: "'single' | 'double'",
        defaultValue: "'double'",
        description:
          "Controls one-column reading rhythm or two-column compact summary layout.",
      },
      {
        name: "density",
        type: "'comfortable' | 'compact'",
        defaultValue: "'comfortable'",
        description:
          "Controls spacing for editorial detail blocks or compact account summaries.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No details to show yet.'",
        description:
          "Visible copy shown when items is empty; keep it short and reserve EmptyState for actionable recovery.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Details'",
        description: "Accessible label for the detail section.",
      },
    ],
    accessibility: [
      "Uses native dl, dt, and dd elements so label-value relationships remain available to assistive technology.",
      "Empty copy remains visible in the labeled section so users understand that details are absent, not loading.",
      "Tone is supplemental; labels and values must communicate meaning without relying on color.",
      "Do not place interactive controls inside value text unless the surrounding pattern owns that interaction and labels it clearly.",
    ],
  },
  Table: {
    name: "Table",
    category: "content",
    description:
      "Read-only structured table primitive for public comparisons, specifications, reward matrices, and compact audit snapshots that need rows and columns without becoming an enterprise data grid.",
    usage: [
      "Use Table when users need to compare several attributes across rows or scan a small structured matrix.",
      "Keep rows bounded and readable; if the user needs sorting, filtering, selection, or row actions, use a future dedicated data-grid component or the enterprise preset.",
      "Use caption and description so the table has a clear reading purpose before users enter the cells.",
    ],
    states: [
      {
        name: "Captioned",
        description:
          "Visible caption and helper copy frame why the comparison exists before the row data begins.",
      },
      {
        name: "Comfortable and compact",
        description:
          "Density changes cell padding only; it does not add data-grid behavior or hidden controls.",
      },
      {
        name: "Aligned columns",
        description:
          "Column alignment can support numeric or short status cells while preserving native table semantics.",
      },
      {
        name: "Semantic rows",
        description:
          "Row tone can flag one bounded outcome, but the cell text must still name success, risk, or warning.",
      },
      {
        name: "Empty rows",
        description:
          "An empty row preserves caption, headers, and table structure while explaining that there is nothing to compare yet.",
      },
    ],
    props: [
      {
        name: "columns",
        type: "ElyPublicTableColumn[]",
        required: true,
        description:
          "Ordered columns with key, label, optional description, and optional start/center/end alignment.",
      },
      {
        name: "rows",
        type: "ElyPublicTableRow[]",
        required: true,
        description:
          "Ordered read-only rows with key, cell values keyed by column, and optional semantic tone.",
      },
      {
        name: "caption",
        type: "string",
        description:
          "Visible table title that is also exposed through a native caption.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Supporting copy that explains the table's review purpose.",
      },
      {
        name: "density",
        type: "'comfortable' | 'compact'",
        defaultValue: "'comfortable'",
        description:
          "Controls cell rhythm for default comparison surfaces or compact review snapshots.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No rows to compare yet.'",
        description:
          "Visible copy shown in a single table row when rows is empty; keep it factual and non-decorative.",
      },
    ],
    accessibility: [
      "Uses native table, thead, tbody, th, td, and caption semantics for structured reading.",
      "The scroll wrapper is focusable so keyboard users can reach horizontally overflowing tables on narrow screens.",
      "Empty rows use one cell spanning the available columns, preserving table context for screen-reader and keyboard users.",
      "Row tone is supplemental; cells must contain text that names the status or consequence without relying on color.",
    ],
  },
  Breadcrumb: {
    name: "Breadcrumb",
    category: "navigation",
    description:
      "Compact route hierarchy primitive for public pages that need orientation, quiet backtracking, and a visible current location without turning local sections into tabs.",
    usage: [
      "Use Breadcrumb when the user arrives deep in a collection, event, account, or editorial flow and needs to understand the parent path.",
      "Keep the trail short and stable; collapse the information architecture elsewhere instead of making the breadcrumb carry a full menu.",
      "Use the current item for location only, not as a clickable call to action.",
    ],
    states: [
      {
        name: "Linked ancestors",
        description:
          "Earlier items can be anchors so users can return to stable parent surfaces without competing with the main action.",
      },
      {
        name: "Current page",
        description:
          "The final or explicitly current item is rendered as the location marker with aria-current=page.",
      },
      {
        name: "Wrapping",
        description:
          "The list wraps instead of overflowing so long route names remain usable on narrow public surfaces.",
      },
      {
        name: "Collapsed middle",
        description:
          "maxItems can preserve the first and final route levels while replacing middle ancestry with an accessible overflow marker.",
      },
      {
        name: "Separator",
        description:
          "The separator is decorative while screen-reader-only copy preserves meaningful level changes.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicBreadcrumbItem[]",
        required: true,
        description:
          "Ordered breadcrumb items with label, optional href, and optional current flag.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Breadcrumb'",
        description: "Accessible label for the breadcrumb navigation region.",
      },
      {
        name: "maxItems",
        type: "number",
        description:
          "Optional display cap; values below 3 are ignored so ancestry never collapses into only an ellipsis.",
      },
      {
        name: "overflowLabel",
        type: "string",
        defaultValue: "'Collapsed route levels'",
        description:
          "Accessible label for the non-interactive overflow marker when maxItems collapses the middle of the trail.",
      },
      {
        name: "separatorLabel",
        type: "string",
        defaultValue: "'Next level'",
        description:
          "Screen-reader-only phrase announced between visual breadcrumb levels.",
      },
    ],
    accessibility: [
      "Uses a nav landmark with an ordered list so route hierarchy is available to assistive technology.",
      "The current location exposes aria-current=page and is not rendered as a redundant link.",
      "Collapsed middle levels are announced with an overflow label and hidden count instead of becoming an unlabeled punctuation mark.",
      "Separators are visual only; labels should still make the route understandable without relying on punctuation.",
    ],
  },
  Pagination: {
    name: "Pagination",
    category: "navigation",
    description:
      "Paged collection navigation primitive for public lists, archives, reviews, and search results where users need bounded movement without confusing pagination with progress.",
    usage: [
      "Use Pagination when a collection is split into stable pages and the user needs to move through nearby results.",
      "Keep page counts bounded and understandable; use a different pattern for infinite feeds or live streams.",
      "Place Pagination near the affected collection so previous and next actions feel local to that list.",
    ],
    states: [
      {
        name: "Current page",
        description:
          "The active page is marked with aria-current=page and a stronger but still governed theme surface.",
      },
      {
        name: "Previous and next",
        description:
          "Previous and next buttons disable at the beginning and end of the bounded page range.",
      },
      {
        name: "Ellipsis",
        description:
          "Large page ranges collapse distant pages while keeping the first, last, and nearby pages visible; the skipped range has screen-reader text.",
      },
      {
        name: "Compact wrapping",
        description:
          "The control wraps on narrow public surfaces instead of creating horizontal overflow.",
      },
    ],
    props: [
      {
        name: "pageCount",
        type: "number",
        required: true,
        description: "Total number of pages in the bounded collection.",
      },
      {
        name: "modelValue",
        type: "number",
        defaultValue: "1",
        description: "Controlled current page number.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Pagination'",
        description: "Accessible label for the pagination navigation region.",
      },
      {
        name: "previousLabel",
        type: "string",
        defaultValue: "'Previous page'",
        description: "Visible label for the previous-page button.",
      },
      {
        name: "nextLabel",
        type: "string",
        defaultValue: "'Next page'",
        description: "Visible label for the next-page button.",
      },
      {
        name: "pageLabel",
        type: "string",
        defaultValue: "'Page'",
        description:
          "Accessible prefix used when announcing individual page buttons.",
      },
      {
        name: "currentPageLabel",
        type: "string",
        defaultValue: "'Current page'",
        description:
          "Accessible prefix added to the current page button label.",
      },
      {
        name: "ellipsisLabel",
        type: "string",
        defaultValue: "'Skipped pages'",
        description: "Screen-reader-only text for collapsed page ranges.",
      },
    ],
    accessibility: [
      "Uses a nav landmark so the control is announced as collection navigation.",
      "The current page exposes aria-current=page and remains reachable in the page list.",
      "Page, current page, and ellipsis labels are configurable so localized public pages do not inherit hard-coded English announcements.",
      "Previous and next use native disabled behavior at collection boundaries.",
    ],
  },
  Stepper: {
    name: "Stepper",
    category: "navigation",
    description:
      "Sequential journey primitive for onboarding, checkout, publishing, and review flows where users need to understand current step, completed work, and blocked repair without mistaking the flow for tabs or pagination.",
    usage: [
      "Use Stepper when the user moves through a small ordered journey and the order itself changes what they should do next.",
      "Keep steps few, stable, and named by outcome; long dynamic workflows should use a dedicated route or task list instead.",
      "Use interactive mode only when revisiting earlier safe steps is allowed by the surrounding flow.",
    ],
    states: [
      {
        name: "Current",
        description:
          "The active step is marked with aria-current=step and receives the primary container treatment.",
      },
      {
        name: "Complete",
        description:
          "Completed steps use success semantics so finished work is visible without becoming another primary action.",
      },
      {
        name: "Upcoming",
        description:
          "Future steps stay quiet and readable, preserving the user's focus on the current decision.",
      },
      {
        name: "Error and disabled",
        description:
          "Error marks the step that needs repair while disabled blocks unreachable steps through native disabled behavior.",
      },
      {
        name: "Empty",
        description:
          "A lightweight empty message explains that no journey steps exist yet without adding a separate card or fake progress state.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicStepItem[]",
        required: true,
        description:
          "Ordered step items with key, label, optional description, and optional status override.",
      },
      {
        name: "modelValue",
        type: "string",
        description:
          "Controlled active step key; defaults to the first item when omitted.",
      },
      {
        name: "interactive",
        type: "boolean",
        defaultValue: "false",
        description:
          "Allows safe step selection and emits update:modelValue from step buttons.",
      },
      {
        name: "orientation",
        type: "'horizontal' | 'vertical'",
        defaultValue: "'horizontal'",
        description:
          "Controls compact horizontal lanes or vertical review rhythm.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No steps to show yet.'",
        description:
          "Visible copy shown when items is empty; keep it factual and avoid implying progress exists.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Steps'",
        description: "Accessible label for the step navigation region.",
      },
    ],
    accessibility: [
      "Uses a nav landmark with an ordered list so the flow order is available to assistive technology.",
      "The current step exposes aria-current=step rather than relying on color or ornament alone.",
      "Interactive steps use native buttons and disabled steps use native disabled behavior.",
      "Empty copy remains visible in the labeled navigation region so users do not encounter an unlabeled blank flow.",
    ],
  },
  Timeline: {
    name: "Timeline",
    category: "content",
    description:
      "Chronological content primitive for release notes, member history, event agendas, and editorial sequences where order matters but the user is not moving through a live stepper.",
    usage: [
      "Use Timeline when past or scheduled events need to read as a coherent sequence without adding stacked cards.",
      "Keep each item concise with a stable meta label, a clear title, and optional explanation for the consequence or next context.",
      "Use tone only to mark meaningful moments such as primary milestones, success completion, warning attention, or accent ceremony.",
    ],
    states: [
      {
        name: "Primary milestone",
        description:
          "Default items use the primary timeline marker for normal sequence moments and active narrative anchors.",
      },
      {
        name: "Accent ceremony",
        description:
          "Accent items mark rare brand or editorial highlights without turning the whole sequence into decoration.",
      },
      {
        name: "Success and warning",
        description:
          "Success and warning tones communicate completed or attention-worthy moments through semantic tokens.",
      },
      {
        name: "Compact density",
        description:
          "Compact density reduces vertical rhythm for account history, changelogs, and narrow review panels.",
      },
      {
        name: "Empty",
        description:
          "A flat empty message keeps missing chronology readable inside the timeline surface without turning absence into a card stack.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicTimelineItem[]",
        required: true,
        description:
          "Ordered timeline items with key, title, optional meta, optional description, and optional semantic tone.",
      },
      {
        name: "density",
        type: "'comfortable' | 'compact'",
        defaultValue: "'comfortable'",
        description:
          "Controls spacious editorial rhythm or denser history rhythm without changing item semantics.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No timeline events to show yet.'",
        description:
          "Visible copy shown when items is empty; use EmptyState only when the user can recover or create an event.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Timeline'",
        description: "Accessible label for the chronological section.",
      },
    ],
    accessibility: [
      "Uses an ordered list so assistive technology receives the same chronological order as visual users.",
      "Empty copy stays in the labeled section so absence is explicit rather than being represented by decorative markers alone.",
      "Tone is supplemental; item title, meta, and description must carry the meaning without relying on color.",
      "The component has no hidden interaction, so links, buttons, or repair actions should remain outside or inside explicit item content owned by the surrounding surface.",
    ],
  },
  Tooltip: {
    name: "Tooltip",
    category: "feedback",
    description:
      "Short contextual help primitive for terms, labels, and compact decisions that need one calm explanation without adding another card or long paragraph.",
    usage: [
      "Use Tooltip for concise clarification that supports a nearby label, status, or setting.",
      "Keep content short enough to read on focus; move longer guidance into Text, Alert, or a dedicated help route.",
      "Use accent only when the hint explains a highlighted or ceremonial surface.",
    ],
    states: [
      {
        name: "Neutral",
        description:
          "Default contextual hint that stays quiet beside labels, stats, and form descriptions.",
      },
      {
        name: "Accent",
        description:
          "Higher-emphasis hint for highlighted editorial or theme-specific terminology.",
      },
      {
        name: "Placement",
        description:
          "top, bottom, and inline keep the bubble close to the explained item without creating a new surface.",
      },
      {
        name: "Open preview",
        description:
          "open keeps the bubble visible for review screenshots while hover and focus remain the runtime interaction path.",
      },
    ],
    props: [
      {
        name: "text",
        type: "string",
        defaultValue: "''",
        description: "Fallback tooltip content when the default slot is empty.",
      },
      {
        name: "tone",
        type: "'accent' | 'neutral'",
        defaultValue: "'neutral'",
        description: "Visual emphasis for the trigger and contextual bubble.",
      },
      {
        name: "placement",
        type: "'bottom' | 'inline' | 'top'",
        defaultValue: "'top'",
        description: "Bubble position relative to the focusable trigger.",
      },
      {
        name: "open",
        type: "boolean",
        defaultValue: "false",
        description:
          "Keeps the bubble visible for examples, tests, or static review.",
      },
      {
        name: "triggerLabel",
        type: "string",
        defaultValue: "'Show context'",
        description: "Accessible name for the focusable help trigger.",
      },
      {
        name: "id",
        type: "string",
        description:
          "Optional stable id used to connect trigger and tooltip content.",
      },
    ],
    accessibility: [
      "The trigger is keyboard focusable and references the bubble with aria-describedby.",
      "The bubble uses role=tooltip and appears on hover, focus-within, or explicit open preview.",
      "Tooltip content must be supplemental; essential instructions should remain visible in page copy.",
    ],
  },
  Popover: {
    name: "Popover",
    category: "feedback",
    description:
      "Lightweight non-modal context panel for richer local guidance, previews, and decision support that should stay attached to a trigger without becoming a menu or dialog.",
    usage: [
      "Use Popover when a nearby trigger needs structured context, a short preview, or one small support action.",
      "Keep the panel local and bounded; move long forms, destructive confirmation, or route-level review into Dialog or a page pattern.",
      "Use accent tone only for one branded or ceremonial help moment, not for every support panel on the page.",
    ],
    states: [
      {
        name: "Closed and open",
        description:
          "The trigger owns aria-expanded and controls one non-modal panel that appears only while open.",
      },
      {
        name: "Placement and alignment",
        description:
          "Top or bottom placement plus start or end alignment keeps the panel attached to its trigger and away from global layout.",
      },
      {
        name: "Neutral and accent",
        description:
          "Neutral handles routine support context, while accent marks a rare branded preview or theme-specific explanation.",
      },
      {
        name: "Dismissal",
        description:
          "Escape, outside click, and the visible close button all close the panel without trapping the user in a modal flow.",
      },
    ],
    props: [
      {
        name: "open",
        type: "boolean",
        description:
          "Optional controlled open state; omit it to let the component manage local disclosure.",
      },
      {
        name: "title",
        type: "string",
        defaultValue: "''",
        description:
          "Optional panel title used as the dialog label when present.",
      },
      {
        name: "description",
        type: "string",
        defaultValue: "''",
        description:
          "Optional panel helper text connected through aria-describedby.",
      },
      {
        name: "placement",
        type: "'bottom' | 'top'",
        defaultValue: "'bottom'",
        description: "Vertical placement of the context panel.",
      },
      {
        name: "align",
        type: "'end' | 'start'",
        defaultValue: "'start'",
        description:
          "Horizontal alignment of the panel relative to the trigger.",
      },
      {
        name: "tone",
        type: "'accent' | 'neutral'",
        defaultValue: "'neutral'",
        description: "Visual emphasis for the trigger and panel frame.",
      },
      {
        name: "triggerLabel",
        type: "string",
        defaultValue: "'Open context panel'",
        description: "Fallback visible trigger label.",
      },
      {
        name: "closeLabel",
        type: "string",
        defaultValue: "'Close context panel'",
        description: "Accessible label for the close button.",
      },
    ],
    accessibility: [
      "The trigger is a native button with aria-haspopup=dialog, aria-expanded, and aria-controls.",
      "The panel uses role=dialog with aria-modal=false so it remains a local context panel rather than a modal trap.",
      "Escape, outside click, and the visible close button provide dismissal paths; essential instructions should still remain visible outside the popover.",
    ],
  },
  Stat: {
    name: "Stat",
    category: "content",
    description:
      "Compact summary block for public dashboards, hero strips, and content cards where one headline metric needs supporting context without reverting to ad hoc markup.",
    usage: [
      "Use Stat for short, high-signal summaries such as theme counts, conversion health, or release readiness.",
      "Keep the value concise and pair it with a label that explains what the number or phrase represents.",
      "Use helper text for brief context only; if the explanation becomes long, move it into a card or detail lane.",
    ],
    states: [
      {
        name: "Primary",
        description:
          "Default summary treatment suits most public cards, galleries, and compact overview strips.",
      },
      {
        name: "Accent and muted",
        description:
          "accent lifts one lead metric while muted supports quieter companion summaries in the same row.",
      },
      {
        name: "Trend",
        description:
          "up, down, and flat add lightweight directional emphasis without turning the block into a chart widget.",
      },
      {
        name: "Alignment",
        description:
          "start and center support dense card rows as well as more ceremonial hero summaries.",
      },
    ],
    props: [
      {
        name: "value",
        type: "string",
        required: true,
        description: "Headline metric, percentage, or short summary phrase.",
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Optional compact label shown above the headline value.",
      },
      {
        name: "helper",
        type: "string",
        description: "Supporting context shown below the main label slot.",
      },
      {
        name: "tone",
        type: "'accent' | 'muted' | 'primary'",
        defaultValue: "'primary'",
        description: "Visual emphasis within a group of summary blocks.",
      },
      {
        name: "trend",
        type: "'down' | 'flat' | 'up'",
        defaultValue: "'flat'",
        description:
          "Lightweight directional cue paired with the headline value.",
      },
      {
        name: "align",
        type: "'center' | 'start'",
        defaultValue: "'start'",
        description:
          "Layout alignment for compact grids or centered feature rows.",
      },
    ],
    accessibility: [
      "Uses plain text content so screen readers announce value, label, and helper in reading order without extra widget semantics.",
      "Trend markers are visual cues only; the label and helper should still explain whether the change is good, bad, or neutral.",
      "Avoid using Stat as the only representation of complex data distributions that would require a table or chart.",
    ],
  },
  Text: {
    name: "Text",
    category: "content",
    description:
      "Governed body-copy primitive for paragraphs, compact notes, and inline emphasis so public pages can reuse the same reading rhythm instead of scattering one-off text styles.",
    usage: [
      "Use Text for body copy, helper notes, and small supporting statements that need stable tone and spacing across the preset.",
      "Choose muted or subtle for secondary explanation, but keep primary for content that carries real decision-making weight.",
      "Use the as prop to preserve semantic intent instead of swapping to a stronger visual tone when the meaning is still just body text.",
    ],
    states: [
      {
        name: "Primary",
        description:
          "Default reading tone supports most paragraphs, captions, and compact descriptions inside public cards.",
      },
      {
        name: "Muted and subtle",
        description:
          "Lower-emphasis tones help supporting copy recede without disappearing into low-contrast decoration.",
      },
      {
        name: "Size",
        description:
          "sm, md, and lg support dense helper text, standard copy, and slightly more present lead paragraphs.",
      },
      {
        name: "Semantic tag",
        description:
          "p, span, and strong keep content semantics explicit while sharing the same visual family.",
      },
    ],
    props: [
      {
        name: "as",
        type: "'p' | 'span' | 'strong'",
        defaultValue: "'p'",
        description: "HTML tag used for the rendered text node.",
      },
      {
        name: "size",
        type: "'lg' | 'md' | 'sm'",
        defaultValue: "'md'",
        description: "Typography scale for lead, default, and compact text.",
      },
      {
        name: "tone",
        type: "'muted' | 'primary' | 'subtle'",
        defaultValue: "'primary'",
        description: "Reading emphasis for body or supporting copy.",
      },
      {
        name: "weight",
        type: "'medium' | 'regular' | 'semibold'",
        defaultValue: "'regular'",
        description:
          "Font weight variation for inline emphasis without leaving body-copy rhythm.",
      },
    ],
    accessibility: [
      "Keeps native text semantics through the selected HTML tag instead of introducing custom widget roles.",
      "Tone changes are visual only; important distinctions should still be stated in the text itself.",
      "Use strong sparingly so emphasis remains meaningful in assistive reading order.",
    ],
  },
  Kbd: {
    name: "Kbd",
    category: "content",
    description:
      "Inline keyboard-hint primitive for shortcuts, command hints, review steps, and keyboard affordances where key labels should stay consistent without becoming decorative badges.",
    usage: [
      "Use Kbd when a visible key or shortcut helps users operate a nearby control, review lane, or support instruction.",
      "Use keys for shortcut combinations and the default slot for a single inline key inside prose.",
      "Keep keyboard hints near the control or instruction they explain so they remain contextual rather than ornamental.",
    ],
    states: [
      {
        name: "Single key",
        description:
          "A single kbd element keeps inline key hints compact inside Text, labels, or help copy.",
      },
      {
        name: "Key sequence",
        description:
          "The keys prop renders each key separately with an accessible separator so shortcut combinations remain scannable.",
      },
      {
        name: "Tone",
        description:
          "Neutral, primary, accent, and muted tones adjust emphasis without turning keyboard hints into badges or buttons.",
      },
      {
        name: "Size",
        description:
          "sm and md sizes support dense helper copy and normal review instructions while preserving the same radius scale.",
      },
    ],
    props: [
      {
        name: "keys",
        type: "string[]",
        defaultValue: "[]",
        description:
          "Optional ordered key labels rendered as a shortcut sequence.",
      },
      {
        name: "tone",
        type: "'accent' | 'muted' | 'neutral' | 'primary'",
        defaultValue: "'neutral'",
        description: "Visual emphasis for the inline keyboard hint.",
      },
      {
        name: "size",
        type: "'md' | 'sm'",
        defaultValue: "'md'",
        description: "Keyboard hint density for inline or compact contexts.",
      },
      {
        name: "separatorLabel",
        type: "string",
        defaultValue: "'then'",
        description:
          "Screen-reader phrase inserted between keys in a shortcut sequence.",
      },
    ],
    accessibility: [
      "Uses native kbd elements so key labels keep their text semantics.",
      "Shortcut separators include screen-reader text instead of relying on the plus sign alone.",
      "Kbd is presentational guidance only; the surrounding component must own the actual keyboard behavior.",
    ],
  },
  Avatar: {
    name: "Avatar",
    category: "content",
    description:
      "Identity surface for public profiles, creator previews, and participant rows with image, initials fallback, governed shape, and status indicator.",
    usage: [
      "Use Avatar for people, creators, teams, or identity anchors; do not use it as a decorative icon container.",
      "Provide name or alt text so fallback initials and accessible labels remain meaningful.",
      "Use status only when presence changes user decisions, such as chat availability or live collaboration.",
    ],
    states: [
      {
        name: "Image",
        description:
          "Renders a supplied image with the same radius, border, and surface treatment.",
      },
      {
        name: "Initials",
        description:
          "Falls back to derived initials when no image is provided or image loading fails.",
      },
      {
        name: "Size",
        description:
          "sm, md, and lg cover dense lists, default identity rows, and creator profile headers.",
      },
      {
        name: "Presence",
        description:
          "online, away, busy, and offline status dots are available when presence is meaningful.",
      },
    ],
    props: [
      {
        name: "src",
        type: "string",
        description: "Optional image source used before fallback initials.",
      },
      {
        name: "name",
        type: "string",
        description: "Display name used to derive fallback initials.",
      },
      {
        name: "alt",
        type: "string",
        description:
          "Accessible label for the image or fallback identity surface.",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        description: "Avatar scale for list, default, and profile contexts.",
      },
      {
        name: "shape",
        type: "'circle' | 'soft' | 'square'",
        defaultValue: "'soft'",
        description:
          "Avatar silhouette; circle is reserved for identity imagery only.",
      },
      {
        name: "status",
        type: "'away' | 'busy' | 'offline' | 'online'",
        description: "Optional presence indicator shown at the lower edge.",
      },
    ],
    accessibility: [
      "Image avatars receive alt text from alt, name, or a safe Avatar fallback.",
      "Initial fallback renders with role=img and an accessible label.",
      "Presence dots include a status label and should not be the only visible availability cue in complex flows.",
    ],
  },
  Image: {
    name: "Image",
    category: "content",
    description:
      "Governed media surface for public cards, gallery previews, and editorial highlights with aspect presets, loading skeleton, and resilient fallback behavior.",
    usage: [
      "Use Image when the layout depends on a stable preview frame rather than a raw img tag with uncontrolled ratios.",
      "Choose the aspect preset based on the surrounding composition so card rhythm stays consistent across theme families.",
      "Always provide alt text when the image carries meaning; decorative media should remain visually supportive rather than becoming the only source of context.",
    ],
    states: [
      {
        name: "Loading",
        description:
          "A restrained skeleton preserves layout while the media source is resolving.",
      },
      {
        name: "Loaded",
        description:
          "The image fades into the framed surface without changing the component silhouette.",
      },
      {
        name: "Fallback",
        description:
          "Missing or failed sources switch to a controlled branded fallback instead of collapsing the card.",
      },
      {
        name: "Aspect and fit",
        description:
          "landscape, portrait, square, and wide presets combine with contain or cover to protect composition.",
      },
    ],
    props: [
      {
        name: "src",
        type: "string",
        description: "Optional image source for the media surface.",
      },
      {
        name: "alt",
        type: "string",
        defaultValue: "''",
        description:
          "Accessible text for meaningful imagery and fallback labeling.",
      },
      {
        name: "aspect",
        type: "'landscape' | 'portrait' | 'square' | 'wide'",
        defaultValue: "'landscape'",
        description: "Preset aspect ratio used to stabilize composition.",
      },
      {
        name: "fit",
        type: "'contain' | 'cover'",
        defaultValue: "'cover'",
        description: "Media fitting strategy inside the framed surface.",
      },
      {
        name: "showSkeleton",
        type: "boolean",
        defaultValue: "true",
        description:
          "Keeps the loading placeholder visible before media resolves.",
      },
      {
        name: "shape",
        type: "'soft' | 'square'",
        defaultValue: "'soft'",
        description:
          "Chooses the component corner treatment within the public preset.",
      },
    ],
    accessibility: [
      "Meaningful media should provide alt text; decorative imagery should be accompanied by visible nearby context.",
      "Fallback mode uses role=img with an accessible label so the frame does not become silent when media fails.",
      "The skeleton is aria-hidden because it communicates layout rhythm, not content.",
    ],
  },
  Badge: {
    name: "Badge",
    category: "feedback",
    description:
      "Compact semantic marker for statuses, categories, and lightweight emphasis in public luxe surfaces.",
    usage: [
      "Use badges to label state or category, not as a replacement for buttons.",
      "Keep copy short enough to scan in dense component groups.",
      "Use danger only for risk or destructive meaning, not for decorative contrast.",
    ],
    states: [
      {
        name: "Neutral",
        description: "Low-emphasis metadata and calm labels.",
      },
      {
        name: "Primary",
        description: "Brand-aligned emphasis for active or selected context.",
      },
      {
        name: "Accent",
        description: "Editorial highlight without becoming the primary action.",
      },
      {
        name: "Danger",
        description: "Risk, invalid, or destructive markers.",
      },
    ],
    props: [
      {
        name: "tone",
        type: "'accent' | 'danger' | 'neutral' | 'primary'",
        defaultValue: "'neutral'",
        description: "Semantic color treatment for the marker.",
      },
    ],
    accessibility: [
      "Renders as inline text and inherits surrounding reading order.",
      "Tone should not be the only meaning; keep label text explicit.",
      "Avoid placing interactive behavior on Badge.",
    ],
  },
  Chip: {
    name: "Chip",
    category: "feedback",
    description:
      "Compact selected-item token for filters, preferences, and removable context where Badge would be too passive and Button would be too loud.",
    usage: [
      "Use Chip to show selected filters, selected traits, or lightweight preference tokens.",
      "Use removable only when the token can be safely dismissed from the current local context.",
      "Keep labels short and pair selected state with visible copy rather than relying on color.",
    ],
    states: [
      {
        name: "Neutral",
        description:
          "Default chip for calm filters, traits, and local metadata that can sit beside content.",
      },
      {
        name: "Primary",
        description:
          "Selected or brand-aligned chip when the token participates in the active local filter set.",
      },
      {
        name: "Accent",
        description:
          "Editorial or ceremonial chip used sparingly for expressive public themes.",
      },
      {
        name: "Removable",
        description:
          "Optional close button exposes a focused removal action without turning the whole chip into a button.",
      },
      {
        name: "Disabled",
        description:
          "Preserves inherited or unavailable tokens while disabling removal.",
      },
    ],
    props: [
      {
        name: "tone",
        type: "'accent' | 'neutral' | 'primary'",
        defaultValue: "'neutral'",
        description: "Visual emphasis for the selected item token.",
      },
      {
        name: "selected",
        type: "boolean",
        defaultValue: "false",
        description: "Marks the token as part of the active local selection.",
      },
      {
        name: "removable",
        type: "boolean",
        defaultValue: "false",
        description: "Shows a dedicated remove button inside the chip.",
      },
      {
        name: "removeLabel",
        type: "string",
        defaultValue: "'Remove chip'",
        description: "Accessible label for the remove button.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables chip removal and lowers emphasis.",
      },
    ],
    accessibility: [
      "The chip label remains plain readable text in surrounding order.",
      "Removable chips expose a native button with an accessible remove label.",
      "Do not use the chip container itself as an unlabeled custom interactive control.",
    ],
  },
  Toast: {
    name: "Toast",
    category: "feedback",
    description:
      "Compact transient feedback surface for saved, synced, blocked, or failed moments that need confirmation without becoming a full Alert block.",
    usage: [
      "Use Toast for short-lived feedback after local actions such as save, sync, copy, or dismiss.",
      "Keep copy brief and action-adjacent; persistent recovery instructions should use Alert instead.",
      "Use dismissible only when the message can be safely closed without losing required context.",
    ],
    states: [
      {
        name: "Info",
        description:
          "Neutral contextual notification for changed scope, background sync, or lightweight system updates.",
      },
      {
        name: "Success",
        description:
          "Confirmation that a local action completed and the user can keep moving.",
      },
      {
        name: "Warning",
        description:
          "Recoverable issue that should be noticed quickly but does not require a full inline repair block.",
      },
      {
        name: "Danger",
        description:
          "Short failure notification for immediate attention; longer blockers should become Alert.",
      },
      {
        name: "Dismissible",
        description:
          "Optional close button for transient messages that do not contain required instructions.",
      },
      {
        name: "Action",
        description:
          "Optional single text action for safe transient follow-up such as undo, view, or retry.",
      },
    ],
    props: [
      {
        name: "tone",
        type: "'danger' | 'info' | 'success' | 'warning'",
        defaultValue: "'info'",
        description: "Semantic notification tone.",
      },
      {
        name: "title",
        type: "string",
        defaultValue: "'Notification'",
        description: "Short notification headline.",
      },
      {
        name: "description",
        type: "string",
        description: "Optional concise supporting copy.",
      },
      {
        name: "actionLabel",
        type: "string",
        description:
          "Optional single action label for safe transient follow-up.",
      },
      {
        name: "actionAriaLabel",
        type: "string",
        description:
          "Optional accessible label when the visible action label needs extra context.",
      },
      {
        name: "dismissible",
        type: "boolean",
        defaultValue: "false",
        description: "Shows a dismiss button and emits dismiss when clicked.",
      },
      {
        name: "dismissLabel",
        type: "string",
        defaultValue: "'Dismiss notification'",
        description: "Accessible label for the dismiss button.",
      },
    ],
    accessibility: [
      "Uses role=status for info and success so polite updates are announced.",
      "Uses role=alert for warning and danger because those tones need quicker attention.",
      "Use only one toast action and keep it safe, reversible, or clearly scoped to the local feedback.",
      "Dismissible toasts expose a native button with an accessible dismiss label.",
    ],
  },
  Input: {
    name: "Input",
    category: "form",
    description:
      "Governed single-line text field for search, editing, and settings flows with label, help text, and invalid state.",
    usage: [
      "Prefer explicit labels over placeholder-only fields.",
      "Use description for stable guidance and invalidMessage for actionable correction.",
      "Use Textarea for longer comments, profile copy, support notes, and character-counted writing.",
    ],
    states: [
      {
        name: "Default",
        description:
          "Single-line text input with optional label and description.",
      },
      {
        name: "Multiline",
        description:
          "Backward-compatible textarea variant keeps the same surface, but new long-text flows should prefer Textarea.",
      },
      {
        name: "Invalid",
        description:
          "Combines aria-invalid, message linkage, and stronger border tone.",
      },
      {
        name: "Disabled",
        description: "Preserves layout while removing input interaction.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description: "Controlled field value.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible field label.",
      },
      {
        name: "description",
        type: "string",
        description: "Helper copy linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description: "Validation message linked through aria-describedby.",
      },
      {
        name: "multiline",
        type: "boolean",
        defaultValue: "false",
        description: "Switches the native control from input to textarea.",
      },
      {
        name: "type",
        type: "'email' | 'number' | 'password' | 'search' | 'text' | 'url'",
        defaultValue: "'text'",
        description: "Native input type for the single-line variant.",
      },
    ],
    accessibility: [
      "Generated ids connect description and invalid message to the control.",
      "Invalid state sets aria-invalid.",
      "The label wraps the native input or textarea for predictable activation.",
    ],
  },
  SearchInput: {
    name: "Search Input",
    category: "form",
    description:
      "Single-line search entry for public content discovery, local list filtering, and support lookup with visible submit and clear actions.",
    usage: [
      "Use when the user needs to enter a query and intentionally submit it.",
      "Use the clear action to make recovery obvious after a query narrows the current surface.",
      "Keep placeholder copy example-oriented; the visible label still names what is being searched.",
    ],
    states: [
      {
        name: "Empty",
        description:
          "The query field and submit action remain visible without implying a result state.",
      },
      {
        name: "Has value",
        description:
          "Clear action appears only when there is a query to remove.",
      },
      {
        name: "Submitted",
        description:
          "Submit emits the trimmed query while the component does not own result rendering.",
      },
      {
        name: "Invalid",
        description:
          "Invalid state keeps the visible submit path while linking repair copy through aria-describedby.",
      },
      {
        name: "Disabled",
        description:
          "Input, clear, and submit actions are disabled together while preserving layout.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description: "Controlled search query value.",
      },
      {
        name: "label",
        type: "string",
        defaultValue: "'Search'",
        description: "Visible label naming the searchable content scope.",
      },
      {
        name: "description",
        type: "string",
        description: "Helper copy linked to the native search input.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable query repair message linked to the native search input.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: "'Search'",
        description: "Example query or short input hint.",
      },
      {
        name: "buttonLabel",
        type: "string",
        defaultValue: "'Search'",
        description: "Visible submit button label.",
      },
      {
        name: "clearLabel",
        type: "string",
        defaultValue: "'Clear search'",
        description: "Accessible label for the clear query button.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables query editing, clearing, and submission.",
      },
    ],
    accessibility: [
      "Uses form role=search and a native input type=search.",
      "The visible label names the searchable scope, while helper and invalid copy are linked through aria-describedby.",
      "Clear and submit are native buttons with separate labels so keyboard users can recover or submit intentionally.",
    ],
  },
  Fieldset: {
    name: "Fieldset",
    category: "form",
    description:
      "Semantic field grouping primitive for public forms, consent clusters, preference sections, and repair lanes that need structure without another card layer.",
    usage: [
      "Use Fieldset when related controls share one question, instruction, or validation message.",
      "Prefer it over nested cards for Checkbox, Radio Group, Input, Textarea, Select, and FileInput clusters inside a form.",
      "Keep the legend visible and specific so the group reads as one decision rather than scattered controls.",
    ],
    states: [
      {
        name: "Neutral",
        description:
          "Default field group keeps related controls together with a subtle surface and native fieldset semantics.",
      },
      {
        name: "Primary and accent",
        description:
          "Tone raises local emphasis for the active form lane without turning every nested control into a feature card.",
      },
      {
        name: "Invalid",
        description:
          "Invalid message links through aria-describedby and keeps repair copy attached to the whole group.",
      },
      {
        name: "Disabled",
        description:
          "Native disabled fieldset blocks contained controls while preserving visible review context.",
      },
      {
        name: "Comfortable and compact",
        description:
          "Density changes spacing only, supporting normal writing lanes and tighter checklist surfaces.",
      },
    ],
    props: [
      {
        name: "legend",
        type: "string",
        description:
          "Visible group label rendered as the native fieldset legend.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Helper copy linked to the fieldset through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Group-level validation or repair message linked through aria-describedby.",
      },
      {
        name: "tone",
        type: "'accent' | 'danger' | 'neutral' | 'primary'",
        defaultValue: "'neutral'",
        description: "Semantic emphasis for the grouped control lane.",
      },
      {
        name: "density",
        type: "'comfortable' | 'compact'",
        defaultValue: "'comfortable'",
        description: "Spacing rhythm for normal forms or denser review lists.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description:
          "Disables the native fieldset and the supported form controls inside it.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Field group'",
        description:
          "Accessible fallback label used only when no visible legend is provided.",
      },
    ],
    accessibility: [
      "Uses native fieldset and legend semantics so grouped controls announce their shared context.",
      "Description and invalid message are linked through aria-describedby on the fieldset.",
      "Group tone is supplemental; the legend, helper, and invalid copy must carry the actual meaning.",
    ],
  },
  Textarea: {
    name: "Textarea",
    category: "form",
    description:
      "Long-text entry primitive for comments, profile descriptions, support notes, and creator submission copy that need visible guidance and optional character count.",
    usage: [
      "Use Textarea when the user writes more than a short field value and needs room to review their words.",
      "Use showCount or maxLength when copy length affects publishing, moderation, or review readiness.",
      "Keep helper and invalid copy close to the writing surface so users can repair content without scanning another card.",
    ],
    states: [
      {
        name: "Empty",
        description:
          "Empty writing surface keeps label, helper copy, and placeholder available without hiding the task.",
      },
      {
        name: "Composed text",
        description:
          "Controlled text updates as the user writes and preserves native textarea behavior.",
      },
      {
        name: "Counted",
        description:
          "Character count can expose current length alone or current length against maxLength.",
      },
      {
        name: "Invalid",
        description:
          "Invalid state links visible recovery copy through aria-describedby and sets aria-invalid.",
      },
      {
        name: "Read-only and disabled",
        description:
          "Read-only preserves submitted copy for review, while disabled removes editing from unavailable text.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description: "Controlled textarea content.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible field label that names the writing task.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Stable helper copy for tone, privacy, or publishing expectations.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable validation message linked through aria-describedby.",
      },
      {
        name: "maxLength",
        type: "number",
        description:
          "Native maximum character length and optional count denominator.",
      },
      {
        name: "showCount",
        type: "boolean",
        defaultValue: "false",
        description: "Shows current character count even without maxLength.",
      },
      {
        name: "rows",
        type: "number",
        defaultValue: "5",
        description: "Native textarea row count.",
      },
      {
        name: "resize",
        type: "'block' | 'both' | 'inline' | 'none'",
        defaultValue: "'block'",
        description: "Controls native resize direction.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description: "Prevents editing while keeping submitted copy readable.",
      },
    ],
    accessibility: [
      "Uses a native textarea so keyboard editing, selection, and assistive technology behavior remain available.",
      "Generated ids connect helper copy, character count, and invalid copy through aria-describedby.",
      "Invalid and count states are expressed with visible text, not color alone.",
    ],
  },
  NumberInput: {
    name: "NumberInput",
    category: "form",
    description:
      "Exact numeric entry primitive for quantities, seats, limits, budgets, and threshold fields that need typed precision rather than approximate slider tuning.",
    usage: [
      "Use NumberInput when the user must type or step an exact bounded value with visible label, unit, and correction path.",
      "Keep min, max, step, and unit tied to the surrounding copy so the number has a clear product meaning.",
      "Use invalidMessage for actionable correction instead of silently changing typed values while the user is editing.",
    ],
    states: [
      {
        name: "Empty",
        description:
          "Empty entry emits null so forms can distinguish no answer from zero.",
      },
      {
        name: "Typed value",
        description:
          "Native number input accepts precise values and keeps browser keyboard behavior available.",
      },
      {
        name: "Stepped",
        description:
          "Optional local steppers move by step and clamp to min or max without becoming a calculator.",
      },
      {
        name: "Invalid",
        description:
          "Invalid state links visible recovery copy through aria-describedby and sets aria-invalid.",
      },
      {
        name: "Read-only and disabled",
        description:
          "Read-only preserves submitted value for review, while disabled removes interaction from unavailable fields.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "number | null",
        defaultValue: "null",
        description:
          "Controlled numeric value; empty input emits null rather than an empty string.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible field label that names what the number controls.",
      },
      {
        name: "description",
        type: "string",
        description: "Stable helper copy linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable validation message linked through aria-describedby.",
      },
      {
        name: "min",
        type: "number",
        description:
          "Optional lower bound used by the native input and stepper clamp.",
      },
      {
        name: "max",
        type: "number",
        description:
          "Optional upper bound used by the native input and stepper clamp.",
      },
      {
        name: "step",
        type: "number",
        defaultValue: "1",
        description: "Native number increment and local stepper amount.",
      },
      {
        name: "rangeText",
        type: "string",
        description:
          "Optional visible range copy; when omitted, min and max generate a compact readable hint.",
      },
      {
        name: "unit",
        type: "string",
        description:
          "Visible suffix for units such as seats, minutes, days, or credits.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description:
          "Prevents editing while preserving the value for review surfaces.",
      },
    ],
    accessibility: [
      "Uses a native number input so keyboard, mobile numeric entry, and browser value semantics remain intact.",
      "Description, generated range hint, and invalid message ids are joined in aria-describedby when present.",
      "Stepper buttons have explicit increase and decrease labels, while invalid state exposes a visible correction message.",
    ],
  },
  DateInput: {
    name: "DateInput",
    category: "form",
    description:
      "Native date entry primitive for event dates, validity windows, publishing schedules, and recovery deadlines that need one exact calendar day without a heavy picker.",
    usage: [
      "Use DateInput when the user must choose or review a single exact date with visible label, helper copy, and validation feedback.",
      "Keep min and max tied to surrounding policy copy so date limits are understandable before submission.",
      "Use invalidMessage for actionable recovery when a date is outside a booking, membership, or publishing window.",
    ],
    states: [
      {
        name: "Empty",
        description:
          "Empty entry keeps the controlled value as an empty string so optional date fields can remain unset.",
      },
      {
        name: "Selected date",
        description:
          "Native date input stores the value as YYYY-MM-DD and preserves browser calendar, keyboard, and mobile behavior.",
      },
      {
        name: "Bounded date",
        description:
          "Min and max expose simple inclusive boundaries without becoming a scheduler or policy engine.",
      },
      {
        name: "Invalid",
        description:
          "Invalid state links visible recovery copy through aria-describedby and sets aria-invalid.",
      },
      {
        name: "Read-only and disabled",
        description:
          "Read-only preserves a submitted date for review, while disabled explains unavailable date changes.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description:
          "Controlled native date value in YYYY-MM-DD format; empty string represents no date.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible field label that names the date decision.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Stable helper copy for date meaning, deadline, or allowed window.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable validation message linked through aria-describedby.",
      },
      {
        name: "min",
        type: "string",
        description:
          "Optional inclusive lower bound in native YYYY-MM-DD format.",
      },
      {
        name: "max",
        type: "string",
        description:
          "Optional inclusive upper bound in native YYYY-MM-DD format.",
      },
      {
        name: "rangeText",
        type: "string",
        description:
          "Optional visible date-window copy; when omitted, min and max generate a compact readable hint.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description:
          "Prevents editing while keeping the selected date visible for review.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description:
          "Disables the native date control when date editing is unavailable.",
      },
    ],
    accessibility: [
      "Uses a native date input so browser keyboard, mobile date entry, and platform semantics remain available.",
      "Generated ids connect helper, date-window copy, and invalid copy through aria-describedby.",
      "Invalid state exposes visible correction text and sets aria-invalid without relying on color alone.",
    ],
  },
  FileInput: {
    name: "FileInput",
    category: "form",
    description:
      "Native file selection primitive for avatars, proof documents, creator attachments, and support evidence that need clear filenames without owning upload transport.",
    usage: [
      "Use FileInput when the user must choose one or more local files and see what has been selected before submission.",
      "Keep accepted file types, size policy, and privacy copy visible near the field instead of hiding risk in backend validation.",
      "Use invalidMessage for repairable selection problems such as wrong type, too many files, or missing required evidence.",
    ],
    states: [
      {
        name: "Empty",
        description:
          "Empty state shows stable no-file copy, links that summary to the native control, and keeps the picker available.",
      },
      {
        name: "Selected file",
        description:
          "Single selection exposes the filename and keeps native file picker semantics intact.",
      },
      {
        name: "Multiple files",
        description:
          "Multiple selection summarizes count and lists filenames without becoming an upload queue.",
      },
      {
        name: "Invalid",
        description:
          "Invalid state links visible repair copy through aria-describedby and sets aria-invalid.",
      },
      {
        name: "Disabled",
        description:
          "Disabled state prevents selection and clearing when attachment changes are unavailable.",
      },
    ],
    props: [
      {
        name: "accept",
        type: "string",
        description:
          "Native accept filter such as image/* or .pdf; final validation remains page-owned.",
      },
      {
        name: "multiple",
        type: "boolean",
        defaultValue: "false",
        description: "Allows more than one file to be selected.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible field label that names the attachment purpose.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Stable helper copy for file type, privacy, or size expectations.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable validation message linked through aria-describedby.",
      },
      {
        name: "clearLabel",
        type: "string",
        defaultValue: "'Clear selected files'",
        description:
          "Accessible label and visible copy for clearing selection.",
      },
      {
        name: "noFileLabel",
        type: "string",
        defaultValue: "'No file selected'",
        description: "Visible summary copy before any file is selected.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description:
          "Disables file selection and clearing when attachment changes are unavailable.",
      },
    ],
    accessibility: [
      "Uses a native file input so platform picker semantics and keyboard access remain intact.",
      "Generated ids connect helper copy, selection summary, selected filenames, and invalid copy through aria-describedby.",
      "Selection summary uses a polite live region so selected or cleared files are announced without adding an upload queue.",
      "Selected filenames are displayed as text and invalid state does not rely on color alone.",
    ],
  },
  Card: {
    name: "Card",
    category: "content",
    description:
      "Public luxe content surface for previews, feature summaries, and action groups without falling back to enterprise panels.",
    usage: [
      "Use cards for stable content grouping, not for every small visual block.",
      "Choose feature emphasis for one hero-level card per section.",
      "Keep footer actions secondary to the card's content hierarchy.",
    ],
    states: [
      {
        name: "Default",
        description: "Balanced surface for everyday public content blocks.",
      },
      {
        name: "Feature",
        description:
          "Adds more atmosphere for lead cards and promotional moments.",
      },
      {
        name: "Muted",
        description: "Reduces chrome for dense support content.",
      },
      {
        name: "Slots",
        description:
          "Header and footer slots allow custom composition without a second card owner.",
      },
    ],
    props: [
      {
        name: "eyebrow",
        type: "string",
        description: "Small category label above the title.",
      },
      {
        name: "title",
        type: "string",
        description: "Card title rendered as h3 by default.",
      },
      {
        name: "subtitle",
        type: "string",
        description: "Supporting copy below the title.",
      },
      {
        name: "emphasis",
        type: "'default' | 'feature' | 'muted'",
        defaultValue: "'default'",
        description: "Surface intensity within the same theme language.",
      },
    ],
    accessibility: [
      "Uses article semantics for self-contained content.",
      "Default title renders as a heading for page structure.",
      "Slots keep custom markup under caller control when stronger semantics are needed.",
    ],
  },
  Dialog: {
    name: "Dialog",
    category: "feedback",
    description:
      "Focused overlay for confirmation and short public workflows with escape handling, initial focus, and focus restoration.",
    usage: [
      "Use dialogs for interruptive confirmation or compact editing, not for long multi-page workspaces.",
      "Always provide a clear title and a footer action pair.",
      "Disable backdrop or escape close only when losing state would be harmful.",
    ],
    states: [
      {
        name: "Closed",
        description: "No DOM overlay when open is false.",
      },
      {
        name: "Open",
        description:
          "Panel is labelled, modal, and focused on the close control.",
      },
      {
        name: "Size",
        description:
          "sm, md, and lg support confirmations through richer previews.",
      },
      {
        name: "Dismissal",
        description: "Escape and backdrop close are configurable.",
      },
    ],
    props: [
      {
        name: "open",
        type: "boolean",
        defaultValue: "false",
        description: "Controls dialog visibility.",
      },
      {
        name: "title",
        type: "string",
        description: "Dialog heading linked through aria-labelledby.",
      },
      {
        name: "description",
        type: "string",
        description: "Supporting copy linked through aria-describedby.",
      },
      {
        name: "size",
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        description: "Panel width preset.",
      },
      {
        name: "closeOnBackdrop",
        type: "boolean",
        defaultValue: "true",
        description: "Allows backdrop click dismissal.",
      },
      {
        name: "closeOnEscape",
        type: "boolean",
        defaultValue: "true",
        description: "Allows Escape key dismissal.",
      },
    ],
    accessibility: [
      "Uses role=dialog and aria-modal=true.",
      "Title and description ids are wired when provided.",
      "Focus moves into the panel on open and returns to the trigger on close.",
    ],
  },
  Select: {
    name: "Select",
    category: "form",
    description:
      "Native select wrapped in the public field language for governed theme, density, and preference choices.",
    usage: [
      "Use select when the full option list is short and stable.",
      "Use placeholder to force an intentional choice only when no safe default exists.",
      "For rich search or async lists, add a dedicated component later instead of overloading this one.",
    ],
    states: [
      {
        name: "Selected",
        description: "Controlled value maps to one of the provided options.",
      },
      {
        name: "Placeholder",
        description: "Empty value uses a disabled placeholder option.",
      },
      {
        name: "Empty options",
        description:
          "When no options exist, the field explains that absence instead of inviting interaction with an empty dropdown.",
      },
      {
        name: "Invalid",
        description: "Validation uses the same message language as Input.",
      },
      {
        name: "Disabled",
        description: "Keeps field hierarchy visible while blocking changes.",
      },
    ],
    props: [
      {
        name: "options",
        type: "UiSelectOption[]",
        required: true,
        description: "List of selectable value/label pairs.",
      },
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description: "Controlled selected option value.",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: "'Select an option'",
        description: "Disabled placeholder shown for empty values.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible field label.",
      },
      {
        name: "description",
        type: "string",
        description: "Helper copy linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description: "Validation copy linked through aria-describedby.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No options available yet.'",
        description:
          "Visible copy shown when options is empty; the control becomes disabled in that state.",
      },
    ],
    accessibility: [
      "Keeps native select semantics and keyboard behavior.",
      "Description and validation copy are linked to the control.",
      "Empty option sets disable the select and explain the absence through visible text instead of leaving a hollow control.",
      "Invalid state sets aria-invalid.",
    ],
  },
  Slider: {
    name: "Slider",
    category: "form",
    description:
      "Single-value range control for theme intensity, ornament budget, volume, and other bounded public preferences that benefit from continuous adjustment.",
    usage: [
      "Use slider when the user adjusts a known numeric range rather than choosing from discrete labels.",
      "Keep the label and min/max meaning visible so the control does not become decorative motion.",
      "Use showValue when the exact setting matters; hide it only when surrounding copy already names the result.",
    ],
    states: [
      {
        name: "Bounded value",
        description:
          "modelValue is resolved between min and max and reflected by the visual track fill.",
      },
      {
        name: "Step",
        description:
          "step controls the native keyboard and pointer increment for coarse or fine tuning.",
      },
      {
        name: "With value",
        description:
          "showValue exposes the current numeric value and optional unit beside the label.",
      },
      {
        name: "Disabled",
        description:
          "Unavailable ranges remain visible while blocking pointer and keyboard updates.",
      },
      {
        name: "Invalid",
        description:
          "Repair copy is linked to the native range input without hiding the current value.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "number",
        defaultValue: "0",
        description: "Controlled numeric value for the range input.",
      },
      {
        name: "min",
        type: "number",
        defaultValue: "0",
        description: "Lower bound displayed in the scale and applied to input.",
      },
      {
        name: "max",
        type: "number",
        defaultValue: "100",
        description: "Upper bound displayed in the scale and applied to input.",
      },
      {
        name: "step",
        type: "number",
        defaultValue: "1",
        description: "Native increment used by pointer and keyboard changes.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible range label.",
      },
      {
        name: "description",
        type: "string",
        description: "Helper copy linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable range repair message linked through aria-describedby.",
      },
      {
        name: "unit",
        type: "string",
        defaultValue: "''",
        description: "Optional suffix shown with the current value and scale.",
      },
      {
        name: "showValue",
        type: "boolean",
        defaultValue: "true",
        description: "Shows the current numeric value beside the label.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables range changes.",
      },
    ],
    accessibility: [
      "Uses native input type=range so keyboard and assistive technology semantics are preserved.",
      "Description and invalid copy are linked to the control when provided.",
      "Invalid state sets aria-invalid while preserving the visible range value and min/max scale.",
      "Visible labels and units must explain the scale because color alone cannot communicate intensity.",
    ],
  },
  Rating: {
    name: "Rating",
    category: "form",
    description:
      "Discrete single-value feedback control for public preference, content quality, satisfaction, and lightweight evaluation moments.",
    usage: [
      "Use rating when the user expresses a small ordered score rather than writing a review or choosing named categories.",
      "Keep the scale short and explain what the value means before asking for feedback.",
      "Use readOnly for displayed scores; use interactive rating only when the user can change the value locally.",
    ],
    states: [
      {
        name: "Empty",
        description:
          "No item is selected yet, while the first rating remains keyboard reachable.",
      },
      {
        name: "Selected",
        description:
          "The chosen value owns aria-checked=true and lower values render as filled evidence.",
      },
      {
        name: "Read only",
        description:
          "Displays an existing score without allowing pointer or keyboard changes.",
      },
      {
        name: "Disabled",
        description:
          "Unavailable feedback paths remain visible while blocking interaction.",
      },
      {
        name: "Invalid",
        description:
          "Repair copy is linked to the radiogroup when a required score or feedback rule is not satisfied.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "number",
        defaultValue: "0",
        description: "Controlled selected rating value.",
      },
      {
        name: "max",
        type: "number",
        defaultValue: "5",
        description: "Maximum rating item count, clamped to a compact range.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible rating label.",
      },
      {
        name: "description",
        type: "string",
        description: "Helper copy linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable rating repair message linked through aria-describedby.",
      },
      {
        name: "readOnly",
        type: "boolean",
        defaultValue: "false",
        description: "Shows the score without permitting changes.",
      },
      {
        name: "showValue",
        type: "boolean",
        defaultValue: "true",
        description: "Shows the current value as value/max beside the label.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables rating changes.",
      },
    ],
    accessibility: [
      "Uses radiogroup and radio roles so the discrete scale has familiar keyboard semantics.",
      "Arrow keys, Home, and End move selection when the rating is interactive.",
      "Description and invalid copy are connected through aria-describedby when present.",
      "Visible copy must explain the scale because filled marks alone do not communicate meaning.",
    ],
  },
  Switch: {
    name: "Switch",
    category: "form",
    description:
      "Binary runtime toggle for public settings where the state changes immediately and must be visually obvious.",
    usage: [
      "Use switch for on/off settings, not for selecting one item from many choices.",
      "Pair every switch with a label; add description when the consequence is not obvious.",
      "Use disabled for unavailable runtime paths, not for completed choices.",
    ],
    states: [
      {
        name: "Checked",
        description:
          "Enabled state with luminous emphasis and aria-checked=true.",
      },
      {
        name: "Unchecked",
        description: "Off state with subdued control treatment.",
      },
      {
        name: "Disabled",
        description: "Preserves state visibility while blocking interaction.",
      },
      {
        name: "With description",
        description: "Supports explanatory copy beside the control.",
      },
      {
        name: "Invalid",
        description:
          "Repair copy is linked through aria-describedby when a preference cannot be accepted.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "boolean",
        defaultValue: "false",
        description: "Controlled checked state.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible switch label.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Supporting copy under the label linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable preference repair message linked through aria-describedby.",
      },
      {
        name: "id",
        type: "string",
        description:
          "Optional id for the switch button and generated helper ids.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables state changes.",
      },
    ],
    accessibility: [
      "Uses role=switch and aria-checked.",
      "Keyboard activation is inherited from the native button.",
      "Description and invalid copy are connected through aria-describedby when present.",
      "Visible labels should explain the setting without relying on color.",
    ],
  },
  Progress: {
    name: "Progress",
    category: "feedback",
    description:
      "Linear completion indicator for uploads, setup milestones, and staged progress where the user needs a clear sense of completion without a chart-heavy surface.",
    usage: [
      "Use progress when work has a bounded range and users benefit from seeing completion move forward.",
      "Pair progress with a short label that explains the tracked task rather than leaving the bar context-free.",
      "Use warning or accent sparingly for guarded milestones; default to primary or success for most completion feedback.",
    ],
    states: [
      {
        name: "Determinate",
        description:
          "value and max resolve to a bounded percentage and render a proportional fill width.",
      },
      {
        name: "Tone",
        description:
          "primary, accent, success, and warning preserve the same structure while shifting semantic emphasis.",
      },
      {
        name: "With value",
        description:
          "showValue exposes the rounded percentage for users who need explicit numeric completion.",
      },
      {
        name: "Clamped range",
        description:
          "Negative or overflow values are safely clamped between zero and the resolved maximum.",
      },
    ],
    props: [
      {
        name: "value",
        type: "number",
        defaultValue: "0",
        description: "Current progress value before percentage normalization.",
      },
      {
        name: "max",
        type: "number",
        defaultValue: "100",
        description: "Upper bound used to calculate completion percentage.",
      },
      {
        name: "label",
        type: "string",
        description:
          "Visible and accessible context label for the progress task.",
      },
      {
        name: "showValue",
        type: "boolean",
        defaultValue: "true",
        description: "Shows the rounded percentage beside the label.",
      },
      {
        name: "tone",
        type: "'accent' | 'primary' | 'success' | 'warning'",
        defaultValue: "'primary'",
        description: "Semantic emphasis for the fill treatment.",
      },
    ],
    accessibility: [
      "Uses role=progressbar with aria-valuemin, aria-valuemax, and aria-valuenow.",
      "aria-label falls back to the visible label or a safe Progress label when none is provided.",
      "Numeric completion should remain supplemental; the task label still needs to explain what is progressing.",
    ],
  },
  Meter: {
    name: "Meter",
    category: "content",
    description:
      "Bounded scalar indicator for capacity, fit, quality, health, and quota signals where the value describes a condition rather than task completion.",
    usage: [
      "Use Meter when users need to judge a known bounded value such as capacity, theme fit, quality, or risk level.",
      "Pair Meter with a label and helper copy so the scalar has a visible meaning instead of becoming a decorative bar.",
      "Use status tones only when the measured value has a clear semantic consequence, not just to add more color.",
    ],
    states: [
      {
        name: "Bounded value",
        description:
          "value and max resolve to a clamped scalar percentage while preserving the original numeric aria value.",
      },
      {
        name: "Semantic tone",
        description:
          "primary, accent, success, warning, and danger express the meaning of the measured condition.",
      },
      {
        name: "Readable value",
        description:
          "showValue exposes a percentage or custom valueText when the scalar needs a human-readable label.",
      },
      {
        name: "Helper copy",
        description:
          "helper explains what the measured value means and how users should interpret it.",
      },
    ],
    props: [
      {
        name: "value",
        type: "number",
        defaultValue: "0",
        description: "Current scalar value before bounded normalization.",
      },
      {
        name: "max",
        type: "number",
        defaultValue: "100",
        description: "Upper bound used to calculate the visual fill.",
      },
      {
        name: "label",
        type: "string",
        defaultValue: "''",
        description: "Visible and accessible label for the measured value.",
      },
      {
        name: "helper",
        type: "string",
        defaultValue: "''",
        description:
          "Visible explanation of what the scalar means in the current surface.",
      },
      {
        name: "valueText",
        type: "string",
        defaultValue: "''",
        description:
          "Optional human-readable value used visually and as aria-valuetext.",
      },
      {
        name: "showValue",
        type: "boolean",
        defaultValue: "true",
        description: "Shows the readable value beside the label.",
      },
      {
        name: "tone",
        type: "'accent' | 'danger' | 'primary' | 'success' | 'warning'",
        defaultValue: "'primary'",
        description: "Semantic emphasis for the measured condition.",
      },
    ],
    accessibility: [
      "Uses role=meter with aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext.",
      "The label should name the measured condition, not the visual shape of the bar.",
      "Tone is supplemental; helper or valueText must explain success, warning, risk, or capacity without relying on color alone.",
    ],
  },
  Spinner: {
    name: "Spinner",
    category: "feedback",
    description:
      "Indeterminate local waiting indicator for short async moments, inline pending states, and compact loading feedback that should not become a full-page overlay.",
    usage: [
      "Use Spinner when the system is waiting briefly and the exact duration or completion percentage is unknown.",
      "Prefer Progress when the task has a known range, and prefer Skeleton when the incoming content structure is known.",
      "Keep a visible or accessible label so users know what is waiting instead of watching decorative motion.",
    ],
    states: [
      {
        name: "Primary",
        description:
          "Default spinner tone follows the active theme primary role for nearby product actions.",
      },
      {
        name: "Accent and neutral",
        description:
          "Accent supports more expressive public moments, while neutral keeps dense waiting states quiet.",
      },
      {
        name: "Size",
        description:
          "sm, md, and lg cover inline labels, normal surfaces, and stronger local loading moments.",
      },
      {
        name: "Label visibility",
        description:
          "showLabel can expose the loading copy visually, while hidden labels remain available to assistive technology.",
      },
    ],
    props: [
      {
        name: "label",
        type: "string",
        defaultValue: "'Loading'",
        description:
          "Accessible loading label, and visible copy when showLabel is enabled.",
      },
      {
        name: "showLabel",
        type: "boolean",
        defaultValue: "false",
        description:
          "Shows the label beside the spinner instead of visually hiding it.",
      },
      {
        name: "size",
        type: "'lg' | 'md' | 'sm'",
        defaultValue: "'md'",
        description: "Spinner scale for inline, default, or local feature use.",
      },
      {
        name: "tone",
        type: "'accent' | 'neutral' | 'primary'",
        defaultValue: "'primary'",
        description: "Semantic emphasis for the spinner ring.",
      },
    ],
    accessibility: [
      "Uses role=status so the loading label is exposed as non-blocking status feedback.",
      "When showLabel is false, the label remains available through aria-label and sr-only text.",
      "The spinner is supplemental; nearby copy should still explain long waits, failures, or next steps.",
    ],
  },
  EmptyState: {
    name: "Empty State",
    category: "feedback",
    description:
      "Guided empty surface that explains absence, preserves the public theme mood, and offers a next step when available.",
    usage: [
      "Use when a collection, comparison, or review lane has no content yet.",
      "Prefer one primary next action and one optional secondary escape.",
      "Keep the empty copy about the user's next move, not internal implementation status.",
    ],
    states: [
      {
        name: "Default",
        description: "Calm empty surface for standard absence.",
      },
      {
        name: "Accent",
        description: "Higher-emphasis empty state for key guided journeys.",
      },
      {
        name: "With actions",
        description:
          "Action slot turns the absence into a clear recovery path.",
      },
      {
        name: "Fallback copy",
        description:
          "Default slot has safe copy when callers do not pass content.",
      },
    ],
    props: [
      {
        name: "eyebrow",
        type: "string",
        description: "Small category label above the title.",
      },
      {
        name: "title",
        type: "string",
        defaultValue: "'Nothing here yet'",
        description: "Primary empty state heading.",
      },
      {
        name: "tone",
        type: "'accent' | 'default'",
        defaultValue: "'default'",
        description: "Surface intensity for the empty state.",
      },
    ],
    accessibility: [
      "Uses section semantics with a visible h3 heading.",
      "Action slot should contain real buttons or links with clear labels.",
      "Avoid decorative-only empty states that do not explain the absence.",
    ],
  },
  Checkbox: {
    name: "Checkbox",
    category: "form",
    description:
      "Explicit inclusion control for independent yes/no choices that should not feel like a runtime switch.",
    usage: [
      "Use checkbox for inclusion, consent, or independent options.",
      "Use switch instead when the setting applies immediately as an on/off runtime toggle.",
      "Disabled checked state is acceptable for inherited or locked configuration.",
    ],
    states: [
      {
        name: "Checked",
        description: "Selected inclusion state with aria-checked=true.",
      },
      {
        name: "Unchecked",
        description: "Available option not currently selected.",
      },
      {
        name: "Disabled",
        description: "Read-only or unavailable option state.",
      },
      {
        name: "With description",
        description: "Clarifies why the option exists or what it affects.",
      },
      {
        name: "Invalid",
        description:
          "Actionable repair copy is linked through aria-describedby without changing the inclusion choice.",
      },
    ],
    props: [
      {
        name: "modelValue",
        type: "boolean",
        defaultValue: "false",
        description: "Controlled checked state.",
      },
      {
        name: "label",
        type: "string",
        description: "Visible checkbox label.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Supporting copy under the label linked through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable validation or consent repair message linked through aria-describedby.",
      },
      {
        name: "id",
        type: "string",
        description:
          "Optional id for the checkbox button and generated helper ids.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables selection changes.",
      },
    ],
    accessibility: [
      "Uses role=checkbox and aria-checked.",
      "Keyboard activation is inherited from the native button.",
      "Description and invalid copy are connected through aria-describedby when present.",
      "The check icon is hidden from assistive technology.",
    ],
  },
  RadioGroup: {
    name: "Radio Group",
    category: "form",
    description:
      "Single-choice decision group for density, style, or preference options with roving keyboard selection.",
    usage: [
      "Use when exactly one option in a small set can be selected.",
      "Do not use radio group as navigation; use tabs when switching content sections.",
      "Descriptions should distinguish consequences, not repeat labels.",
    ],
    states: [
      {
        name: "Selected",
        description: "One radio owns aria-checked=true.",
      },
      {
        name: "Unselected",
        description:
          "Available but inactive options remain focusable by roving logic.",
      },
      {
        name: "Keyboard",
        description: "Arrow keys, Home, and End move selection and focus.",
      },
      {
        name: "Descriptions",
        description: "Optional item descriptions support decision clarity.",
      },
      {
        name: "Invalid",
        description:
          "Group-level repair copy is linked through aria-describedby without turning options into separate cards.",
      },
      {
        name: "Disabled",
        description:
          "All radio options stop accepting selection while preserving the visible decision context.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicRadioItem[]",
        required: true,
        description:
          "Radio item key, value, label, and optional description definitions.",
      },
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description: "Controlled selected value.",
      },
      {
        name: "label",
        type: "string",
        description:
          "Visible group label; when present it becomes the radiogroup accessible name.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Visible helper copy linked to the radiogroup through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable group-level repair message linked through aria-describedby.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables every radio option in the group.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Options'",
        description:
          "Accessible fallback label for the radiogroup when no visible label is provided.",
      },
    ],
    accessibility: [
      "Uses role=radiogroup and role=radio.",
      "aria-checked reflects the selected item.",
      "Visible label, helper copy, and invalid copy are connected with aria-labelledby and aria-describedby.",
      "Roving tabindex keeps keyboard focus within the group when enabled.",
    ],
  },
  SegmentedControl: {
    name: "Segmented Control",
    category: "form",
    description:
      "Compact single-choice control for nearby view, density, tone, or mode preferences without opening a menu or switching panels.",
    usage: [
      "Use when two to four short options affect the current surface immediately.",
      "Keep labels brief because the control is optimized for compact preference switching.",
      "Use Radio Group instead when each option needs visible descriptions or form-level comparison.",
    ],
    states: [
      {
        name: "Selected",
        description:
          "One segment owns aria-checked=true and receives the active surface treatment.",
      },
      {
        name: "Unselected",
        description:
          "Inactive segments remain visible and reachable through roving focus.",
      },
      {
        name: "Keyboard",
        description:
          "Arrow keys, Home, and End move selection without leaving the compact group.",
      },
      {
        name: "Compact",
        description:
          "Short labels keep the control readable in toolbars, preview lanes, and preference panels.",
      },
      {
        name: "Invalid",
        description:
          "Group-level repair copy stays attached to the compact radiogroup through aria-describedby.",
      },
      {
        name: "Disabled",
        description:
          "Every segment stops accepting selection while preserving the current compact choice.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicSegmentedItem[]",
        required: true,
        description:
          "Segment key, value, label, and optional assistive description definitions.",
      },
      {
        name: "modelValue",
        type: "string",
        defaultValue: "''",
        description: "Controlled selected segment value.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Segmented options'",
        description:
          "Accessible fallback label for the compact radiogroup when no visible label is provided.",
      },
      {
        name: "label",
        type: "string",
        description:
          "Visible group label; when present it becomes the radiogroup accessible name.",
      },
      {
        name: "description",
        type: "string",
        description:
          "Visible helper copy linked to the radiogroup through aria-describedby.",
      },
      {
        name: "invalidMessage",
        type: "string",
        description:
          "Actionable compact-choice repair message linked through aria-describedby.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables every segment in the control.",
      },
      {
        name: "id",
        type: "string",
        description:
          "Optional id for the segmented radiogroup and generated helper ids.",
      },
    ],
    accessibility: [
      "Uses role=radiogroup and role=radio for single-choice semantics.",
      "aria-checked reflects the selected segment.",
      "Visible label, helper copy, and invalid copy are connected with aria-labelledby and aria-describedby.",
      "Roving tabindex keeps focus movement predictable with Arrow, Home, and End keys.",
    ],
  },
  Skeleton: {
    name: "Skeleton",
    category: "feedback",
    description:
      "Loading placeholder that preserves layout rhythm without turning loading into decorative spectacle.",
    usage: [
      "Use skeletons when content structure is known but data is still loading.",
      "Match the number of lines to expected content density.",
      "Use soft tone inside already decorative cards to avoid over-animation.",
    ],
    states: [
      {
        name: "Default",
        description: "Standard placeholder with avatar and line rhythm.",
      },
      {
        name: "Soft",
        description: "Lower-contrast placeholder for dense or nested surfaces.",
      },
      {
        name: "Line count",
        description: "lines controls supporting placeholder rows.",
      },
      {
        name: "Decorative",
        description:
          "Hidden from assistive technology because it does not add content.",
      },
    ],
    props: [
      {
        name: "lines",
        type: "number",
        defaultValue: "3",
        description: "Number of supporting placeholder lines.",
      },
      {
        name: "tone",
        type: "'default' | 'soft'",
        defaultValue: "'default'",
        description: "Placeholder contrast level.",
      },
    ],
    accessibility: [
      "Skeleton markup is aria-hidden.",
      "Pair long loading regions with a separate status message when needed.",
      "Do not use skeleton as final empty content.",
    ],
  },
  Alert: {
    name: "Alert",
    category: "feedback",
    description:
      "Semantic feedback surface for explaining status, risk, success, and next action inside the public preset.",
    usage: [
      "Use alerts for state explanation plus a possible next step.",
      "Use warning and danger only when user attention or correction is required.",
      "Keep alert copy concise; move long remediation into linked details.",
    ],
    states: [
      {
        name: "Info",
        description: "Neutral operational update.",
      },
      {
        name: "Success",
        description: "Confirmed positive outcome.",
      },
      {
        name: "Warning",
        description: "Recoverable issue or guardrail requiring attention.",
      },
      {
        name: "Danger",
        description: "Error, destructive risk, or blocked state.",
      },
      {
        name: "Dismissible",
        description:
          "Optional close affordance for advisory alerts that can be safely removed without hiding required recovery instructions.",
      },
    ],
    props: [
      {
        name: "tone",
        type: "'danger' | 'info' | 'success' | 'warning'",
        defaultValue: "'info'",
        description: "Semantic alert tone.",
      },
      {
        name: "title",
        type: "string",
        defaultValue: "'System notice'",
        description: "Visible heading that summarizes the alert state.",
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Optional compact label rendered above the alert title.",
      },
      {
        name: "dismissible",
        type: "boolean",
        defaultValue: "false",
        description:
          "Shows a close control and emits dismiss when the alert can be safely removed.",
      },
      {
        name: "dismissLabel",
        type: "string",
        defaultValue: "'Dismiss alert'",
        description: "Accessible label for the dismiss control.",
      },
    ],
    accessibility: [
      "Danger and warning use role=alert.",
      "Info and success use role=status.",
      "Action slot should not be the only way to understand the alert.",
      "Dismissible alerts need a clear accessible dismiss label and should not hide required recovery steps.",
    ],
  },
  Divider: {
    name: "Divider",
    category: "content",
    description:
      "Section rhythm primitive for separating content lanes without adding another card or heading layer.",
    usage: [
      "Use dividers to mark rhythm changes inside a surface.",
      "Use labels sparingly; they should not compete with real section headings.",
      "Use accent only when the division itself carries product meaning.",
    ],
    states: [
      {
        name: "Plain",
        description: "Simple separator line for low-emphasis grouping.",
      },
      {
        name: "Labeled",
        description:
          "Inline label explains the break without adding a heading.",
      },
      {
        name: "Alignment",
        description:
          "start, center, and end align labels to fit editorial layout.",
      },
      {
        name: "Accent",
        description: "Higher-emphasis divider for review or hand-off moments.",
      },
    ],
    props: [
      {
        name: "align",
        type: "'center' | 'end' | 'start'",
        defaultValue: "'center'",
        description: "Label alignment when a label exists.",
      },
      {
        name: "label",
        type: "string",
        description: "Optional inline divider label.",
      },
      {
        name: "tone",
        type: "'accent' | 'default'",
        defaultValue: "'default'",
        description: "Visual emphasis level.",
      },
    ],
    accessibility: [
      "Uses role=separator.",
      "Decorative lines are hidden from assistive technology.",
      "Labels should be concise and not replace structural headings.",
    ],
  },
  Tabs: {
    name: "Tabs",
    category: "navigation",
    description:
      "Section switcher for compact public surfaces with roving focus, active panel linkage, and item descriptions.",
    usage: [
      "Use tabs to switch sections within one context, not to replace page navigation.",
      "Keep the number of tabs small enough to scan on mobile.",
      "Descriptions should clarify the section's job rather than become marketing copy.",
    ],
    states: [
      {
        name: "Active",
        description: "Active key controls the selected tab and visible panel.",
      },
      {
        name: "Keyboard",
        description: "Arrow keys, Home, and End move selection and focus.",
      },
      {
        name: "Descriptions",
        description:
          "Optional descriptions help distinguish adjacent workflow stages.",
      },
      {
        name: "Panel",
        description: "Default slot receives activeItem and activeKey.",
      },
      {
        name: "Empty",
        description:
          "A flat empty message replaces the tablist and panel when there are no sections, avoiding invalid tab semantics.",
      },
    ],
    props: [
      {
        name: "items",
        type: "ElyPublicTabItem[]",
        required: true,
        description: "Tab key, label, and optional description definitions.",
      },
      {
        name: "modelValue",
        type: "string",
        description: "Controlled active tab key.",
      },
      {
        name: "emptyMessage",
        type: "string",
        defaultValue: "'No sections to show yet.'",
        description:
          "Visible copy shown when items is empty; use it for absent local sections, not loading or route errors.",
      },
      {
        name: "ariaLabel",
        type: "string",
        defaultValue: "'Tabs'",
        description: "Accessible label for the tablist.",
      },
      {
        name: "idBase",
        type: "string",
        description: "Optional stable id prefix for tab and panel linkage.",
      },
    ],
    accessibility: [
      "Uses role=tablist, role=tab, and role=tabpanel.",
      "Tabs and panels are connected with aria-controls and aria-labelledby.",
      "Roving tabindex keeps keyboard focus predictable.",
      "When no tabs exist, the component avoids rendering an empty tablist or orphaned panel.",
    ],
  },
} satisfies Record<string, ElyPublicComponentBaseDoc>

const publicComponentGuidance = {
  Accordion: {
    decision: [
      "Use when the page needs optional detail without changing route, step, or primary action hierarchy.",
      "Use Tabs for peer sections, Dialog for focused interruption, and Text when the content must always remain visible.",
    ],
    composition: [
      "Pair with Text, Link, or Alert when a disclosed answer needs supporting copy or a recovery path.",
      "Place inside the current surface as a low-layer disclosure, not as a new card stack around every answer.",
    ],
    antiPatterns: [
      "Do not hide validation errors, pricing consequences, legal consent, or irreversible warnings inside Accordion.",
      "Do not use Accordion as a replacement for navigation, route hierarchy, or a long document table of contents.",
    ],
  },
  Button: {
    decision: [
      "Use when the user can commit, save, claim, publish, reserve, or continue from the current surface.",
      "Prefer one primary Button per local decision area; use secondary or ghost only when the alternate path is genuinely lower priority.",
    ],
    composition: [
      "Pair with Text or Alert when the consequence needs explanation before activation.",
      "In forms and event landings, place Button after evidence such as Progress, Stat, or validation copy.",
    ],
    antiPatterns: [
      "Do not use Button as a decorative badge, category label, or inline navigation link.",
      "Do not place several primary buttons in one card to create visual excitement.",
    ],
  },
  IconButton: {
    decision: [
      "Use when the action is local, repeated, or visually secondary enough that a text Button would overcrowd the lane.",
      "Use Button instead when the action is the main next step or needs visible wording to explain consequence.",
    ],
    composition: [
      "Pair with Toolbar, Card media controls, List rows, Tooltip, or Alert recovery lanes when the icon action has clear local context.",
      "Use pressed only when the icon itself represents an on/off state; pair state changes with nearby content when the consequence is not obvious.",
      "Keep a nearby title, label, or tooltip-style explanation available for uncommon icons; ariaLabel is required but not a substitute for unclear UX.",
    ],
    antiPatterns: [
      "Do not use Icon Button as global navigation, a command palette trigger, a hidden primary CTA, or a decorative sparkle control.",
      "Do not add pressed to ordinary actions such as copy, open, next, or delete; those are activations, not toggle state.",
      "Do not ship icon-only buttons with vague labels such as action, more, or click.",
    ],
  },
  Link: {
    decision: [
      "Use for support routes, policy references, archive exits, and secondary reading paths that should not compete with the primary action.",
      "Use external only when the destination leaves the product context.",
    ],
    composition: [
      "Pair with Alert, Empty State, or Card footer as a quiet recovery or reference path.",
      "In dense copy, keep underline behavior explicit so links remain discoverable across theme families.",
    ],
    antiPatterns: [
      "Do not use Link for irreversible or high-commitment actions.",
      "Do not hide vague labels such as read more behind decorative surrounding copy.",
    ],
  },
  Menu: {
    decision: [
      "Use when a local surface has several secondary actions and a single trigger keeps the main path calm.",
      "Use Button for the primary commitment, Link for visible navigation, and Tabs or Breadcrumb when the user needs orientation rather than overflow actions.",
    ],
    composition: [
      "Pair with Button, List, Alert, or DescriptionList when overflow actions need to stay attached to one current item or panel.",
      "Keep items single-level, short, and action-specific; separate meaning with descriptions and meta text rather than nested submenus.",
    ],
    antiPatterns: [
      "Do not use Menu as global navigation, route hierarchy, command palette, or a hidden replacement for the page primary action.",
      "Do not hide destructive, legal, pricing, or irreversible consequences behind vague labels without visible surrounding explanation.",
    ],
  },
  Toolbar: {
    decision: [
      "Use when a surface needs a visible action lane that groups a primary action, local settings, and support exits.",
      "Use it to reduce card nesting when controls are siblings rather than independent content sections.",
    ],
    composition: [
      "Pair with Button, Segmented Control, Menu, Badge, and Link to express action hierarchy in one flat row.",
      "Use leading slot for current context and trailing slot for quiet exits or secondary support.",
    ],
    antiPatterns: [
      "Do not use Toolbar as global navigation, application shell, table command bar, or full form layout.",
      "Do not place multiple equally strong primary actions in one toolbar; split the workflow or demote secondary actions.",
    ],
  },
  List: {
    decision: [
      "Use when a group of peer items needs one readable rhythm instead of many nested cards.",
      "Use Card when the whole group is a featured surface, Timeline when chronological order is the message, and Tabs when the user switches local sections.",
    ],
    composition: [
      "Pair with Badge, Text, Link, Alert, or a single Button row when the list needs status, support copy, or one recovery path.",
      "Place inside a parent Card or section only once; the rows themselves should use dividers and spacing rather than new card shells.",
    ],
    antiPatterns: [
      "Do not use List as a full route menu, data table, or unbounded activity feed with live updating behavior.",
      "Do not make disabled or current rows rely on color alone; labels must explain why the item is unavailable or selected.",
    ],
  },
  DescriptionList: {
    decision: [
      "Use when the content is a stable set of label-value facts and the relationship between label and value is the primary meaning.",
      "Use Stat when one number drives a decision, List when rows are peer entries, and Timeline when order over time is the story.",
    ],
    composition: [
      "Pair with Text, Badge, Alert, Divider, or a single support Link when a fact needs interpretation or recovery context.",
      "Place inside the current surface as one information block; do not wrap each label-value pair in its own card.",
    ],
    antiPatterns: [
      "Do not use DescriptionList for editable forms, sortable tables, timeline events, or action-heavy settings rows.",
      "Do not use long paragraph values that make the label-value relationship hard to scan.",
    ],
  },
  Table: {
    decision: [
      "Use when row and column comparison is the primary reading job, such as tiers, specifications, eligibility, or review snapshots.",
      "Use DescriptionList for one object's facts, List for peer rows, and the enterprise preset or a future data grid when users need sorting, filtering, selection, or row actions.",
    ],
    composition: [
      "Pair with Text, Badge, Alert, Divider, or a single support Link when the comparison needs interpretation or recovery context.",
      "Place one table inside the current section; do not wrap every row, column group, or status cell in extra cards.",
    ],
    antiPatterns: [
      "Do not use Table as an editable grid, CRUD workspace, spreadsheet, route menu, pricing wizard, or async data explorer.",
      "Do not rely on row tone alone for risk, success, or warning; the cell text must name the meaning.",
    ],
  },
  Breadcrumb: {
    decision: [
      "Use when route hierarchy helps orientation more than a single back link or local tabs.",
      "Use maxItems when a deep but stable path would otherwise dominate the page or wrap before the user reaches the heading.",
      "Use only for stable ancestry; if the path is a user filter or wizard step, use Chip, Tabs, or Progress instead.",
    ],
    composition: [
      "Place near the top of detail, editorial, event, and account pages before the local heading or hero evidence.",
      "Collapse only the middle of deep ancestry; keep the first parent and current page visible so users retain context.",
      "Pair with Link for support exits and Tabs for local sections, but keep Breadcrumb responsible for ancestry only.",
    ],
    antiPatterns: [
      "Do not use Breadcrumb as global navigation, category filters, or a progress stepper.",
      "Do not make the current page clickable or style every ancestor as a primary action.",
    ],
  },
  Pagination: {
    decision: [
      "Use when the user moves through a bounded list, archive, search result, or review history page by page.",
      "Use pageLabel, currentPageLabel, and ellipsisLabel when the surrounding product language is localized or domain-specific.",
      "Use Progress instead when the number describes completion, and Tabs when the user switches local sections.",
    ],
    composition: [
      "Pair with Text or Stat to state the result range, and place near the collection it controls.",
      "Use after cards, editorial lists, or history rows without wrapping the control in another decorative card.",
    ],
    antiPatterns: [
      "Do not use Pagination as a wizard stepper, progress meter, or category filter.",
      "Do not show huge uncollapsed page ranges that force horizontal scrolling on mobile.",
    ],
  },
  Stepper: {
    decision: [
      "Use when the user must understand where they are in a short ordered journey before choosing the next action.",
      "Use Pagination for bounded collection movement, Tabs for local sections, and Progress for completion amount.",
    ],
    composition: [
      "Pair with Alert when a step needs repair, and with Button for the single next action outside the stepper itself.",
      "Place above the affected form or review surface so the flow explains context without becoming another card layer.",
    ],
    antiPatterns: [
      "Do not use Stepper as global navigation, category filtering, or decorative progress ornament.",
      "Do not make blocked future steps clickable when the surrounding flow cannot safely restore that state.",
    ],
  },
  Timeline: {
    decision: [
      "Use when the user reads a sequence of past, scheduled, or editorial moments rather than operating a current workflow.",
      "Use Stepper when the sequence changes the current action, Progress when the value is completion, and Pagination when movement is page based.",
    ],
    composition: [
      "Pair with Text, Badge, Stat, Link, or a single action row when a history item needs context or a recovery path.",
      "Place Timeline directly in the affected section and use dividers or spacing instead of wrapping every event in its own card.",
    ],
    antiPatterns: [
      "Do not use Timeline as a route menu, clickable wizard, activity feed with unbounded live updates, or decorative vertical ornament.",
      "Do not rely on tone alone to communicate errors, deadlines, or completion; the title and description must name the meaning.",
    ],
  },
  Tooltip: {
    decision: [
      "Use when the user benefits from a one-sentence explanation but the surrounding surface should stay visually light.",
      "Use only for supplemental context; if the information changes the decision, keep it visible with Text or Alert.",
    ],
    composition: [
      "Pair with Input labels, Stat labels, Badge metadata, or Switch descriptions to clarify meaning without nesting a help card.",
      "Place next to the exact term it explains so the bubble reads as context, not another navigation path.",
    ],
    antiPatterns: [
      "Do not hide validation errors, legal consent, pricing, or irreversible consequences inside Tooltip.",
      "Do not use Tooltip for rich interactive content, menus, or long onboarding copy.",
    ],
  },
  Popover: {
    decision: [
      "Use when contextual help needs structure, a small preview, or one local support action but should not interrupt the flow.",
      "Use Tooltip for one-sentence hints, Menu for action lists, and Dialog when the user must confirm or complete a focused interruption.",
    ],
    composition: [
      "Pair with Text, Badge, Stat, Link, Button, or Alert when a local concept needs proof, preview, and a safe support path.",
      "Keep Popover beside the trigger it explains and use actions sparingly so it does not become a hidden mini page.",
    ],
    antiPatterns: [
      "Do not use Popover as global navigation, a command menu, a form drawer, a modal confirmation, or a full help center.",
      "Do not hide required validation, pricing, legal consent, or destructive consequences inside a popover-only panel.",
    ],
  },
  Stat: {
    decision: [
      "Use when one compact metric helps the user judge readiness, scarcity, progress, or quality.",
      "Use accent for one lead metric only; companion stats should usually be primary or muted.",
    ],
    composition: [
      "Pair with Progress when the number describes completion or capacity.",
      "Group two to four Stats inside Card or hero support lanes, then explain the metric with helper text.",
    ],
    antiPatterns: [
      "Do not use Stat as a number poster without a label and interpretation.",
      "Do not replace tables or charts when the user needs comparison across many rows.",
    ],
  },
  Text: {
    decision: [
      "Use when copy needs the public preset reading rhythm without creating a new visual class.",
      "Use muted or subtle only for supporting explanation; primary copy should still carry the real decision.",
    ],
    composition: [
      "Pair with Button, Link, Alert, and Empty State to keep actions understandable without local text styles.",
      "Use semantic tags through the as prop before reaching for stronger visual treatment.",
    ],
    antiPatterns: [
      "Do not use tone changes as the only way to convey risk or state.",
      "Do not create one-off paragraph classes in Storybook or patterns when Text already covers the role.",
    ],
  },
  Kbd: {
    decision: [
      "Use when a keyboard hint makes an existing interaction easier to discover without creating a new action surface.",
      "Use only for visible shortcut guidance; the actual keyboard listener belongs to the component or page that owns the behavior.",
    ],
    composition: [
      "Pair with Text, Tooltip, Input helper copy, Tabs keyboard review, or support instructions near the affected control.",
      "Use muted tone for low-priority hints and primary or accent only when shortcut discovery is part of the current task.",
    ],
    antiPatterns: [
      "Do not use Kbd as a Badge, Chip, CTA, status label, command palette, or shortcut registration system.",
      "Do not show shortcuts that the surrounding component does not actually support.",
    ],
  },
  Avatar: {
    decision: [
      "Use when identity, authorship, or presence affects trust, collaboration, or selection.",
      "Use status only when availability changes what the user can do next.",
    ],
    composition: [
      "Pair with Text for creator names and helper copy, or Card for identity previews.",
      "Use Avatar in rows and profile headers; keep decorative icons separate from identity surfaces.",
    ],
    antiPatterns: [
      "Do not use Avatar as a generic icon container.",
      "Do not rely on presence color without a visible status or surrounding explanation.",
    ],
  },
  Image: {
    decision: [
      "Use when a stable media frame is part of the layout contract, not just decoration.",
      "Choose aspect by composition role: landscape for cards, portrait for profiles, square for compact identity or gallery items.",
    ],
    composition: [
      "Pair with Card, Text, and Badge when imagery introduces an editorial or event surface.",
      "Use fallback behavior intentionally so failed media still preserves rhythm and accessible context.",
    ],
    antiPatterns: [
      "Do not use raw img tags in public-luxe patterns when aspect, fallback, or skeleton behavior matters.",
      "Do not let imagery carry the only meaningful information.",
    ],
  },
  Input: {
    decision: [
      "Use when the user must enter or edit freeform text with a visible label and correction path.",
      "Use Textarea when the content is a note, comment, description, moderation reason, or other long-form copy.",
    ],
    composition: [
      "Pair with Select, Checkbox, Alert, and Progress in form flows that need validation and completion feedback.",
      "Use description for stable guidance and invalidMessage for actionable recovery.",
    ],
    antiPatterns: [
      "Do not ship placeholder-only fields.",
      "Do not use Input for option selection when Select, Checkbox, Radio Group, or Switch expresses the decision better.",
    ],
  },
  SearchInput: {
    decision: [
      "Use when a query should be submitted or cleared as a distinct user action.",
      "Use Input type=search only for very small forms where submit and clear behavior are owned elsewhere.",
    ],
    composition: [
      "Pair with List, Empty State, Alert, Pagination, or Toolbar when search changes a nearby content collection.",
      "Keep result count, empty result recovery, and filters outside the component so search remains a small primitive.",
    ],
    antiPatterns: [
      "Do not use Search Input as autocomplete, command palette, filter builder, global app search, or search result page.",
      "Do not rely on placeholder-only scope; users must see what collection or support area they are searching.",
    ],
  },
  Fieldset: {
    decision: [
      "Use when several controls answer one visible question or share one repair message.",
      "Use Card only when the group is a standalone content surface; use Fieldset when the group is part of one form lane.",
    ],
    composition: [
      "Pair with Checkbox, Radio Group, Input, Textarea, Select, FileInput, Alert, and Button to keep forms flat and reviewable.",
      "Use compact density for checklist-like consent groups and comfortable density for writing or preference sections.",
    ],
    antiPatterns: [
      "Do not use Fieldset as a generic layout card, dashboard panel, tab container, or nested surface decoration.",
      "Do not hide the group question in placeholder text or rely on tone alone to explain validation.",
    ],
  },
  Textarea: {
    decision: [
      "Use when the writing task needs multiple lines, optional length evidence, and a stable repair path.",
      "Use Input for short single-line values and a page-owned editor for rich text, markdown preview, mentions, or moderation workflows.",
    ],
    composition: [
      "Pair with Alert, Text, FileInput, Progress, or Button when writing quality affects review readiness or submission.",
      "Keep Textarea in a flat form lane with guidance and submit action instead of surrounding it with nested writing cards.",
    ],
    antiPatterns: [
      "Do not use Textarea as a rich text editor, markdown renderer, comment thread, moderation system, or AI writing assistant.",
      "Do not hide tone rules, privacy expectations, or content limits in placeholder text only.",
    ],
  },
  NumberInput: {
    decision: [
      "Use when the value must be exact enough to type, audit, submit, or repeat later.",
      "Use Slider for approximate preference tuning and Select or Radio Group when the numeric choices are really named options.",
    ],
    composition: [
      "Pair with Text, Alert, Progress, or Stat when the number changes readiness, capacity, or a visible preview.",
      "Place related numeric fields in one flat form lane with dividers or compact rows instead of wrapping each field in a separate card.",
    ],
    antiPatterns: [
      "Do not use NumberInput as a currency formatter, tax calculator, pricing engine, range picker, or color control.",
      "Do not silently clamp typed values without visible copy when the field affects legal, financial, or destructive commitments.",
    ],
  },
  DateInput: {
    decision: [
      "Use when the user needs one exact calendar day and native platform date entry is enough.",
      "Use a page-owned calendar, scheduler, range picker, or timezone flow when the task depends on availability, recurrence, or multiple dates.",
    ],
    composition: [
      "Pair with Alert, Text, Progress, Timeline, or Stepper when a date unlocks readiness, a deadline, or a visible recovery path.",
      "Place related dates in one flat form lane with compact copy and dividers instead of giving every date its own card.",
    ],
    antiPatterns: [
      "Do not use DateInput as a booking engine, timezone converter, recurrence editor, or availability picker.",
      "Do not hide legal, membership, or publishing limits inside min and max without visible explanation.",
    ],
  },
  FileInput: {
    decision: [
      "Use when choosing local files is part of a form and the component only needs to expose selected filenames.",
      "Use a page-owned uploader when the task needs drag sorting, preview editing, progress, retry, antivirus status, or cloud storage integration.",
    ],
    composition: [
      "Pair with Alert, Text, Progress, or Empty State when the attachment affects readiness, privacy, or recovery.",
      "Keep file evidence in the same flat form lane as its explanation and submit action instead of nesting upload cards.",
    ],
    antiPatterns: [
      "Do not use FileInput as an upload transport, media editor, document parser, virus scanner, or storage policy owner.",
      "Do not rely on accept alone for safety; visible copy and page-owned validation must still explain file limits.",
    ],
  },
  Card: {
    decision: [
      "Use when a surface needs one coherent content, action, or summary group.",
      "Use featured tone sparingly for the local focus surface; surrounding cards should stay quieter.",
    ],
    composition: [
      "Compose Card with Stat, Image, Text, Badge, Divider, and footer actions instead of nesting more cards.",
      "Keep one primary action in the footer and move secondary paths to ghost Button or Link.",
    ],
    antiPatterns: [
      "Do not solve hierarchy by stacking cards inside cards.",
      "Do not give every sibling card featured treatment.",
    ],
  },
  Badge: {
    decision: [
      "Use when a compact state, category, or eligibility marker helps scanning.",
      "Use danger only for real risk, invalidity, or destructive meaning.",
    ],
    composition: [
      "Pair with headings, Stats, Alerts, or Cards as supporting evidence.",
      "Keep badge copy short enough to survive mobile and dense summary rows.",
    ],
    antiPatterns: [
      "Do not use Badge as a button or navigation control.",
      "Do not rely on badge tone without explicit label text.",
    ],
  },
  Chip: {
    decision: [
      "Use when the user needs to see selected local context, filters, or traits as compact tokens.",
      "Use Chip instead of Badge when a token can be removed or represents active selection.",
    ],
    composition: [
      "Pair with Input, Select, or Radio Group to summarize active choices without adding another nested card.",
      "Use near the surface it filters or configures so removal feels local and reversible.",
    ],
    antiPatterns: [
      "Do not use Chip for status-only labels; use Badge when nothing can be selected or removed.",
      "Do not use Chip as a primary action, navigation tab, or replacement for Checkbox/Radio Group decisions.",
    ],
  },
  Toast: {
    decision: [
      "Use when feedback is transient and confirms the result of a nearby user action.",
      "Use Alert instead when the message must remain visible, contains repair steps, or blocks progress.",
    ],
    composition: [
      "Pair with Button or form flows after save/sync/copy actions to confirm what changed.",
      "Use one optional toast action for undo, view, or retry; move multi-step repair into Alert or Dialog.",
      "Stack at most a small number of toasts; if the list grows, move the history into a page-owned notification pattern.",
    ],
    antiPatterns: [
      "Do not hide validation errors, legal instructions, or required recovery paths inside Toast.",
      "Do not put multiple competing actions inside Toast; it should stay transient and local.",
      "Do not use Toast as a persistent notification center, modal replacement, or decorative status badge.",
    ],
  },
  Tabs: {
    decision: [
      "Use to switch peer sections inside one surface or workflow context.",
      "Use when sections are few, stable, and equal in hierarchy.",
    ],
    composition: [
      "Pair Tabs with Card or pattern sections where the panel content remains in the same owner.",
      "Use descriptions when adjacent tabs have similar labels but different consequences.",
    ],
    antiPatterns: [
      "Do not use Tabs for global route navigation.",
      "Do not hide critical form steps behind tabs when completion order matters.",
    ],
  },
  Dialog: {
    decision: [
      "Use when the current flow needs focused confirmation, review, or interruption without route navigation.",
      "Use danger copy and actions only when the user is confirming destructive or blocked behavior.",
    ],
    composition: [
      "Pair with Button trigger, Alert for risk, and Text for concise consequences.",
      "Keep footer actions ordered by safe primary path and visible cancellation.",
    ],
    antiPatterns: [
      "Do not use Dialog as a general page layout container.",
      "Do not hide long forms or complex multi-step workflows inside a modal.",
    ],
  },
  Progress: {
    decision: [
      "Use when progress has a bounded range and helps users understand readiness or completion.",
      "Use warning or accent only when the milestone needs guarded attention.",
    ],
    composition: [
      "Pair with Stat for explicit numbers and Alert for blocked or delayed progress.",
      "Place near the action it explains so completion supports the next decision.",
    ],
    antiPatterns: [
      "Do not use Progress for unbounded waiting; use Skeleton or status copy instead.",
      "Do not show decorative bars with no label or task context.",
    ],
  },
  Meter: {
    decision: [
      "Use when the bar describes a bounded condition such as quota, fit, quality, health, or capacity.",
      "Use Progress when work is moving toward completion, and use Stat when one number alone carries the decision.",
    ],
    composition: [
      "Pair with Stat, Badge, Text, Alert, or Table when the scalar needs interpretation, comparison, or repair context.",
      "Place Meter in the same information lane as the decision it informs instead of wrapping each measured value in another card.",
    ],
    antiPatterns: [
      "Do not use Meter for task progress, indefinite waiting, decorative energy bars, rankings, or unbounded live metrics.",
      "Do not rely on color alone for warning, danger, quality, or capacity; label, helper, or valueText must name the meaning.",
    ],
  },
  Spinner: {
    decision: [
      "Use when a local action, inline region, or compact surface is waiting and no meaningful percentage exists.",
      "Use Skeleton for loading known content structure and Progress for bounded completion rather than stretching Spinner into every wait state.",
    ],
    composition: [
      "Pair with Text, Button, Alert, or Empty State so short waiting, delayed waiting, and failure each have a visible next state.",
      "Use neutral tone inside dense forms and primary or accent tone near branded public actions.",
    ],
    antiPatterns: [
      "Do not use Spinner as a full-page blocking overlay, upload progress bar, skeleton replacement, or decorative ornament.",
      "Do not leave a spinner running after success, failure, empty result, or recovery copy is available.",
    ],
  },
  Select: {
    decision: [
      "Use when the user chooses one option from a short, stable list.",
      "Use placeholder only when no safe default exists.",
    ],
    composition: [
      "Pair with Input and Checkbox in forms where structured and freeform decisions coexist.",
      "Use description to explain the consequence of the selected option.",
    ],
    antiPatterns: [
      "Do not overload Select with search, async loading, or rich option cards.",
      "Do not use Select as navigation between pages.",
    ],
  },
  Slider: {
    decision: [
      "Use when a bounded numeric preference benefits from gradual tuning, such as ornament intensity, density, volume, or progress threshold.",
      "Use Select or Radio Group when the choices are named categories, and use Progress when the value is read-only completion rather than user input.",
    ],
    composition: [
      "Pair with Text, Stat, or Alert when the range changes a preview, cost, or accessibility-sensitive behavior.",
      "Place Slider inside the current form or preference lane; avoid wrapping the scale in another card or turning every range into a themed mini dashboard.",
    ],
    antiPatterns: [
      "Do not use Slider for prices, legal consent, destructive thresholds, color picking, or values where exact typed input is required.",
      "Do not hide min/max meaning or rely on the glowing track alone to explain what the selected value changes.",
    ],
  },
  Rating: {
    decision: [
      "Use when the user gives a compact ordered score, such as content quality, delight, satisfaction, or fit.",
      "Use Radio Group when each option has a distinct label, Slider when the value is continuous, and Text/Input when the user must explain why.",
    ],
    composition: [
      "Pair with Text, Alert, or Toast when the feedback needs expectation-setting, confirmation, or a repair path.",
      "Use readOnly beside Stat, Card, or List rows to display existing scores without implying the user can edit them.",
    ],
    antiPatterns: [
      "Do not use Rating as a progress meter, popularity chart, full review system, sentiment analytics, or gamified reward mechanic.",
      "Do not ask for a rating without naming what the scale measures or what happens after the user selects a value.",
    ],
  },
  Switch: {
    decision: [
      "Use for binary runtime settings that apply immediately.",
      "Use only when on and off are both understandable from the label and description.",
    ],
    composition: [
      "Pair with Text descriptions in settings or preference panels.",
      "Use alongside Radio Group only when runtime toggles and single-choice preferences are clearly separate.",
    ],
    antiPatterns: [
      "Do not use Switch for consent, inclusion, or delayed submission decisions; use Checkbox instead.",
      "Do not hide consequences behind a bare on/off label.",
    ],
  },
  EmptyState: {
    decision: [
      "Use when absence needs explanation and a recovery path.",
      "Use accent only for guided journeys where the empty moment is part of the main experience.",
    ],
    composition: [
      "Pair with Button for the single primary recovery and Link for support or archive paths.",
      "Use Alert nearby only when the absence is caused by an error or blocked state.",
    ],
    antiPatterns: [
      "Do not use Empty State as decorative filler.",
      "Do not offer multiple equally strong recovery actions.",
    ],
  },
  Checkbox: {
    decision: [
      "Use for independent inclusion, consent, or opt-in choices.",
      "Use checked disabled state for inherited or locked configuration that must remain visible.",
    ],
    composition: [
      "Pair with Input and Select in submission forms, especially where consent or optional reveal matters.",
      "Use description to clarify legal, notification, or personalization consequences.",
    ],
    antiPatterns: [
      "Do not use Checkbox for immediate runtime toggles; use Switch instead.",
      "Do not rely on checked state alone for legally meaningful consent copy.",
    ],
  },
  RadioGroup: {
    decision: [
      "Use when exactly one option in a small set must be selected.",
      "Use for density, style, or preference choices where consequences can be compared side by side.",
    ],
    composition: [
      "Pair with Card or Theme Atelier settings where a small choice set shapes the following preview.",
      "Use item descriptions to explain consequences, not repeat labels.",
    ],
    antiPatterns: [
      "Do not use Radio Group as tabs or navigation.",
      "Do not use it for long or dynamic option lists; use Select or a future dedicated picker.",
    ],
  },
  SegmentedControl: {
    decision: [
      "Use for compact view, density, tone, or mode choices that affect the current surface.",
      "Use when labels are short and the user benefits from seeing every option at once.",
    ],
    composition: [
      "Pair with preview lanes, toolbars, or settings rows where the selected value changes nearby content.",
      "Keep supporting explanation outside the control so the segment itself stays concise and scannable.",
    ],
    antiPatterns: [
      "Do not use Segmented Control to switch full content panels; use Tabs for local sections.",
      "Do not use it for long option sets, destructive choices, route navigation, or submit confirmation.",
    ],
  },
  Skeleton: {
    decision: [
      "Use while known content structure is loading and layout stability matters.",
      "Use soft tone inside already ornate or dense surfaces.",
    ],
    composition: [
      "Pair with a separate status message for long waits or blocked loading.",
      "Replace with content, Alert, or Empty State once the data outcome is known.",
    ],
    antiPatterns: [
      "Do not use Skeleton as final empty content.",
      "Do not animate loading placeholders so strongly that they become the focal point.",
    ],
  },
  Alert: {
    decision: [
      "Use when status, risk, success, or correction needs a visible explanation.",
      "Use warning and danger only when user attention or recovery is required.",
    ],
    composition: [
      "Pair with Button or Link only when there is a clear remediation path.",
      "Use dismissible only for advisory or already-resolved feedback; required repair alerts should remain visible until the surrounding state changes.",
      "Use near the affected surface so feedback does not feel detached from the action.",
    ],
    antiPatterns: [
      "Do not use Alert as a decorative color band.",
      "Do not hide the actual recovery step in long alert copy.",
    ],
  },
  Divider: {
    decision: [
      "Use when content needs a rhythm break without adding another surface or heading.",
      "Use labels only when the break itself clarifies review, archive, or handoff context.",
    ],
    composition: [
      "Pair with Text, Stat groups, or Card internals to separate local sections.",
      "Use accent only for meaningful transition points, not visual variety.",
    ],
    antiPatterns: [
      "Do not replace structural headings with labeled dividers.",
      "Do not add dividers between every small element just to create density.",
    ],
  },
} satisfies Record<
  keyof typeof publicComponentBaseDocs,
  Pick<ElyPublicComponentDoc, "antiPatterns" | "composition" | "decision">
>

export const publicComponentDocs = {
  Accordion: {
    ...publicComponentBaseDocs.Accordion,
    ...publicComponentGuidance.Accordion,
  },
  Button: {
    ...publicComponentBaseDocs.Button,
    ...publicComponentGuidance.Button,
  },
  IconButton: {
    ...publicComponentBaseDocs.IconButton,
    ...publicComponentGuidance.IconButton,
  },
  Link: {
    ...publicComponentBaseDocs.Link,
    ...publicComponentGuidance.Link,
  },
  Menu: {
    ...publicComponentBaseDocs.Menu,
    ...publicComponentGuidance.Menu,
  },
  Toolbar: {
    ...publicComponentBaseDocs.Toolbar,
    ...publicComponentGuidance.Toolbar,
  },
  List: {
    ...publicComponentBaseDocs.List,
    ...publicComponentGuidance.List,
  },
  DescriptionList: {
    ...publicComponentBaseDocs.DescriptionList,
    ...publicComponentGuidance.DescriptionList,
  },
  Table: {
    ...publicComponentBaseDocs.Table,
    ...publicComponentGuidance.Table,
  },
  Breadcrumb: {
    ...publicComponentBaseDocs.Breadcrumb,
    ...publicComponentGuidance.Breadcrumb,
  },
  Pagination: {
    ...publicComponentBaseDocs.Pagination,
    ...publicComponentGuidance.Pagination,
  },
  Stepper: {
    ...publicComponentBaseDocs.Stepper,
    ...publicComponentGuidance.Stepper,
  },
  Timeline: {
    ...publicComponentBaseDocs.Timeline,
    ...publicComponentGuidance.Timeline,
  },
  Tooltip: {
    ...publicComponentBaseDocs.Tooltip,
    ...publicComponentGuidance.Tooltip,
  },
  Popover: {
    ...publicComponentBaseDocs.Popover,
    ...publicComponentGuidance.Popover,
  },
  Stat: {
    ...publicComponentBaseDocs.Stat,
    ...publicComponentGuidance.Stat,
  },
  Text: {
    ...publicComponentBaseDocs.Text,
    ...publicComponentGuidance.Text,
  },
  Kbd: {
    ...publicComponentBaseDocs.Kbd,
    ...publicComponentGuidance.Kbd,
  },
  Avatar: {
    ...publicComponentBaseDocs.Avatar,
    ...publicComponentGuidance.Avatar,
  },
  Image: {
    ...publicComponentBaseDocs.Image,
    ...publicComponentGuidance.Image,
  },
  Input: {
    ...publicComponentBaseDocs.Input,
    ...publicComponentGuidance.Input,
  },
  SearchInput: {
    ...publicComponentBaseDocs.SearchInput,
    ...publicComponentGuidance.SearchInput,
  },
  Fieldset: {
    ...publicComponentBaseDocs.Fieldset,
    ...publicComponentGuidance.Fieldset,
  },
  Textarea: {
    ...publicComponentBaseDocs.Textarea,
    ...publicComponentGuidance.Textarea,
  },
  NumberInput: {
    ...publicComponentBaseDocs.NumberInput,
    ...publicComponentGuidance.NumberInput,
  },
  DateInput: {
    ...publicComponentBaseDocs.DateInput,
    ...publicComponentGuidance.DateInput,
  },
  FileInput: {
    ...publicComponentBaseDocs.FileInput,
    ...publicComponentGuidance.FileInput,
  },
  Card: {
    ...publicComponentBaseDocs.Card,
    ...publicComponentGuidance.Card,
  },
  Badge: {
    ...publicComponentBaseDocs.Badge,
    ...publicComponentGuidance.Badge,
  },
  Chip: {
    ...publicComponentBaseDocs.Chip,
    ...publicComponentGuidance.Chip,
  },
  Toast: {
    ...publicComponentBaseDocs.Toast,
    ...publicComponentGuidance.Toast,
  },
  Tabs: {
    ...publicComponentBaseDocs.Tabs,
    ...publicComponentGuidance.Tabs,
  },
  Dialog: {
    ...publicComponentBaseDocs.Dialog,
    ...publicComponentGuidance.Dialog,
  },
  Progress: {
    ...publicComponentBaseDocs.Progress,
    ...publicComponentGuidance.Progress,
  },
  Meter: {
    ...publicComponentBaseDocs.Meter,
    ...publicComponentGuidance.Meter,
  },
  Spinner: {
    ...publicComponentBaseDocs.Spinner,
    ...publicComponentGuidance.Spinner,
  },
  Select: {
    ...publicComponentBaseDocs.Select,
    ...publicComponentGuidance.Select,
  },
  Slider: {
    ...publicComponentBaseDocs.Slider,
    ...publicComponentGuidance.Slider,
  },
  Rating: {
    ...publicComponentBaseDocs.Rating,
    ...publicComponentGuidance.Rating,
  },
  Switch: {
    ...publicComponentBaseDocs.Switch,
    ...publicComponentGuidance.Switch,
  },
  EmptyState: {
    ...publicComponentBaseDocs.EmptyState,
    ...publicComponentGuidance.EmptyState,
  },
  Checkbox: {
    ...publicComponentBaseDocs.Checkbox,
    ...publicComponentGuidance.Checkbox,
  },
  RadioGroup: {
    ...publicComponentBaseDocs.RadioGroup,
    ...publicComponentGuidance.RadioGroup,
  },
  SegmentedControl: {
    ...publicComponentBaseDocs.SegmentedControl,
    ...publicComponentGuidance.SegmentedControl,
  },
  Skeleton: {
    ...publicComponentBaseDocs.Skeleton,
    ...publicComponentGuidance.Skeleton,
  },
  Alert: {
    ...publicComponentBaseDocs.Alert,
    ...publicComponentGuidance.Alert,
  },
  Divider: {
    ...publicComponentBaseDocs.Divider,
    ...publicComponentGuidance.Divider,
  },
} satisfies Record<string, ElyPublicComponentDoc>

export type ElyPublicDocumentedComponent = keyof typeof publicComponentDocs
