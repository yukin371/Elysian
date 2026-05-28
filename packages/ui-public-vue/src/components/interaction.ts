export const getLoopedIndex = (
  currentIndex: number,
  total: number,
  delta: number,
) => {
  if (total <= 0) {
    return -1
  }

  return (currentIndex + delta + total) % total
}

export const getDirectionalSelectionIndex = (
  currentIndex: number,
  total: number,
  key: string,
) => {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return getLoopedIndex(currentIndex, total, 1)
    case "ArrowLeft":
    case "ArrowUp":
      return getLoopedIndex(currentIndex, total, -1)
    case "Home":
      return total > 0 ? 0 : -1
    case "End":
      return total > 0 ? total - 1 : -1
    default:
      return null
  }
}

export const getDirectionalTabIndex = (
  currentIndex: number,
  total: number,
  key: string,
) => getDirectionalSelectionIndex(currentIndex, total, key)

export const shouldCloseDialogForKey = (key: string) => key === "Escape"
