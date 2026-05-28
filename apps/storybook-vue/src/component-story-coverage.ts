import type { ElyPublicDocumentedComponent } from "@elysian/ui-public-vue"

export interface PublicComponentScenarioCoverage {
  component: ElyPublicDocumentedComponent
  fileName: string
  scenarios: {
    exportName: string
    label: string
    reviewFocus: PublicComponentReviewFocus[]
    storyId: string
  }[]
}

export type PublicComponentReviewFocus =
  | "accessibility"
  | "composition"
  | "content"
  | "density"
  | "feedback"
  | "interaction"
  | "state"

export const publicComponentReviewFocusLabels: Record<
  PublicComponentReviewFocus,
  string
> = {
  accessibility: "Accessibility",
  composition: "Composition",
  content: "Content",
  density: "Density",
  feedback: "Feedback",
  interaction: "Interaction",
  state: "State",
}

const toStoryIdSegment = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase()

const createScenario = (
  component: ElyPublicDocumentedComponent,
  exportName: string,
  label: string,
  reviewFocus: PublicComponentReviewFocus[],
) => ({
  exportName,
  label,
  reviewFocus,
  storyId: `public-luxe-components-${toStoryIdSegment(component)}--${toStoryIdSegment(exportName)}`,
})

export const publicComponentScenarioCoverage = [
  {
    component: "Accordion",
    fileName: "PublicAccordion.stories.ts",
    scenarios: [
      createScenario("Accordion", "DisclosureStates", "Disclosure states", [
        "state",
        "interaction",
      ]),
      createScenario("Accordion", "FaqScenarios", "FAQ scenarios", [
        "composition",
        "content",
      ]),
      createScenario("Accordion", "BoundaryScenarios", "Boundary scenarios", [
        "accessibility",
        "feedback",
        "content",
      ]),
    ],
  },
  {
    component: "Button",
    fileName: "PublicButton.stories.ts",
    scenarios: [
      createScenario("Button", "Variants", "Hierarchy variants", [
        "state",
        "interaction",
      ]),
      createScenario("Button", "Sizes", "Density sizes", ["density"]),
      createScenario("Button", "UsageScenarios", "Product usage scenarios", [
        "composition",
        "content",
      ]),
      createScenario(
        "Button",
        "CriticalPathScenarios",
        "Critical path scenarios",
        ["interaction", "feedback", "composition"],
      ),
    ],
  },
  {
    component: "IconButton",
    fileName: "PublicIconButton.stories.ts",
    scenarios: [
      createScenario("IconButton", "ToolbarScenarios", "Toolbar scenarios", [
        "composition",
        "accessibility",
        "density",
      ]),
      createScenario(
        "IconButton",
        "MediaControlScenarios",
        "Media control scenarios",
        ["interaction", "content", "accessibility"],
      ),
      createScenario("IconButton", "ToggleScenarios", "Toggle scenarios", [
        "state",
        "interaction",
        "accessibility",
      ]),
      createScenario("IconButton", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "composition",
        "content",
      ]),
    ],
  },
  {
    component: "Link",
    fileName: "PublicLink.stories.ts",
    scenarios: [
      createScenario("Link", "TonesAndUnderline", "Tones and underline", [
        "state",
        "content",
      ]),
      createScenario("Link", "NavigationScenarios", "Navigation scenarios", [
        "composition",
        "accessibility",
      ]),
      createScenario(
        "Link",
        "RouteBoundaryScenarios",
        "Route boundary scenarios",
        ["interaction", "accessibility", "content"],
      ),
    ],
  },
  {
    component: "Menu",
    fileName: "PublicMenu.stories.ts",
    scenarios: [
      createScenario(
        "Menu",
        "ActionOverflowScenarios",
        "Action overflow scenarios",
        ["interaction", "composition", "content"],
      ),
      createScenario("Menu", "KeyboardScenarios", "Keyboard scenarios", [
        "interaction",
        "accessibility",
        "state",
      ]),
      createScenario("Menu", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "composition",
        "content",
      ]),
    ],
  },
  {
    component: "Toolbar",
    fileName: "PublicToolbar.stories.ts",
    scenarios: [
      createScenario(
        "Toolbar",
        "ActionLaneScenarios",
        "Action lane scenarios",
        ["interaction", "composition", "density"],
      ),
      createScenario(
        "Toolbar",
        "PreferenceToolbarScenarios",
        "Preference toolbar scenarios",
        ["state", "accessibility", "composition"],
      ),
      createScenario("Toolbar", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "composition",
        "content",
      ]),
    ],
  },
  {
    component: "List",
    fileName: "PublicList.stories.ts",
    scenarios: [
      createScenario("List", "CollectionScenarios", "Collection scenarios", [
        "composition",
        "content",
        "density",
      ]),
      createScenario("List", "NavigationScenarios", "Navigation scenarios", [
        "interaction",
        "accessibility",
        "content",
      ]),
      createScenario("List", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "composition",
        "content",
      ]),
    ],
  },
  {
    component: "DescriptionList",
    fileName: "PublicDescriptionList.stories.ts",
    scenarios: [
      createScenario(
        "DescriptionList",
        "ProfileScenarios",
        "Profile scenarios",
        ["composition", "content"],
      ),
      createScenario("DescriptionList", "PolicyScenarios", "Policy scenarios", [
        "density",
        "content",
        "interaction",
      ]),
      createScenario(
        "DescriptionList",
        "BoundaryScenarios",
        "Boundary scenarios",
        ["accessibility", "feedback", "content"],
      ),
    ],
  },
  {
    component: "Table",
    fileName: "PublicTable.stories.ts",
    scenarios: [
      createScenario("Table", "ComparisonScenarios", "Comparison scenarios", [
        "composition",
        "content",
        "density",
      ]),
      createScenario(
        "Table",
        "CompactAuditScenarios",
        "Compact audit scenarios",
        ["feedback", "content", "state"],
      ),
      createScenario("Table", "BoundaryScenarios", "Boundary scenarios", [
        "accessibility",
        "composition",
        "feedback",
      ]),
    ],
  },
  {
    component: "Breadcrumb",
    fileName: "PublicBreadcrumb.stories.ts",
    scenarios: [
      createScenario("Breadcrumb", "RouteDepths", "Route depths", [
        "content",
        "density",
      ]),
      createScenario(
        "Breadcrumb",
        "CollapsedRouteScenarios",
        "Collapsed route scenarios",
        ["density", "accessibility", "content"],
      ),
      createScenario(
        "Breadcrumb",
        "WayfindingScenarios",
        "Wayfinding scenarios",
        ["composition", "interaction", "content"],
      ),
      createScenario(
        "Breadcrumb",
        "AccessibilityBoundaryScenarios",
        "Accessibility boundary scenarios",
        ["accessibility", "interaction", "content"],
      ),
    ],
  },
  {
    component: "Pagination",
    fileName: "PublicPagination.stories.ts",
    scenarios: [
      createScenario(
        "Pagination",
        "PageRangeScenarios",
        "Page range scenarios",
        ["density", "interaction"],
      ),
      createScenario(
        "Pagination",
        "CollectionScenarios",
        "Collection scenarios",
        ["composition", "content", "interaction"],
      ),
      createScenario(
        "Pagination",
        "LocalizedLabelScenarios",
        "Localized label scenarios",
        ["accessibility", "content", "interaction"],
      ),
      createScenario("Pagination", "BoundaryScenarios", "Boundary scenarios", [
        "accessibility",
        "composition",
        "content",
      ]),
    ],
  },
  {
    component: "Stepper",
    fileName: "PublicStepper.stories.ts",
    scenarios: [
      createScenario("Stepper", "FlowStates", "Flow states", [
        "state",
        "content",
      ]),
      createScenario(
        "Stepper",
        "InteractiveScenarios",
        "Interactive scenarios",
        ["interaction", "accessibility"],
      ),
      createScenario("Stepper", "BoundaryScenarios", "Boundary scenarios", [
        "composition",
        "feedback",
        "content",
      ]),
    ],
  },
  {
    component: "Slider",
    fileName: "PublicSlider.stories.ts",
    scenarios: [
      createScenario("Slider", "IntensityScenarios", "Intensity scenarios", [
        "interaction",
        "state",
        "composition",
      ]),
      createScenario("Slider", "BudgetScenarios", "Budget scenarios", [
        "density",
        "accessibility",
        "content",
      ]),
      createScenario("Slider", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "state",
      ]),
    ],
  },
  {
    component: "Rating",
    fileName: "PublicRating.stories.ts",
    scenarios: [
      createScenario("Rating", "FeedbackScenarios", "Feedback scenarios", [
        "interaction",
        "content",
        "state",
      ]),
      createScenario("Rating", "ReadOnlyScenarios", "Read-only scenarios", [
        "composition",
        "accessibility",
        "content",
      ]),
      createScenario("Rating", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "composition",
      ]),
    ],
  },
  {
    component: "Timeline",
    fileName: "PublicTimeline.stories.ts",
    scenarios: [
      createScenario(
        "Timeline",
        "ChronologyScenarios",
        "Chronology scenarios",
        ["composition", "content"],
      ),
      createScenario("Timeline", "ScheduleScenarios", "Schedule scenarios", [
        "density",
        "content",
        "interaction",
      ]),
      createScenario("Timeline", "BoundaryScenarios", "Boundary scenarios", [
        "accessibility",
        "feedback",
        "content",
      ]),
    ],
  },
  {
    component: "Tooltip",
    fileName: "PublicTooltip.stories.ts",
    scenarios: [
      createScenario("Tooltip", "Placements", "Tooltip placements", [
        "density",
        "interaction",
      ]),
      createScenario("Tooltip", "LabelHelpScenarios", "Label help scenarios", [
        "composition",
        "content",
      ]),
      createScenario(
        "Tooltip",
        "AccessibilityBoundaryScenarios",
        "Accessibility boundary scenarios",
        ["accessibility", "content", "feedback"],
      ),
    ],
  },
  {
    component: "Popover",
    fileName: "PublicPopover.stories.ts",
    scenarios: [
      createScenario(
        "Popover",
        "ContextPreviewScenarios",
        "Context preview scenarios",
        ["composition", "content", "interaction"],
      ),
      createScenario(
        "Popover",
        "SupportActionScenarios",
        "Support action scenarios",
        ["feedback", "accessibility", "content"],
      ),
      createScenario("Popover", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "composition",
      ]),
    ],
  },
  {
    component: "Stat",
    fileName: "PublicStat.stories.ts",
    scenarios: [
      createScenario("Stat", "TonesAndTrends", "Tones and trends", [
        "state",
        "content",
      ]),
      createScenario("Stat", "MetricScenarios", "Metric scenarios", [
        "composition",
        "content",
      ]),
      createScenario(
        "Stat",
        "SummaryBoundaryScenarios",
        "Summary boundary scenarios",
        ["composition", "content", "feedback"],
      ),
    ],
  },
  {
    component: "Text",
    fileName: "PublicText.stories.ts",
    scenarios: [
      createScenario("Text", "TypeScale", "Type scale", ["density", "content"]),
      createScenario("Text", "VoiceScenarios", "Voice scenarios", [
        "content",
        "accessibility",
      ]),
      createScenario(
        "Text",
        "ReadingBoundaryScenarios",
        "Reading boundary scenarios",
        ["content", "accessibility", "feedback"],
      ),
    ],
  },
  {
    component: "Kbd",
    fileName: "PublicKbd.stories.ts",
    scenarios: [
      createScenario("Kbd", "ShortcutScenarios", "Shortcut scenarios", [
        "interaction",
        "content",
      ]),
      createScenario("Kbd", "InlineHelpScenarios", "Inline help scenarios", [
        "accessibility",
        "composition",
        "content",
      ]),
      createScenario("Kbd", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "interaction",
        "content",
      ]),
    ],
  },
  {
    component: "Avatar",
    fileName: "PublicAvatar.stories.ts",
    scenarios: [
      createScenario("Avatar", "SizesAndShapes", "Sizes and shapes", [
        "density",
        "state",
      ]),
      createScenario("Avatar", "PresenceScenarios", "Presence scenarios", [
        "state",
        "accessibility",
      ]),
      createScenario(
        "Avatar",
        "IdentityBoundaryScenarios",
        "Identity boundary scenarios",
        ["accessibility", "content", "state"],
      ),
    ],
  },
  {
    component: "Image",
    fileName: "PublicImage.stories.ts",
    scenarios: [
      createScenario("Image", "AspectRatios", "Aspect ratios", [
        "density",
        "composition",
      ]),
      createScenario("Image", "MediaScenarios", "Media scenarios", [
        "state",
        "accessibility",
      ]),
      createScenario(
        "Image",
        "MediaBoundaryScenarios",
        "Media boundary scenarios",
        ["accessibility", "composition", "content"],
      ),
    ],
  },
  {
    component: "Input",
    fileName: "PublicInput.stories.ts",
    scenarios: [
      createScenario("Input", "FieldTypes", "Field types", [
        "state",
        "interaction",
      ]),
      createScenario("Input", "ValidationScenarios", "Validation scenarios", [
        "feedback",
        "accessibility",
      ]),
      createScenario("Input", "RepairFlowScenarios", "Repair flow scenarios", [
        "feedback",
        "accessibility",
        "content",
      ]),
    ],
  },
  {
    component: "SearchInput",
    fileName: "PublicSearchInput.stories.ts",
    scenarios: [
      createScenario("SearchInput", "QueryScenarios", "Query scenarios", [
        "interaction",
        "content",
        "state",
      ]),
      createScenario("SearchInput", "RecoveryScenarios", "Recovery scenarios", [
        "feedback",
        "accessibility",
        "composition",
      ]),
      createScenario("SearchInput", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "composition",
        "content",
      ]),
    ],
  },
  {
    component: "Fieldset",
    fileName: "PublicFieldset.stories.ts",
    scenarios: [
      createScenario(
        "Fieldset",
        "PreferenceGroupScenarios",
        "Preference group scenarios",
        ["composition", "accessibility", "content"],
      ),
      createScenario(
        "Fieldset",
        "ConsentGroupScenarios",
        "Consent group scenarios",
        ["interaction", "feedback", "content"],
      ),
      createScenario("Fieldset", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "composition",
      ]),
    ],
  },
  {
    component: "Textarea",
    fileName: "PublicTextarea.stories.ts",
    scenarios: [
      createScenario(
        "Textarea",
        "CreatorNoteScenarios",
        "Creator note scenarios",
        ["interaction", "state", "composition"],
      ),
      createScenario(
        "Textarea",
        "SupportMessageScenarios",
        "Support message scenarios",
        ["accessibility", "content", "feedback"],
      ),
      createScenario("Textarea", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "content",
      ]),
    ],
  },
  {
    component: "NumberInput",
    fileName: "PublicNumberInput.stories.ts",
    scenarios: [
      createScenario("NumberInput", "QuantityScenarios", "Quantity scenarios", [
        "interaction",
        "state",
        "composition",
      ]),
      createScenario(
        "NumberInput",
        "PrecisionScenarios",
        "Precision scenarios",
        ["accessibility", "content", "density"],
      ),
      createScenario("NumberInput", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "content",
      ]),
    ],
  },
  {
    component: "DateInput",
    fileName: "PublicDateInput.stories.ts",
    scenarios: [
      createScenario(
        "DateInput",
        "EventDateScenarios",
        "Event date scenarios",
        ["interaction", "state", "composition"],
      ),
      createScenario(
        "DateInput",
        "ValidityWindowScenarios",
        "Validity window scenarios",
        ["accessibility", "content", "density"],
      ),
      createScenario("DateInput", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "content",
      ]),
    ],
  },
  {
    component: "FileInput",
    fileName: "PublicFileInput.stories.ts",
    scenarios: [
      createScenario(
        "FileInput",
        "VerificationScenarios",
        "Verification scenarios",
        ["interaction", "state", "composition"],
      ),
      createScenario(
        "FileInput",
        "MultiAttachmentScenarios",
        "Multi attachment scenarios",
        ["accessibility", "content", "density"],
      ),
      createScenario("FileInput", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "content",
      ]),
    ],
  },
  {
    component: "Chip",
    fileName: "PublicChip.stories.ts",
    scenarios: [
      createScenario("Chip", "TonesAndSelection", "Tones and selection", [
        "state",
        "density",
      ]),
      createScenario(
        "Chip",
        "RemovableFilterScenarios",
        "Removable filter scenarios",
        ["interaction", "composition", "accessibility"],
      ),
      createScenario(
        "Chip",
        "BadgeBoundaryScenarios",
        "Badge boundary scenarios",
        ["interaction", "content", "feedback"],
      ),
    ],
  },
  {
    component: "Card",
    fileName: "PublicCard.stories.ts",
    scenarios: [
      createScenario("Card", "Variants", "Surface variants", [
        "state",
        "composition",
      ]),
      createScenario("Card", "CompositionScenarios", "Composition scenarios", [
        "composition",
        "content",
      ]),
      createScenario(
        "Card",
        "SurfaceHierarchyScenarios",
        "Surface hierarchy scenarios",
        ["composition", "interaction", "density"],
      ),
    ],
  },
  {
    component: "Badge",
    fileName: "PublicBadge.stories.ts",
    scenarios: [
      createScenario("Badge", "Tones", "Semantic tones", ["state"]),
      createScenario("Badge", "StatusScenarios", "Status scenarios", [
        "feedback",
        "content",
      ]),
      createScenario(
        "Badge",
        "SemanticBoundaryScenarios",
        "Semantic boundary scenarios",
        ["feedback", "accessibility", "interaction"],
      ),
    ],
  },
  {
    component: "Tabs",
    fileName: "PublicTabs.stories.ts",
    scenarios: [
      createScenario("Tabs", "ContentPatterns", "Content patterns", [
        "composition",
        "content",
      ]),
      createScenario("Tabs", "KeyboardReview", "Keyboard review", [
        "interaction",
        "accessibility",
      ]),
      createScenario(
        "Tabs",
        "SectionBoundaryScenarios",
        "Section boundary scenarios",
        ["interaction", "composition", "accessibility"],
      ),
    ],
  },
  {
    component: "Dialog",
    fileName: "PublicDialog.stories.ts",
    scenarios: [
      createScenario("Dialog", "Sizes", "Dialog sizes", [
        "density",
        "composition",
      ]),
      createScenario("Dialog", "DismissalRules", "Dismissal rules", [
        "interaction",
        "accessibility",
      ]),
      createScenario(
        "Dialog",
        "ConfirmationFlowScenarios",
        "Confirmation flow scenarios",
        ["interaction", "feedback", "composition"],
      ),
    ],
  },
  {
    component: "Progress",
    fileName: "PublicProgress.stories.ts",
    scenarios: [
      createScenario("Progress", "Tones", "Progress tones", [
        "state",
        "feedback",
      ]),
      createScenario("Progress", "ProductScenarios", "Product scenarios", [
        "composition",
        "content",
      ]),
      createScenario(
        "Progress",
        "BoundedReadinessScenarios",
        "Bounded readiness scenarios",
        ["feedback", "content", "state"],
      ),
      createScenario(
        "Progress",
        "MilestoneGateScenarios",
        "Milestone gate scenarios",
        ["feedback", "interaction", "content"],
      ),
    ],
  },
  {
    component: "Meter",
    fileName: "PublicMeter.stories.ts",
    scenarios: [
      createScenario("Meter", "CapacityScenarios", "Capacity scenarios", [
        "content",
        "state",
        "composition",
      ]),
      createScenario("Meter", "QualityScenarios", "Quality scenarios", [
        "feedback",
        "accessibility",
        "content",
      ]),
      createScenario("Meter", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "composition",
      ]),
    ],
  },
  {
    component: "Spinner",
    fileName: "PublicSpinner.stories.ts",
    scenarios: [
      createScenario(
        "Spinner",
        "InlineLoadingScenarios",
        "Inline loading scenarios",
        ["interaction", "accessibility", "content"],
      ),
      createScenario("Spinner", "LocalWaitScenarios", "Local wait scenarios", [
        "feedback",
        "composition",
        "content",
      ]),
      createScenario("Spinner", "BoundaryScenarios", "Boundary scenarios", [
        "feedback",
        "accessibility",
        "composition",
      ]),
    ],
  },
  {
    component: "Select",
    fileName: "PublicSelect.stories.ts",
    scenarios: [
      createScenario("Select", "OptionSets", "Option sets", [
        "interaction",
        "content",
      ]),
      createScenario("Select", "ValidationScenarios", "Validation scenarios", [
        "feedback",
        "accessibility",
      ]),
      createScenario(
        "Select",
        "DecisionFlowScenarios",
        "Decision flow scenarios",
        ["interaction", "content", "composition"],
      ),
    ],
  },
  {
    component: "Switch",
    fileName: "PublicSwitch.stories.ts",
    scenarios: [
      createScenario("Switch", "ToggleScenarios", "Toggle scenarios", [
        "interaction",
        "state",
      ]),
      createScenario(
        "Switch",
        "AvailabilityScenarios",
        "Availability scenarios",
        ["feedback", "accessibility"],
      ),
      createScenario(
        "Switch",
        "RuntimeBoundaryScenarios",
        "Runtime boundary scenarios",
        ["interaction", "feedback", "content"],
      ),
    ],
  },
  {
    component: "EmptyState",
    fileName: "PublicEmptyState.stories.ts",
    scenarios: [
      createScenario("EmptyState", "Tones", "Empty-state tones", [
        "state",
        "feedback",
      ]),
      createScenario("EmptyState", "ProductScenarios", "Product scenarios", [
        "composition",
        "content",
      ]),
      createScenario(
        "EmptyState",
        "RecoveryPathScenarios",
        "Recovery path scenarios",
        ["feedback", "composition", "content"],
      ),
      createScenario(
        "EmptyState",
        "AbsenceBoundaryScenarios",
        "Absence boundary scenarios",
        ["feedback", "composition", "content"],
      ),
    ],
  },
  {
    component: "Checkbox",
    fileName: "PublicCheckbox.stories.ts",
    scenarios: [
      createScenario("Checkbox", "SelectionScenarios", "Selection scenarios", [
        "interaction",
        "state",
      ]),
      createScenario("Checkbox", "ConsentScenarios", "Consent scenarios", [
        "content",
        "accessibility",
      ]),
      createScenario(
        "Checkbox",
        "ConsentChecklistScenarios",
        "Consent checklist scenarios",
        ["interaction", "accessibility", "content"],
      ),
    ],
  },
  {
    component: "RadioGroup",
    fileName: "PublicRadioGroup.stories.ts",
    scenarios: [
      createScenario("RadioGroup", "DecisionSets", "Decision sets", [
        "composition",
        "content",
      ]),
      createScenario("RadioGroup", "KeyboardScenarios", "Keyboard scenarios", [
        "interaction",
        "accessibility",
      ]),
      createScenario(
        "RadioGroup",
        "DecisionBoundaryScenarios",
        "Decision boundary scenarios",
        ["interaction", "composition", "content"],
      ),
    ],
  },
  {
    component: "SegmentedControl",
    fileName: "PublicSegmentedControl.stories.ts",
    scenarios: [
      createScenario(
        "SegmentedControl",
        "ViewModeScenarios",
        "View mode scenarios",
        ["interaction", "density", "composition"],
      ),
      createScenario(
        "SegmentedControl",
        "DensityToggleScenarios",
        "Density toggle scenarios",
        ["density", "state", "accessibility"],
      ),
      createScenario(
        "SegmentedControl",
        "BoundaryScenarios",
        "Boundary scenarios",
        ["feedback", "composition", "content"],
      ),
    ],
  },
  {
    component: "Skeleton",
    fileName: "PublicSkeleton.stories.ts",
    scenarios: [
      createScenario("Skeleton", "Density", "Skeleton density", [
        "density",
        "state",
      ]),
      createScenario("Skeleton", "LoadingScenarios", "Loading scenarios", [
        "feedback",
        "composition",
      ]),
      createScenario(
        "Skeleton",
        "TransitionScenarios",
        "Transition scenarios",
        ["feedback", "state", "accessibility"],
      ),
    ],
  },
  {
    component: "Alert",
    fileName: "PublicAlert.stories.ts",
    scenarios: [
      createScenario("Alert", "Tones", "Alert tones", ["state", "feedback"]),
      createScenario("Alert", "RecoveryScenarios", "Recovery scenarios", [
        "composition",
        "accessibility",
      ]),
      createScenario(
        "Alert",
        "RepairPriorityScenarios",
        "Repair priority scenarios",
        ["feedback", "accessibility", "content"],
      ),
      createScenario("Alert", "DismissibleScenarios", "Dismissible scenarios", [
        "interaction",
        "accessibility",
        "feedback",
      ]),
      createScenario(
        "Alert",
        "FeedbackChainScenarios",
        "Feedback chain scenarios",
        ["feedback", "interaction", "content"],
      ),
    ],
  },
  {
    component: "Toast",
    fileName: "PublicToast.stories.ts",
    scenarios: [
      createScenario("Toast", "Tones", "Toast tones", ["state", "feedback"]),
      createScenario("Toast", "DismissalScenarios", "Dismissal scenarios", [
        "interaction",
        "accessibility",
      ]),
      createScenario("Toast", "ActionScenarios", "Action scenarios", [
        "interaction",
        "feedback",
        "accessibility",
      ]),
      createScenario(
        "Toast",
        "AlertBoundaryScenarios",
        "Alert boundary scenarios",
        ["feedback", "composition", "content"],
      ),
    ],
  },
  {
    component: "Divider",
    fileName: "PublicDivider.stories.ts",
    scenarios: [
      createScenario("Divider", "Alignments", "Divider alignments", [
        "density",
        "content",
      ]),
      createScenario("Divider", "SectionScenarios", "Section scenarios", [
        "accessibility",
        "composition",
        "content",
      ]),
      createScenario(
        "Divider",
        "RhythmBoundaryScenarios",
        "Rhythm boundary scenarios",
        ["composition", "content", "density"],
      ),
    ],
  },
] satisfies PublicComponentScenarioCoverage[]

export const publicComponentScenarioCoverageByName = new Map(
  publicComponentScenarioCoverage.map((item) => [item.component, item]),
)

export const publicComponentScenarioCount =
  publicComponentScenarioCoverage.reduce(
    (total, item) => total + item.scenarios.length,
    0,
  )

export const publicComponentReviewFocusCounts = Object.keys(
  publicComponentReviewFocusLabels,
).map((focus) => ({
  focus: focus as PublicComponentReviewFocus,
  label: publicComponentReviewFocusLabels[focus as PublicComponentReviewFocus],
  count: publicComponentScenarioCoverage.reduce(
    (total, item) =>
      total +
      item.scenarios.filter((scenario) =>
        scenario.reviewFocus.includes(focus as PublicComponentReviewFocus),
      ).length,
    0,
  ),
}))
