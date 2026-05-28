import type { ElyPublicComponentCategory, ElyPublicComponentDoc } from "./docs"

export type PublicComponentMarkdownRegistry = Record<
  string,
  ElyPublicComponentDoc
>

const categoryOrder: ElyPublicComponentCategory[] = [
  "actions",
  "form",
  "navigation",
  "feedback",
  "content",
]

const categoryLabels: Record<ElyPublicComponentCategory, string> = {
  actions: "Actions",
  content: "Content",
  feedback: "Feedback",
  form: "Form",
  navigation: "Navigation",
}

const formatDefaultValue = (defaultValue?: string) => defaultValue ?? "-"

const formatRequired = (required?: boolean) => (required ? "Yes" : "No")

const escapeTableCell = (value: string) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ")

export const renderPublicComponentMarkdown = (
  doc: ElyPublicComponentDoc,
): string => {
  const usage = doc.usage.map((item) => `- ${item}`).join("\n")
  const decision = doc.decision.map((item) => `- ${item}`).join("\n")
  const composition = doc.composition.map((item) => `- ${item}`).join("\n")
  const antiPatterns = doc.antiPatterns.map((item) => `- ${item}`).join("\n")
  const states = doc.states
    .map((state) => `| ${state.name} | ${escapeTableCell(state.description)} |`)
    .join("\n")
  const props = doc.props
    .map(
      (prop) =>
        `| \`${prop.name}\` | \`${escapeTableCell(prop.type)}\` | ${formatDefaultValue(prop.defaultValue)} | ${formatRequired(prop.required)} | ${escapeTableCell(prop.description)} |`,
    )
    .join("\n")
  const accessibility = doc.accessibility.map((item) => `- ${item}`).join("\n")

  return `# ${doc.name}

${doc.description}

## Category

\`${doc.category}\`

## Usage

${usage}

## Decision Guidance

${decision}

## Composition

${composition}

## Anti-patterns

${antiPatterns}

## States

| State | Description |
| --- | --- |
${states}

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
${props}

## Accessibility

${accessibility}

## Storybook Contract

- Must consume \`publicComponentDocs.${doc.name.replaceAll(" ", "")}\` or the canonical documented component key.
- Must expose \`Playground\`, \`Anatomy\`, and \`States\` stories.
- Must show a state matrix, props table, and accessibility notes.
`
}

export const renderPublicComponentDocsIndex = (
  registry: PublicComponentMarkdownRegistry,
): string => {
  const entries = Object.entries(registry)
  const sections = categoryOrder
    .map((category) => {
      const components = entries
        .filter(([, doc]) => doc.category === category)
        .map(
          ([componentName, doc]) =>
            `| [${doc.name}](./${componentName}.md) | ${escapeTableCell(doc.description)} | ${doc.props.length} | ${doc.states.length} | ${doc.decision.length} | ${doc.antiPatterns.length} |`,
        )

      if (components.length === 0) {
        return null
      }

      return `## ${categoryLabels[category]}

| Component | Purpose | Props | States | Decisions | Anti-patterns |
| --- | --- | --- | --- | --- | --- |
${components.join("\n")}`
    })
    .filter(Boolean)
    .join("\n\n")

  return `# Public Luxe Components

This index is generated from \`publicComponentDocs\`. Update component metadata first, then run:

\`\`\`bash
bun run ui-public:docs:generate
\`\`\`

${sections}
`
}
