import {
  ElyPublicAvatar,
  ElyPublicBadge,
  ElyPublicButton,
  ElyPublicDescriptionList,
  ElyPublicDivider,
  ElyPublicFieldset,
  ElyPublicInput,
  ElyPublicRadioGroup,
  ElyPublicSegmentedControl,
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
import { computed, ref } from "vue"
import { type Locale, animeSettingsI18n, localeItems } from "./template-i18n"

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
      ElyPublicSegmentedControl,
      ElyPublicSelect,
      ElyPublicSlider,
      ElyPublicSwitch,
      ElyPublicText,
      ElyPublicTextarea,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeSettingsI18n[locale.value])
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
        locale,
        t,
        localeItems,
        activeNav,
        displayName,
        email,
        bio,
        language,
        timezone,
        theme,
        darkMode,
        emailNotifs,
        pushNotifs,
        activityDigest,
        publicProfile,
        density,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage">
          <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem);">
            {{ t.pageTitle }}
          </h1>

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <div class="ely-anime-settings-layout">
            <nav class="ely-anime-glass ely-anime-settings-nav">
              <div
                v-for="section in t.navSections"
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
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.profileSection }}</h2>

                <div class="ely-anime-settings-avatar-edit">
                  <ElyPublicAvatar name="Yukina Studio" size="lg" status="online" />
                  <div style="display: grid; gap: 8px;">
                    <ElyPublicButton size="sm">{{ t.changeAvatar }}</ElyPublicButton>
                    <ElyPublicText>
                      <span style="color: var(--color-text-muted); font-size: 0.78rem;">
                        {{ t.avatarHint }}
                      </span>
                    </ElyPublicText>
                  </div>
                </div>

                <ElyPublicFieldset :legend="t.personalInfo">
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicInput v-model="displayName" :label="t.displayName" />
                    <ElyPublicInput v-model="email" :label="t.email" />
                  </div>
                  <ElyPublicTextarea v-model="bio" :label="t.bio" />
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicSelect v-model="language" :options="t.languageOptions" :label="t.language" />
                    <ElyPublicSelect v-model="timezone" :options="t.timezoneOptions" :label="t.timezone" />
                  </div>
                </ElyPublicFieldset>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.appearanceSection }}</h2>

                <ElyPublicFieldset :legend="t.themeLabel">
                  <ElyPublicRadioGroup v-model="theme" :items="t.themeOptions" :label="t.selectTheme" />
                </ElyPublicFieldset>

                <ElyPublicSwitch v-model="darkMode" :label="t.darkMode" :description="t.darkModeDesc" />

                <ElyPublicSlider v-model="density" :min="0" :max="100" :step="10" :label="t.contentDensity" :description="t.densityDesc" unit="%" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.notificationsSection }}</h2>

                <ElyPublicFieldset :legend="t.notifPrefs">
                  <ElyPublicSwitch v-model="emailNotifs" :label="t.emailNotifs" :description="t.emailNotifsDesc" />
                  <ElyPublicSwitch v-model="pushNotifs" :label="t.pushNotifs" :description="t.pushNotifsDesc" />
                  <ElyPublicSwitch v-model="activityDigest" :label="t.weeklyDigest" :description="t.weeklyDigestDesc" />
                </ElyPublicFieldset>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.accountSection }}</h2>

                <ElyPublicSwitch v-model="publicProfile" :label="t.publicProfile" :description="t.publicProfileDesc" />

                <ElyPublicDivider />

                <ElyPublicDescriptionList :items="t.accountItems" />

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <ElyPublicButton tone="ghost">{{ t.cancelBtn }}</ElyPublicButton>
                  <ElyPublicButton>{{ t.saveBtn }}</ElyPublicButton>
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
      ElyPublicSegmentedControl,
      ElyPublicSelect,
      ElyPublicSlider,
      ElyPublicSwitch,
      ElyPublicText,
      ElyPublicTextarea,
    },
    setup() {
      const locale = ref<Locale>("en")
      const t = computed(() => animeSettingsI18n[locale.value])
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
        locale,
        t,
        localeItems,
        activeNav,
        displayName,
        email,
        bio,
        language,
        timezone,
        theme,
        darkMode,
        emailNotifs,
        pushNotifs,
        publicProfile,
        density,
      }
    },
    template: `
      <section class="ely-public-stage">
        <div class="ely-anime-stage ely-anime-bg-dots">
          <h1 style="margin: 0; font-family: var(--ely-public-font-display); font-size: clamp(1.5rem, 3vw, 2rem);">
            {{ t.pageTitle }}
          </h1>

          <div class="ely-tpl-locale-bar">
            <ElyPublicSegmentedControl v-model="locale" :items="localeItems" />
          </div>

          <div class="ely-anime-settings-layout">
            <nav class="ely-anime-glass ely-anime-settings-nav">
              <div
                v-for="section in t.navSections"
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
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.profileSection }}</h2>

                <div class="ely-anime-settings-avatar-edit">
                  <ElyPublicAvatar name="Yukina Studio" size="lg" status="online" />
                  <div style="display: grid; gap: 8px;">
                    <ElyPublicButton size="sm">{{ t.changeAvatar }}</ElyPublicButton>
                  </div>
                </div>

                <ElyPublicFieldset :legend="t.personalInfo">
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicInput v-model="displayName" :label="t.displayName" />
                    <ElyPublicInput v-model="email" :label="t.email" />
                  </div>
                  <ElyPublicTextarea v-model="bio" :label="t.bio" />
                  <div class="ely-anime-settings-form-grid">
                    <ElyPublicSelect v-model="language" :options="t.languageOptions" :label="t.language" />
                    <ElyPublicSelect v-model="timezone" :options="t.timezoneOptions" :label="t.timezone" />
                  </div>
                </ElyPublicFieldset>
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.appearanceSection }}</h2>
                <ElyPublicRadioGroup v-model="theme" :items="t.themeOptions" :label="t.selectTheme" />
                <ElyPublicSwitch v-model="darkMode" :label="t.darkMode" :description="t.darkModeDesc" />
                <ElyPublicSlider v-model="density" :min="0" :max="100" :step="10" :label="t.contentDensity" :description="t.densityDesc" unit="%" />
              </div>

              <div class="ely-anime-glass ely-anime-section">
                <h2 style="margin: 0; font-family: var(--ely-public-font-display); font-size: 1.2rem;">{{ t.accountSection }}</h2>
                <ElyPublicSwitch v-model="publicProfile" :label="t.publicProfile" :description="t.publicProfileDesc" />
                <ElyPublicDivider />
                <ElyPublicDescriptionList :items="t.accountItems" />
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                  <ElyPublicButton tone="ghost">{{ t.cancelBtn }}</ElyPublicButton>
                  <ElyPublicButton>{{ t.saveBtn }}</ElyPublicButton>
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
