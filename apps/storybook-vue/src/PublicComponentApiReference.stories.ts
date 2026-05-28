import {
  ElyPublicBadge,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicStat,
  ElyPublicText,
  publicComponentDocs,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicComponentCategory,
  ElyPublicComponentDoc,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"

import { createStoryPath, publicShowcaseEntries } from "./public-luxe-showcase"

const categoryLabels: Record<ElyPublicComponentCategory, string> = {
  actions: "Actions",
  content: "Content",
  feedback: "Feedback",
  form: "Form",
  navigation: "Navigation",
}

const categoryOrder: ElyPublicComponentCategory[] = [
  "actions",
  "form",
  "feedback",
  "navigation",
  "content",
]

const componentEntries = Object.entries(publicComponentDocs).map(
  ([key, component]) => ({
    component,
    key,
  }),
)

const totalProps = componentEntries.reduce(
  (total, entry) => total + entry.component.props.length,
  0,
)
const totalRequiredProps = componentEntries.reduce(
  (total, entry) =>
    total +
    entry.component.props.filter((prop) => "required" in prop && prop.required)
      .length,
  0,
)
const totalStates = componentEntries.reduce(
  (total, entry) => total + entry.component.states.length,
  0,
)
const totalAccessibilityNotes = componentEntries.reduce(
  (total, entry) => total + entry.component.accessibility.length,
  0,
)
const totalAntiPatterns = componentEntries.reduce(
  (total, entry) => total + entry.component.antiPatterns.length,
  0,
)

const componentDocsRoute = (component: ElyPublicComponentDoc) =>
  `/docs/public-luxe-components-${component.name
    .replace(/\s+/g, "-")
    .toLowerCase()}--docs`

const categoryGroups = categoryOrder
  .map((category) => ({
    category,
    components: componentEntries.filter(
      (entry) => entry.component.category === category,
    ),
    label: categoryLabels[category],
    propCount: componentEntries
      .filter((entry) => entry.component.category === category)
      .reduce((total, entry) => total + entry.component.props.length, 0),
  }))
  .filter((group) => group.components.length > 0)

const referenceRouteKeys = [
  "component-index",
  "component-acceptance-board",
  "component-api-reference",
  "component-composition-matrix",
  "component-variant-matrix",
  "component-state-matrix",
  "component-scenario-atlas",
  "component-operability-board",
] as const

const referenceRoutes = referenceRouteKeys
  .map((key) => publicShowcaseEntries.find((entry) => entry.key === key))
  .filter((entry): entry is (typeof publicShowcaseEntries)[number] =>
    Boolean(entry),
  )

const meta = {
  title: "Public Luxe/Components/API Reference",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Coverage: Story = {
  render: () => ({
    components: {
      ElyPublicBadge,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicStat,
      ElyPublicText,
    },
    setup() {
      return {
        categoryGroups,
        componentDocsRoute,
        componentEntries,
        createStoryPath,
        referenceRoutes,
        totalAccessibilityNotes: String(totalAccessibilityNotes),
        totalAntiPatterns: String(totalAntiPatterns),
        totalComponents: String(componentEntries.length),
        totalProps: String(totalProps),
        totalRequiredProps: String(totalRequiredProps),
        totalStates: String(totalStates),
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-api-reference-hero-panel">
            <p class="ely-public-eyebrow">Component API reference</p>
            <h1 class="ely-public-section-title">A fast contract table for every public primitive</h1>
            <p class="ely-public-copy">
              This story turns the owner docs exported by ui-public-vue into a
              reviewable API surface. It helps reviewers check props, states,
              accessibility notes, decisions, and anti-patterns without opening
              twenty separate component docs first.
            </p>

            <div class="ely-story-api-reference-stats" aria-label="Component API reference coverage">
              <ElyPublicStat
                :value="totalComponents"
                eyebrow="Components"
                helper="Every documented public primitive appears in this table."
                tone="primary"
              >
                contract rows
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalProps"
                eyebrow="Props"
                helper="Prop names, types, defaults, and descriptions stay owner-sourced."
                tone="accent"
              >
                prop entries
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalStates"
                eyebrow="States"
                helper="State notes are visible before scenario review."
                tone="success"
              >
                state notes
              </ElyPublicStat>
              <ElyPublicStat
                :value="totalAccessibilityNotes"
                eyebrow="A11y"
                helper="Accessibility notes remain first-class review evidence."
                tone="primary"
              >
                access notes
              </ElyPublicStat>
            </div>
          </section>

          <section class="ely-story-api-reference-layout">
            <article class="ely-story-api-reference-route-panel">
              <p class="ely-public-eyebrow">Review route</p>
              <h2 class="ely-public-section-title">Use API reference before approving new variants</h2>
              <div class="ely-story-api-reference-route ely-story-offset-md">
                <a
                  v-for="(entry, index) in referenceRoutes"
                  :key="entry.key"
                  class="ely-story-api-reference-route-step"
                  :href="createStoryPath(entry.storyId)"
                  target="_top"
                  rel="noreferrer"
                >
                  <span>0{{ index + 1 }}</span>
                  <strong>{{ entry.title }}</strong>
                  <p>{{ entry.description }}</p>
                </a>
              </div>
            </article>

            <article class="ely-story-api-reference-summary-panel">
              <p class="ely-public-eyebrow">Contract summary</p>
              <h2 class="ely-public-section-title">The table is detailed, but it is not a second owner</h2>
              <div class="ely-story-api-reference-summary ely-story-offset-md">
                <ElyPublicBadge tone="primary">{{ totalRequiredProps }} required props</ElyPublicBadge>
                <ElyPublicBadge tone="warning">{{ totalAntiPatterns }} anti-patterns</ElyPublicBadge>
              </div>
              <ElyPublicText>
                Any prop, state, or accessibility wording that feels wrong
                should be fixed in ui-public-vue owner docs, then reflected here.
              </ElyPublicText>
              <ElyPublicDivider label="Boundary" align="start" />
              <ElyPublicText tone="muted">
                Storybook may sort and present docs. It must not invent props,
                states, interaction contracts, or production form semantics.
              </ElyPublicText>
            </article>
          </section>

          <section class="ely-story-api-reference-groups-panel">
            <div class="ely-story-section-head">
              <div>
                <p class="ely-public-eyebrow">API groups</p>
                <h2 class="ely-public-section-title">Scan by component family before opening a single docs page</h2>
              </div>
              <p>
                Categories keep the reference usable: action, form, feedback,
                navigation, and content primitives should not blur into one
                decorative bucket.
              </p>
            </div>

            <div class="ely-story-api-reference-group-list">
              <article
                v-for="group in categoryGroups"
                :key="group.category"
                class="ely-story-api-reference-group"
              >
                <div class="ely-story-api-reference-group-head">
                  <div>
                    <span>{{ group.category }}</span>
                    <h3>{{ group.label }}</h3>
                  </div>
                  <ElyPublicBadge tone="accent">
                    {{ group.components.length }} components · {{ group.propCount }} props
                  </ElyPublicBadge>
                </div>

                <div class="ely-story-api-reference-card-list">
                  <article
                    v-for="entry in group.components"
                    :key="entry.key"
                    class="ely-story-api-reference-card"
                  >
                    <div class="ely-story-api-reference-card-head">
                      <div>
                        <span>{{ entry.component.category }}</span>
                        <h4>{{ entry.component.name }}</h4>
                      </div>
                      <ElyPublicLink :href="componentDocsRoute(entry.component)">
                        Open docs
                      </ElyPublicLink>
                    </div>
                    <ElyPublicText tone="muted">{{ entry.component.description }}</ElyPublicText>

                    <div class="ely-story-api-reference-section">
                      <strong>Props</strong>
                      <div class="ely-story-api-reference-prop-table" role="table">
                        <div
                          v-for="prop in entry.component.props"
                          :key="entry.key + prop.name"
                          class="ely-story-api-reference-prop-row"
                          role="row"
                        >
                          <span role="cell">
                            {{ prop.name }}
                            <em v-if="prop.required">required</em>
                          </span>
                          <code role="cell">{{ prop.type }}</code>
                          <small role="cell">{{ prop.defaultValue ?? 'no default' }}</small>
                          <p role="cell">{{ prop.description }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="ely-story-api-reference-split">
                      <div class="ely-story-api-reference-section">
                        <strong>States</strong>
                        <ul>
                          <li
                            v-for="state in entry.component.states"
                            :key="entry.key + state.name"
                          >
                            <span>{{ state.name }}</span>
                            <p>{{ state.description }}</p>
                          </li>
                        </ul>
                      </div>
                      <div class="ely-story-api-reference-section">
                        <strong>Review guidance</strong>
                        <dl>
                          <div>
                            <dt>Choose when</dt>
                            <dd>{{ entry.component.decision[0] }}</dd>
                          </div>
                          <div>
                            <dt>Avoid</dt>
                            <dd>{{ entry.component.antiPatterns[0] }}</dd>
                          </div>
                          <div>
                            <dt>A11y</dt>
                            <dd>{{ entry.component.accessibility[0] }}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </article>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
