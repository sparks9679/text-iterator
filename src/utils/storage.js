// src/utils/storage.js

const STORAGE_KEY = 'text-iterator-data'

export function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  
  // Initialize defaults
  const defaultData = {
    folders: [
      { id: 'default', name: 'General', createdAt: new Date().toISOString() }
    ],
    projects: []
  }
  saveData(defaultData)
  return defaultData
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
    alert('Storage full or unavailable. Could not save.')
  }
}

export function getProjects() {
  const data = loadData()
  return data.projects
}

export function saveProject(project) {
  const data = loadData()
  const index = data.projects.findIndex(p => p.id === project.id)
  if (index >= 0) {
    data.projects[index] = { ...project, updatedAt: new Date().toISOString() }
  } else {
    data.projects.push({ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  }
  saveData(data)
  return project
}

export function deleteProject(id) {
  const data = loadData()
  data.projects = data.projects.filter(p => p.id !== id)
  saveData(data)
}

export function getFolders() {
  const data = loadData()
  return data.folders
}

export function saveFolder(folder) {
  const data = loadData()
  const index = data.folders.findIndex(f => f.id === folder.id)
  if (index >= 0) {
    data.folders[index] = folder
  } else {
    data.folders.push(folder)
  }
  saveData(data)
}