import { describe, expect, test } from "bun:test"

import { publicComponentDocs } from "./docs"

const documentedComponents = [
  "Accordion",
  "Button",
  "IconButton",
  "Link",
  "Menu",
  "Toolbar",
  "List",
  "DescriptionList",
  "Table",
  "Breadcrumb",
  "Pagination",
  "Stepper",
  "Timeline",
  "Tooltip",
  "Popover",
  "Stat",
  "Text",
  "Kbd",
  "Avatar",
  "Image",
  "Input",
  "SearchInput",
  "Fieldset",
  "Textarea",
  "NumberInput",
  "DateInput",
  "FileInput",
  "Chip",
  "Progress",
  "Meter",
  "Card",
  "Badge",
  "Tabs",
  "Dialog",
  "Select",
  "Slider",
  "Spinner",
  "Rating",
  "Switch",
  "EmptyState",
  "Checkbox",
  "RadioGroup",
  "SegmentedControl",
  "Skeleton",
  "Alert",
  "Toast",
  "Divider",
] as const

describe("publicComponentDocs", () => {
  test("documents every first-stage public component", () => {
    expect(Object.keys(publicComponentDocs).sort()).toEqual(
      [...documentedComponents].sort(),
    )
  })

  test.each(documentedComponents.map((componentName) => [componentName]))(
    "%s has enough design-system metadata for Storybook docs",
    (componentName) => {
      const doc = publicComponentDocs[componentName]

      expect(doc.name.length).toBeGreaterThan(0)
      expect(doc.description.length).toBeGreaterThan(32)
      expect(doc.usage.length).toBeGreaterThanOrEqual(3)
      expect(doc.decision.length).toBeGreaterThanOrEqual(2)
      expect(doc.composition.length).toBeGreaterThanOrEqual(2)
      expect(doc.antiPatterns.length).toBeGreaterThanOrEqual(2)
      expect(doc.states.length).toBeGreaterThanOrEqual(4)
      expect(doc.props.length).toBeGreaterThanOrEqual(1)
      expect(doc.accessibility.length).toBeGreaterThanOrEqual(3)

      for (const state of doc.states) {
        expect(state.name.length).toBeGreaterThan(0)
        expect(state.description.length).toBeGreaterThan(24)
      }

      for (const prop of doc.props) {
        expect(prop.name.length).toBeGreaterThan(0)
        expect(prop.type.length).toBeGreaterThan(0)
        expect(prop.description.length).toBeGreaterThan(16)
      }

      for (const decision of doc.decision) {
        expect(decision.length).toBeGreaterThan(32)
      }

      for (const composition of doc.composition) {
        expect(composition.length).toBeGreaterThan(32)
      }

      for (const antiPattern of doc.antiPatterns) {
        expect(antiPattern.length).toBeGreaterThan(32)
      }
    },
  )
})
