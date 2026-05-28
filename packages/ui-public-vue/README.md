# @elysian/ui-public-vue

`@elysian/ui-public-vue` owns the `public-luxe` public-facing Vue preset for Elysian.

It is intentionally separate from the enterprise TDesign preset. The package owns theme tokens, runtime attributes, public components, and component documentation metadata. Storybook consumes this package for review, but Storybook is not the source of truth.

## Scope

- Theme runtime: `data-preset`, `data-theme`, `data-mode`, `data-resolved-mode`.
- Theme families: `elysia-default`, `rose-nocturne`, `azure-aria`, `enterprise-calm`.
- Components: `Button`, `Link`, `Stat`, `Text`, `Avatar`, `Image`, `Input`, `Card`, `Badge`, `Tabs`, `Dialog`, `Progress`, `Select`, `Switch`, `Empty State`, `Checkbox`, `Radio Group`, `Skeleton`, `Alert`, `Divider`.
- Component documentation metadata: usage, decision guidance, composition guidance, anti-patterns, props, states, and accessibility notes exported as `publicComponentDocs`.

## Usage

```ts
import {
  ElyPublicButton,
  PUBLIC_PRESET_KEY,
  applyPublicThemeSelection,
} from "@elysian/ui-public-vue"

applyPublicThemeSelection(document.documentElement, {
  preset: PUBLIC_PRESET_KEY,
  theme: "elysia-default",
  mode: "system",
})
```

```vue
<template>
  <ElyPublicButton>Open atelier</ElyPublicButton>
</template>
```

## Documentation Contract

Every public component should have:

- A documented purpose and recommended usage.
- Decision guidance for when the primitive should be chosen.
- Composition guidance for pairing it with neighboring primitives.
- Anti-patterns that explain what not to use it for.
- A props table source in `publicComponentDocs`.
- A state matrix with at least four meaningful states.
- Accessibility notes that explain semantics and keyboard expectations.
- Storybook stories with `Playground`, `Anatomy`, and `States`.

This is enforced by tests in:

- `packages/ui-public-vue/src/components/docs.test.ts`
- `packages/ui-public-vue/src/components/markdown.test.ts`
- `apps/storybook-vue/src/story-docs.test.ts`

## Component Markdown

Component markdown pages live in `packages/ui-public-vue/docs/components`.
Start from the generated index:

- [Component index](./docs/components/README.md)

Regenerate them with:

```bash
bun run ui-public:docs:generate
```

The generated files are checked against `publicComponentDocs`, so manual edits should go through the metadata source first.

## Design Guardrails

- Keep the style luminous, refined, and public-facing without copying game assets.
- Keep radii restrained; do not drift into oversized pill-heavy UI.
- Use semantic token slots instead of one-off story colors.
- Do not move token truth or component API documentation into Storybook.
