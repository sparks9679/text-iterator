import React, { useEffect, useMemo, useRef, useState } from 'react'
import { loadData, saveFolder, saveProject } from './utils/storage'

const createIteration = (n) => ({
  id: crypto.randomUUID(),
  label: `Draft ${n}`,
  content: '',
  createdAt: new Date().toISOString()
})

const createProject = () => {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Project',
    folderId: 'default',
    image: null,
    createdAt: now,
    updatedAt: now,
    iterations: [createIteration(1)]
  }
}

function App() {
  const [view, setView] = useState('home')
  const [projects, setProjects] = useState([])
  const [folders, setFolders] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveFolderId, setSaveFolderId] = useState('default')
  const [newFolderName, setNewFolderName] = useState('')
  const [toast, setToast] = useState('')
  const [expandedFolders, setExpandedFolders] = useState({})
  const columnsRef = useRef(null)

  useEffect(() => {
    const data = loadData()
    setProjects(data.projects)
    setFolders(data.folders)
    setExpandedFolders(Object.fromEntries(data.folders.map((f) => [f.id, true])))
  }, [])

  const hasUnsavedChanges = useMemo(() => {
    if (!activeProject) return false
    return JSON.stringify(activeProject) !== savedSnapshot
  }, [activeProject, savedSnapshot])

  const scrollToLatest = () => {
    requestAnimationFrame(() => {
      const el = columnsRef.current
      if (el) el.scrollLeft = el.scrollWidth
    })
  }

  const refreshData = () => {
    const data = loadData()
    setProjects(data.projects)
    setFolders(data.folders)
  }

  const openProject = (project) => {
    const normalized = {
      ...project,
      iterations: project.iterations?.length ? project.iterations : [createIteration(1)]
    }
    setActiveProject(normalized)
    setSavedSnapshot(JSON.stringify(normalized))
    setView('editor')
    scrollToLatest()
  }

  const createNewProject = () => {
    const project = createProject()
    setActiveProject(project)
    setSavedSnapshot(JSON.stringify(project))
    setView('editor')
  }

  const addIteration = () => {
    if (!activeProject) return
    const updated = { ...activeProject, iterations: [...activeProject.iterations, createIteration(activeProject.iterations.length + 1)] }
    setActiveProject(updated)
    scrollToLatest()
  }

  const updateIterationContent = (index, value) => {
    setActiveProject((prev) => {
      const next = structuredClone(prev)
      next.iterations[index].content = value
      return next
    })
  }

  const doSave = (project) => {
    const result = saveProject(project)
    if (!result.ok) {
      setToast(result.error)
      return false
    }
    setActiveProject(result.project)
    setSavedSnapshot(JSON.stringify(result.project))
    refreshData()
    setToast('Saved')
    setTimeout(() => setToast(''), 1800)
    return true
  }

  const handleSave = () => {
    if (!activeProject) return
    if (activeProject.name === 'Untitled Project') {
      setSaveName('')
      setSaveFolderId(activeProject.folderId || 'default')
      setShowSaveModal(true)
      return
    }
    doSave(activeProject)
  }

  const confirmSave = () => {
    if (!activeProject) return
    let folderId = saveFolderId
    if (newFolderName.trim()) {
      const folder = { id: crypto.randomUUID(), name: newFolderName.trim(), createdAt: new Date().toISOString() }
      saveFolder(folder)
      folderId = folder.id
    }
    const project = { ...activeProject, name: saveName.trim() || 'Untitled Project', folderId }
    if (doSave(project)) {
      setShowSaveModal(false)
      setNewFolderName('')
    }
  }

  const goHome = () => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Leave anyway?')) return
    setView('home')
    setActiveProject(null)
  }

  const onImageUpload = (file) => {
    if (!file || !activeProject) return
    const reader = new FileReader()
    reader.onload = () => {
      const image = String(reader.result)
      if (image.length > 2_000_000) setToast('Large image warning: over ~2MB in base64.')
      setActiveProject({ ...activeProject, image })
    }
    reader.readAsDataURL(file)
  }

  const groupedProjects = folders.map((folder) => ({ ...folder, projects: projects.filter((p) => p.folderId === folder.id) }))

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <h1 className="text-3xl font-semibold">Text Iterator</h1>
          {view === 'editor' && <div className="flex gap-2"><button onClick={goHome} className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">Back</button><button onClick={handleSave} className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Save</button></div>}
        </div>
      </header>

      {view === 'home' ? (
        <div className="mx-auto max-w-7xl px-6 py-8">
          <button onClick={createNewProject} className="mb-8 rounded-lg bg-blue-500 px-5 py-2.5 font-medium text-white hover:bg-blue-600">+ New Project</button>
          <div className="space-y-6">
            {groupedProjects.map((folder) => (
              <section key={folder.id}>
                <button onClick={() => setExpandedFolders((s) => ({ ...s, [folder.id]: !s[folder.id] }))} className="mb-2 flex items-center gap-2 font-semibold">
                  <span>{expandedFolders[folder.id] ? '▾' : '▸'}</span>{folder.name} <span className="text-xs text-gray-500">({folder.projects.length})</span>
                </button>
                {expandedFolders[folder.id] && <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{folder.projects.map((project) => <button key={project.id} onClick={() => openProject(project)} className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-blue-200"><div className="font-medium">{project.name}</div><div className="text-sm text-gray-500">{project.iterations.length} drafts • {new Date(project.updatedAt).toLocaleString()}</div></button>)}</div>}
              </section>
            ))}
          </div>
        </div>
      ) : (
        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-4 font-semibold text-xl">{activeProject?.name}</div>
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
            {activeProject?.image ? <div><img alt="Header" src={activeProject.image} className="max-h-[200px] w-full rounded-md object-cover" /><button onClick={() => setActiveProject({ ...activeProject, image: null })} className="mt-2 text-sm text-red-600">Remove image</button></div> : <label className="cursor-pointer text-sm text-blue-600">Upload image<input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e.target.files?.[0])} /></label>}
          </div>
          <div ref={columnsRef} className="flex gap-4 overflow-x-auto pb-8">
            {activeProject?.iterations.map((it, index) => (
              <article key={it.id} className="w-[340px] min-w-[340px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 font-medium">{it.label}</div>
                <textarea value={it.content} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px` }} onChange={(e) => updateIterationContent(index, e.target.value)} placeholder="Start writing your first draft..." className="min-h-[400px] w-full overflow-hidden rounded-md bg-gray-50 p-3 outline-none" />
                {index === activeProject.iterations.length - 1 && <button onClick={addIteration} className="mt-3 w-full rounded-md border border-dashed border-gray-300 py-2 text-sm text-gray-600">Next Draft →</button>}
              </article>
            ))}
          </div>
        </main>
      )}
      {showSaveModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="w-full max-w-md rounded-xl bg-white p-6"><h2 className="mb-3 text-lg font-semibold">Save project</h2><input value={saveName} onChange={(e) => setSaveName(e.target.value)} className="mb-3 w-full rounded border border-gray-300 p-2" placeholder="Project name" /><select value={saveFolderId} onChange={(e) => setSaveFolderId(e.target.value)} className="mb-3 w-full rounded border border-gray-300 p-2">{folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select><input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="mb-4 w-full rounded border border-gray-300 p-2" placeholder="Or create folder" /><div className="flex justify-end gap-2"><button onClick={() => setShowSaveModal(false)} className="rounded border px-3 py-2">Cancel</button><button onClick={confirmSave} className="rounded bg-blue-500 px-3 py-2 text-white">Save</button></div></div></div>}
      {toast && <div className="fixed bottom-4 right-4 rounded bg-gray-900 px-3 py-2 text-sm text-white">{toast}</div>}
    </div>
  )
}

export default App
