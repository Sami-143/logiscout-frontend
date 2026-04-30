export const SELECTED_PROJECT_STORAGE_KEY = "selectedProject"

export interface StoredSelectedProject {
  id: string
  name?: string
}

function isStoredSelectedProject(value: unknown): value is StoredSelectedProject {
  return typeof value === "object" && value !== null && typeof (value as StoredSelectedProject).id === "string"
}

export function getStoredSelectedProject(): StoredSelectedProject | null {
  if (typeof window === "undefined") return null

  const storedProject = localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)
  if (!storedProject) return null

  try {
    const parsed = JSON.parse(storedProject) as unknown
    return isStoredSelectedProject(parsed) ? parsed : null
  } catch {
    localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
    return null
  }
}

export function setStoredSelectedProject(project: StoredSelectedProject) {
  if (typeof window === "undefined") return
  localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, JSON.stringify(project))
}

export function clearStoredSelectedProject() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
}
