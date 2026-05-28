import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicLink,
  ElyPublicTabs,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const navigationRules = [
  {
    body: "Global navigation identifies the current story family. It should be calm, persistent, and lower than the page's primary decision.",
    label: "Global stays steady",
  },
  {
    body: "Section navigation moves within the current surface. Use tabs for peer sections, not for unrelated destinations.",
    label: "Sections are peers",
  },
  {
    body: "Breadcrumbs and support links explain where the user came from and how to recover context without stealing the primary action.",
    label: "Return paths are quiet",
  },
  {
    body: "Status markers can orient the user, but they must not become clickable decorations or a second menu.",
    label: "Markers are evidence",
  },
] as const

const navLanes = [
  {
    badge: "current",
    body: "Highest-level orientation across Foundations, Components, Patterns, and Showcase.",
    label: "System lane",
  },
  {
    badge: "peer",
    body: "Tabs or segmented anchors for sections inside one story or one product surface.",
    label: "Section lane",
  },
  {
    badge: "support",
    body: "Breadcrumbs, policy links, changelog links, and quieter routes back to context.",
    label: "Context lane",
  },
] as const

const routeStack = [
  "Public Luxe",
  "Foundations",
  "Navigation & Wayfinding",
] as const

const reviewChecklist = [
  "Can the user name their current lane without reading the whole page?",
  "Do tabs switch peer sections instead of navigating to unrelated stories?",
  "Does the primary CTA remain visually stronger than navigation?",
  "Are breadcrumbs and support links quiet but discoverable?",
  "Does mobile stacking preserve the same route, section, and action order?",
] as const

const meta = {
  title: "Public Luxe/Foundations/Navigation & Wayfinding",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicLink,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeSection = ref("overview")

      return {
        activeSection,
        navLanes,
        navigationRules,
        reviewChecklist,
        routeStack,
        sectionTabs: [
          {
            key: "overview",
            label: "Overview",
          },
          {
            key: "rules",
            label: "Rules",
          },
          {
            key: "review",
            label: "Review",
          },
        ],
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-nav-principle">
            <p class="ely-public-eyebrow">Navigation & wayfinding</p>
            <h1 class="ely-public-section-title">Elegant navigation is orientation before ornament</h1>
            <p class="ely-public-copy">
              Public-luxe navigation should feel like a polished atelier map:
              the user always knows the current lane, the local section, the
              route back, and the one action that matters next.
            </p>

            <div class="ely-story-nav-rule-grid" aria-label="Navigation rules">
              <article
                v-for="rule in navigationRules"
                :key="rule.label"
                class="ely-story-nav-rule-card"
              >
                <strong>{{ rule.label }}</strong>
                <p>{{ rule.body }}</p>
              </article>
            </div>
          </section>

          <section class="ely-story-nav-layout">
            <article class="ely-story-nav-map">
              <div class="ely-story-nav-breadcrumb" aria-label="Current route">
                <span
                  v-for="(route, index) in routeStack"
                  :key="route"
                >
                  {{ route }}
                  <small v-if="index < routeStack.length - 1">/</small>
                </span>
              </div>

              <div class="ely-story-nav-map-head">
                <div>
                  <p class="ely-public-eyebrow">Review map</p>
                  <h2>One route, one section switcher, one next step</h2>
                </div>
                <ElyPublicBadge tone="primary">Current lane</ElyPublicBadge>
              </div>

              <ElyPublicTabs v-model="activeSection" :items="sectionTabs" aria-label="Navigation specimen sections">
                <template v-slot:default="{ activeKey }">
                  <div class="ely-story-nav-panel">
                    <ElyPublicText v-if="activeKey === 'overview'" tone="muted">
                      The tab group stays inside this surface. It does not
                      pretend to replace the global Storybook sidebar or the
                      user's route memory.
                    </ElyPublicText>
                    <div v-if="activeKey === 'overview'" class="ely-public-actions">
                      <ElyPublicButton>Open current section</ElyPublicButton>
                      <ElyPublicButton tone="ghost">Copy review link</ElyPublicButton>
                    </div>
                    <ElyPublicAlert
                      v-if="activeKey === 'rules'"
                      eyebrow="Section rule"
                      title="Tabs are for peer sections only"
                      tone="info"
                    >
                      If the destination changes owner, route, or workflow,
                      use a link instead of hiding it in a tab.
                    </ElyPublicAlert>
                    <ElyPublicText v-if="activeKey === 'review'" tone="muted">
                      Review navigation by asking whether route, section,
                      status, and recovery path survive on mobile.
                    </ElyPublicText>
                  </div>
                </template>
              </ElyPublicTabs>

              <ElyPublicDivider label="Support paths" align="start" />
              <ElyPublicText tone="muted">
                Return to
                <ElyPublicLink href="#">Theme Composition</ElyPublicLink>,
                compare with
                <ElyPublicLink href="#" tone="muted">Action Hierarchy</ElyPublicLink>,
                or open the
                <ElyPublicLink href="#" tone="muted">review checklist</ElyPublicLink>.
              </ElyPublicText>
            </article>

            <aside class="ely-story-nav-hierarchy-panel" aria-label="Navigation hierarchy">
              <p class="ely-public-eyebrow">Hierarchy</p>
              <h2>Navigation should not compete with the page's decision</h2>
              <ElyPublicText tone="muted">
                The map is helpful only when it stays quieter than the current action.
              </ElyPublicText>
              <div class="ely-story-nav-lane-list">
                <div
                  v-for="lane in navLanes"
                  :key="lane.label"
                  class="ely-story-nav-lane"
                >
                  <div class="ely-story-nav-lane-head">
                    <strong>{{ lane.label }}</strong>
                    <ElyPublicBadge tone="accent">{{ lane.badge }}</ElyPublicBadge>
                  </div>
                  <ElyPublicText tone="muted">{{ lane.body }}</ElyPublicText>
                </div>
              </div>
            </aside>
          </section>

          <section class="ely-story-nav-layout">
            <article class="ely-story-nav-risk-panel">
              <p class="ely-public-eyebrow">Do not</p>
              <h2>Avoid turning navigation into decorative chrome</h2>
              <ElyPublicAlert
                eyebrow="Wayfinding risk"
                title="Too many active-looking links create route noise"
                tone="warning"
              >
                If breadcrumbs, tabs, badges, and inline links all look equally
                active, the user has to infer which one moves the flow forward.
              </ElyPublicAlert>
            </article>

            <article class="ely-story-nav-check-panel">
              <p class="ely-public-eyebrow">Review checklist</p>
              <h2>Approve navigation by orientation quality</h2>
              <div class="ely-story-nav-checklist ely-story-offset-md">
                <div
                  v-for="item in reviewChecklist"
                  :key="item"
                  class="ely-story-nav-check"
                >
                  <span aria-hidden="true"></span>
                  <ElyPublicText weight="semibold">{{ item }}</ElyPublicText>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    `,
  }),
}
