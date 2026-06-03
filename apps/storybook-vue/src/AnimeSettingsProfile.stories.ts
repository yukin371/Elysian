import {
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDescriptionList,
  ElyPublicDivider,
  ElyPublicFieldset,
  ElyPublicInput,
  ElyPublicRadioGroup,
  ElyPublicSelect,
  ElyPublicSlider,
  ElyPublicSwitch,
  ElyPublicText,
  ElyPublicTextarea,
} from "@elysian/ui-public-vue"
import type {
  ElyPublicDescriptionItem,
  ElyPublicRadioGroupItem,
  ElyPublicSelectOption,
} from "@elysian/ui-public-vue"
import type { Meta, StoryObj } from "@storybook/vue3-vite"
import { ref } from "vue"

const meta = {
  title: "Public Luxe/Showcase/Anime Settings & Profile",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A settings/profile editor template with sticky sidebar navigation, avatar management, form sections with fieldsets, theme selection via radio group, and notification preference switches. Demonstrates building form-heavy anime-styled pages.",
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const navSections = [
  { key: "profile", label: "Profile" },
  { key: "appearance", label: "Appearance" },
  { key: "notifications", label: "Notifications" },
  { key: "account", label: "Account" },
]

const themeItems: ElyPublicRadioGroupItem[] = [
  {
    key: "default",
    label: "Elysian Default",
    value: "elysian-default",
  },
  {
    key: "rose",
    label: "Rose Nocturne",
    value: "rose-nocturne",
  },
  {
    key: "azure",
    label: "Azure Aria",
    value: "azure-aria",
  },
  {
    key: "enterprise",
    label: "Enterprise Calm",
    value: "enterprise-calm",
  },
  {
    key: "sakura",
    label: "Dreamy Sakura",
    value: "dreamy-sakura",
  },
]

const languageOptions: ElyPublicSelectOption[] = [
  { label: "English", value: "en" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese (Simplified)", value: "zh" },
]

const timezoneOptions: ElyPublicSelectOption[] = [
  { label: "UTC+9 (JST)", value: "asia-tokyo" },
  { label: "UTC+8 (CST)", value: "asia-shanghai" },
  { label: "UTC-5 (EST)", value: "us-eastern" },
  { label: "UTC-8 (PST)", value: "us-pacific" },
]

const accountItems: ElyPublicDescriptionItem[] = [
  { key: "member", label: "Member since", value: "January 2026" },
  { key: "plan", label: "Plan", value: "Collector Pro", tone: "accent" },
  { key: "id", label: "Account ID", value: "ELY-2026-04821" },
  { key: "storage", label: "Storage used", value: "2.4 GB of 10 GB" },
]

export const SettingsEditor: Story = {
  name: "Profile and settings editor",
  render: () => ({
    components: {
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDescriptionList,
      ElyPublicDivider,
      ElyPublicFieldset,
      ElyPublicInput,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSlider,
      ElyPublicSwitch,
      ElyPublicText,
      ElyPublicTextarea,
    },
    setup() {
      const activeNav = ref("profile")
      const displayName = ref("Yukina Studio")
      const email = ref("yukina@example.com")
      const bio = ref(
        "Creator · Illustrator · Collector. Building beautiful things with the Elysian platform.",
      )
      const language = ref("en")
      const timezone = ref("asia-tokyo")
      const theme = ref("elysian-default")
      const darkMode = ref(false)
      const emailNotifs = ref(true)
      const pushNotifs = ref(true)
      const activityDigest = ref(false)
      const publicProfile = ref(true)
      const density = ref(50)

      return {
        activeNav,
        displayName,
        email,
        bio,
        language,
        timezone,
        languageOptions,
        timezoneOptions,
        theme,
        themeItems,
        darkMode,
        emailNotifs,
        pushNotifs,
        activityDigest,
        publicProfile,
        density,
        navSections,
        accountItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem);">
            Settings
          </h1>

          <div class="ely-anime-settings-layout">
            <nav class="ely-anime-glass ely-anime-settings-nav">
              <div
                v-for="section in navSections"
                :key="section.key"
                class="ely-anime-settings-nav-item"
                :class="{ 'ely-anime-settings-nav-item--active': activeNav === section.key }"
                @click="activeNav = section.key"
              >
                {{ section.label }}
              </div>
            </nav>

            <div style="display: grid; gap: 24px;">
              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Profile</h2>

                <div class="ely-anime-settings-avatar-edit">
                  <ElyPublicAvatar name="Yukina Studio" size="lg" status="online" />
                  <div style="display: grid; gap: 8px;">
                    <ElyPublicButton size="sm">Change avatar</ElyPublicButton>
                    <ElyPublicText>
                      <span style="color: var(--color-text-muted); font-size: 0.78rem;">
                        JPG, PNG or GIF. Max 2 MB.
                      </span>
                    </ElyPublicText>
                  </div>
                </div>

                <ElyPublicFieldset legend="Personal information">
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicInput v-model="displayName" label="Display name" />
                    <ElyPublicInput v-model="email" label="Email" />
                  </div>
                  <ElyPublicTextarea v-model="bio" label="Bio" />
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicSelect v-model="language" :options="languageOptions" label="Language" />
                    <ElyPublicSelect v-model="timezone" :options="timezoneOptions" label="Timezone" />
                  </div>
                </ElyPublicFieldset>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Appearance</h2>

                <ElyPublicFieldset legend="Theme">
                  <ElyPublicRadioGroup v-model="theme" :items="themeItems" label="Select theme" />
                </ElyPublicFieldset>

                <ElyPublicSwitch v-model="darkMode" label="Dark mode" description="Use dark color scheme across the platform" />

                <ElyPublicSlider v-model="density" :min="0" :max="100" :step="10" label="Content density" description="Adjust spacing and compactness" unit="%" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Notifications</h2>

                <ElyPublicFieldset legend="Notification preferences">
                  <ElyPublicSwitch v-model="emailNotifs" label="Email notifications" description="Receive updates via email" />
                  <ElyPublicSwitch v-model="pushNotifs" label="Push notifications" description="Browser push alerts for new activity" />
                  <ElyPublicSwitch v-model="activityDigest" label="Weekly digest" description="Get a summary of community activity every Monday" />
                </ElyPublicFieldset>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Account</h2>

                <ElyPublicSwitch v-model="publicProfile" label="Public profile" description="Allow others to see your profile and collections" />

                <ElyPublicDivider />

                <ElyPublicDescriptionList :items="accountItems" />

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <ElyPublicButton tone="ghost">Cancel</ElyPublicButton>
                  <ElyPublicButton>Save changes</ElyPublicButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
}

export const SettingsDarkMode: Story = {
  name: "Settings (dark mode)",
  render: () => ({
    components: {
      ElyPublicAvatar,
      ElyPublicBadge,
      ElyPublicButton,
      ElyPublicDescriptionList,
      ElyPublicDivider,
      ElyPublicFieldset,
      ElyPublicInput,
      ElyPublicRadioGroup,
      ElyPublicSelect,
      ElyPublicSlider,
      ElyPublicSwitch,
      ElyPublicText,
      ElyPublicTextarea,
    },
    setup() {
      const activeNav = ref("profile")
      const displayName = ref("Yukina Studio")
      const email = ref("yukina@example.com")
      const bio = ref("Creator · Illustrator · Collector.")
      const language = ref("ja")
      const timezone = ref("asia-tokyo")
      const theme = ref("rose-nocturne")
      const darkMode = ref(true)
      const emailNotifs = ref(true)
      const pushNotifs = ref(false)
      const activityDigest = ref(true)
      const publicProfile = ref(true)
      const density = ref(70)

      return {
        activeNav,
        displayName,
        email,
        bio,
        language,
        timezone,
        languageOptions,
        timezoneOptions,
        theme,
        themeItems,
        darkMode,
        emailNotifs,
        pushNotifs,
        activityDigest,
        publicProfile,
        density,
        navSections,
        accountItems,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage ely-anime-bg-dots">
          <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem);">
            Settings
          </h1>

          <div class="ely-anime-settings-layout">
            <nav class="ely-anime-glass ely-anime-settings-nav">
              <div
                v-for="section in navSections"
                :key="section.key"
                class="ely-anime-settings-nav-item"
                :class="{ 'ely-anime-settings-nav-item--active': activeNav === section.key }"
                @click="activeNav = section.key"
              >
                {{ section.label }}
              </div>
            </nav>

            <div style="display: grid; gap: 24px;">
              <div class="ely-anime-glass ely-anime-glow ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Profile</h2>

                <div class="ely-anime-settings-avatar-edit">
                  <ElyPublicAvatar name="Yukina Studio" size="lg" status="online" />
                  <div style="display: grid; gap: 8px;">
                    <ElyPublicButton size="sm">Change avatar</ElyPublicButton>
                  </div>
                </div>

                <ElyPublicFieldset legend="Personal information">
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicInput v-model="displayName" label="Display name" />
                    <ElyPublicInput v-model="email" label="Email" />
                  </div>
                  <ElyPublicTextarea v-model="bio" label="Bio" />
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicSelect v-model="language" :options="languageOptions" label="Language" />
                    <ElyPublicSelect v-model="timezone" :options="timezoneOptions" label="Timezone" />
                  </div>
                </ElyPublicFieldset>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Appearance</h2>
                <ElyPublicRadioGroup v-model="theme" :items="themeItems" label="Select theme" />
                <ElyPublicSwitch v-model="darkMode" label="Dark mode" description="Use dark color scheme" />
                <ElyPublicSlider v-model="density" :min="0" :max="100" :step="10" label="Content density" unit="%" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">Account</h2>
                <ElyPublicDescriptionList :items="accountItems" />
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <ElyPublicButton tone="ghost">Cancel</ElyPublicButton>
                  <ElyPublicButton>Save changes</ElyPublicButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
  parameters: {
    globals: { mode: "dark" },
  },
}
