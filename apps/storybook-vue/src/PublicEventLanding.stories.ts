import {
  ElyPublicAlert,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDivider,
  ElyPublicEmptyState,
  ElyPublicImage,
  ElyPublicLink,
  ElyPublicProgress,
  ElyPublicStat,
  ElyPublicTabs,
  ElyPublicText,
} from "@elysian/ui-public-vue"
import type { ElyPublicTabsItem } from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { computed, ref } from "vue"

import { usePublicThemeArtwork } from "./publicThemeArtwork"

const eventTabs: ElyPublicTabsItem[] = [
  {
    key: "overview",
    label: "Overview",
    description: "The event promise, seat state, and primary registration path",
  },
  {
    key: "agenda",
    label: "Agenda",
    description: "A compact schedule that keeps attention on the current act",
  },
  {
    key: "access",
    label: "Access",
    description: "Ticket, replay, and support routes without extra CTA noise",
  },
]

const agendaItems = [
  {
    description:
      "A brief opening note that explains what changes after the release.",
    eyebrow: "Act 01",
    title: "Moonrise keynote",
    time: "19:30",
  },
  {
    description:
      "A guided component walk-through for creators and member surfaces.",
    eyebrow: "Act 02",
    title: "Crystal atelier demo",
    time: "19:50",
  },
  {
    description:
      "A quiet support block for replay, access, and next-step questions.",
    eyebrow: "Act 03",
    title: "Afterglow clinic",
    time: "20:20",
  },
] as const

const eventRules = [
  "The hero owns the event promise; the seat count and agenda support the decision instead of competing with it.",
  "Registration remains the only primary action. Replay, policy, and support stay as secondary or link-level routes.",
  "Scarcity uses progress, text, and a small accent cue rather than turning the whole page into urgency.",
  "Access recovery is visible before failure: users can find ticket help, replay notes, and calendar routes calmly.",
] as const

const meta = {
  title: "Public Luxe/Patterns/Event Landing",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Showcase: Story = {
  render: () => ({
    components: {
      ElyPublicAlert,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDivider,
      ElyPublicEmptyState,
      ElyPublicImage,
      ElyPublicLink,
      ElyPublicProgress,
      ElyPublicStat,
      ElyPublicTabs,
      ElyPublicText,
    },
    setup() {
      const activeTab = ref("overview")
      const registeredSeats = ref(184)
      const seatLimit = 240
      const seatProgress = computed(() =>
        Math.round((registeredSeats.value / seatLimit) * 100),
      )
      const heroArtwork = usePublicThemeArtwork("landscape")

      return {
        activeTab,
        agendaItems,
        eventRules,
        eventTabs,
        heroArtwork,
        registeredSeats,
        seatLimit,
        seatProgress,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-public-shell">
          <section class="ely-story-event-hero">
            <div class="ely-story-event-copy">
              <div class="ely-public-inline">
                <ElyPublicBadge tone="primary">Live release</ElyPublicBadge>
                <ElyPublicBadge tone="neutral">Limited seats</ElyPublicBadge>
              </div>
              <p class="ely-public-eyebrow">Pattern · Event Landing</p>
              <h1 class="ely-public-title">
                Launch pages should feel ceremonial
                <span class="ely-public-title-accent">without losing the registration path</span>
              </h1>
              <p class="ely-public-copy">
                Event pages are where public-luxe can be luminous and practical:
                one promise, one seat state, one primary registration action,
                and calm support routes for replay or access recovery.
              </p>
              <div class="ely-public-actions">
                <ElyPublicButton>Reserve seat</ElyPublicButton>
                <ElyPublicButton tone="secondary">Add to calendar</ElyPublicButton>
                <ElyPublicButton tone="ghost">View replay policy</ElyPublicButton>
              </div>
            </div>

            <div class="ely-story-event-ticket">
              <ElyPublicImage
                :src="heroArtwork"
                alt="Abstract landscape artwork for an Elysian public event"
                aspect="wide"
              />
              <div class="ely-story-event-ticket-panel">
                <p class="ely-public-eyebrow">Seat signal</p>
                <strong>{{ registeredSeats }} / {{ seatLimit }}</strong>
                <ElyPublicProgress
                  label="Reserved seats"
                  tone="accent"
                  :value="seatProgress"
                />
                <ElyPublicText tone="muted">
                  Seats are visible as a decision fact, not a high-pressure
                  countdown.
                </ElyPublicText>
              </div>
            </div>
          </section>

          <section class="ely-story-event-layout">
            <article class="ely-story-event-agenda">
              <div class="ely-story-event-section-head">
                <div>
                  <p class="ely-public-eyebrow">Release rhythm</p>
                  <h2>A three-act agenda with one highlighted moment</h2>
                </div>
                <ElyPublicBadge tone="accent">Tonight</ElyPublicBadge>
              </div>
              <div class="ely-story-event-agenda-list">
                <article
                  v-for="item in agendaItems"
                  :key="item.title"
                  class="ely-story-event-agenda-item"
                >
                  <span>{{ item.time }}</span>
                  <div>
                    <p>{{ item.eyebrow }}</p>
                    <h3>{{ item.title }}</h3>
                    <ElyPublicText tone="muted">{{ item.description }}</ElyPublicText>
                  </div>
                </article>
              </div>
            </article>

            <aside class="ely-story-event-health" aria-label="Registration health">
              <p class="ely-public-eyebrow">Registration health</p>
              <h2>Make urgency legible before making it beautiful</h2>
              <ElyPublicText tone="muted">
                The user should know what happens after reserving a seat.
              </ElyPublicText>
              <div class="ely-public-stack">
                <div class="ely-story-event-stat-grid">
                  <ElyPublicStat
                    eyebrow="Opens"
                    helper="Local time for the live room."
                    tone="primary"
                    value="19:30"
                  />
                  <ElyPublicStat
                    eyebrow="Replay"
                    helper="Available after the event closes."
                    tone="neutral"
                    value="24h"
                  />
                </div>
                <ElyPublicAlert
                  eyebrow="Access note"
                  title="Ticket recovery stays available"
                  tone="info"
                >
                  If registration fails, the user gets one support route and
                  one replay path instead of a dead-end error.

                  <template v-slot:actions>
                    <ElyPublicButton size="sm">Recover ticket</ElyPublicButton>
                    <ElyPublicButton size="sm" tone="ghost">Contact host</ElyPublicButton>
                  </template>
                </ElyPublicAlert>
              </div>
            </aside>
          </section>

          <section class="ely-story-event-lanes">
            <div class="ely-story-event-section-head">
              <div>
                <p class="ely-public-eyebrow">Event lanes</p>
                <h2>Tabs stay inside the event surface</h2>
              </div>
              <p>
                Overview, agenda, and access are peer sections. Billing, policy,
                creator profile, and support remain honest links so the event
                page does not become a hidden app shell.
              </p>
            </div>

            <div class="ely-story-offset-md">
              <ElyPublicTabs v-model="activeTab" :items="eventTabs" aria-label="Event landing lanes">
                <template v-slot:default="{ activeKey }">
                  <div class="ely-story-event-panel">
                    <div v-if="activeKey === 'overview'" class="ely-story-event-overview">
                      <ElyPublicProgress
                        label="Seat readiness"
                        tone="primary"
                        :value="seatProgress"
                      />
                      <ElyPublicText tone="muted">
                        Overview keeps the user's decision together: promise,
                        time, seat state, and the next action.
                      </ElyPublicText>
                      <ElyPublicText tone="muted">
                        Need details?
                        <ElyPublicLink href="#">Read host notes</ElyPublicLink>
                        or
                        <ElyPublicLink href="#" tone="muted">open accessibility guide</ElyPublicLink>.
                      </ElyPublicText>
                    </div>

                    <div v-else-if="activeKey === 'agenda'" class="ely-story-event-mini-agenda">
                      <article
                        v-for="item in agendaItems"
                        :key="item.title"
                        class="ely-story-event-mini-item"
                      >
                        <ElyPublicBadge tone="neutral">{{ item.time }}</ElyPublicBadge>
                        <div>
                          <h3>{{ item.title }}</h3>
                          <ElyPublicText tone="muted">{{ item.description }}</ElyPublicText>
                        </div>
                      </article>
                    </div>

                    <ElyPublicEmptyState
                      v-else
                      eyebrow="Access"
                      title="No access issue needs recovery"
                    >
                      Access states should appear before the user is blocked:
                      ticket help, replay route, calendar file, and host support
                      are low-noise exits.

                      <template v-slot:actions>
                        <ElyPublicButton>Download ticket</ElyPublicButton>
                        <ElyPublicButton tone="ghost">Open support</ElyPublicButton>
                      </template>
                    </ElyPublicEmptyState>
                  </div>
                </template>
              </ElyPublicTabs>
            </div>
          </section>

          <section class="ely-story-event-guardrails">
            <div class="ely-story-event-section-head">
              <div>
                <p class="ely-public-eyebrow">Pattern guardrails</p>
                <h2>Event polish is approved by decision clarity</h2>
              </div>
            </div>
            <div class="ely-story-event-rule-grid ely-story-offset-md">
              <div
                v-for="rule in eventRules"
                :key="rule"
                class="ely-story-event-rule"
              >
                <span aria-hidden="true"></span>
                <ElyPublicText weight="semibold">{{ rule }}</ElyPublicText>
              </div>
            </div>
          </section>
        </div>
      </section>
    `,
  }),
}
