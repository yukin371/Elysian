import { onMounted, onUnmounted } from "vue"

interface WorkbenchShortcutOptions {
  onSearch: () => void
  onClosePanel: () => void
  onNavigateUp: () => void
  onNavigateDown: () => void
  onEdit: () => void
  onCreate: () => void
  onDelete: () => void
}

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = (el as HTMLElement).tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable
  )
}

export function useWorkbenchShortcuts(options: WorkbenchShortcutOptions) {
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "/" && !isInputFocused()) {
      e.preventDefault()
      options.onSearch()
    }
    if (e.key === "Escape") {
      options.onClosePanel()
    }
    if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault()
      options.onNavigateUp()
    }
    if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault()
      options.onNavigateDown()
    }
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault()
      options.onEdit()
    }
    if (e.key === "n" && !isInputFocused() && !e.ctrlKey && !e.metaKey) {
      options.onCreate()
    }
    if (e.key === "Delete" && !isInputFocused()) {
      options.onDelete()
    }
  }

  onMounted(() => document.addEventListener("keydown", handleKeydown))
  onUnmounted(() => document.removeEventListener("keydown", handleKeydown))
}
