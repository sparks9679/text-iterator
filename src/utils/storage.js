const STORAGE_KEY = 'text-iterator-data'

const defaultRoot = () => ({
  folders: [{ id: 'default', name: 'General', createdAt: new Date().toISOString() }],
  projects: []
})

const normalize = (data) => {
  const folders = Array.isArray(data?.folders) ? data.folders : []
  const projects = Array.isArray(data?.projects) ? data.projects : []
  if (!folders.some((f) => f.id === 'default')) {
    folders.unshift({ id: 'default', name: 'General', createdAt: new Date().toISOString() })
  }
  return { folders, projects }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const defaults = defaultRoot()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
      return defaults
    }
    return normalize(JSON.parse(raw))
  } catch {
    return defaultRoot()
  }
}

export function saveData(data) {
  try {
    const normalized = normalize(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: 'Storage full or unavailable. Could not save.' }
  }
}

export function saveProject(project) {
  const data = loadData()
  const now = new Date().toISOString()
  const idx = data.projects.findIndex((p) => p.id === project.id)
  const nextProject = idx >= 0
    ? { ...project, createdAt: data.projects[idx].createdAt || project.createdAt || now, updatedAt: now }
    : { ...project, createdAt: project.createdAt || now, updatedAt: now }

  if (idx >= 0) data.projects[idx] = nextProject
  else data.projects.push(nextProject)

  const result = saveData(data)
  return result.ok ? { ok: true, project: nextProject } : result
}

export function saveFolder(folder) {
  const data = loadData()
  const idx = data.folders.findIndex((f) => f.id === folder.id)
  if (idx >= 0) data.folders[idx] = folder
  else data.folders.push(folder)
  return saveData(data)
}
