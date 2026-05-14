import React, { useState, useEffect } from 'react'
import { loadData, saveProject, getProjects, getFolders, saveFolder } from './utils/storage'

function App() {
  const [view, setView] = useState('home')
  const [activeProject, setActiveProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [folders, setFolders] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveFolderId, setSaveFolderId] = useState('default')
  const [newFolderName, setNewFolderName] = useState('')

  // Load data on mount
  useEffect(() => {
    const data = loadData()
    setProjects(data.projects)
    setFolders(data.folders)
  }, [])

  const openProject = (project) => {
    setActiveProject(project)
    setView('editor')
    // Scroll to right after render
    setTimeout(() => {
      const container = document.getElementById('columns-container')
      if (container) container.scrollLeft = container.scrollWidth
    }, 50)
  }

  const createNewProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: 'Untitled Project',
      folderId: 'default',
      iterations: [{
        id: Date.now().toString(),
        label: 'Draft 1',
        content: '',
        createdAt: new Date().toISOString()
      }],
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setActiveProject(newProject)
    setView('editor')
  }

  const addIteration = () => {
    if (!activeProject) return
    const newIter = {
      id: Date.now().toString(),
      label: `Draft ${activeProject.iterations.length + 1}`,
      content: '',
      createdAt: new Date().toISOString()
    }
    const updated = {
      ...activeProject,
      iterations: [...activeProject.iterations, newIter]
    }
    setActiveProject(updated)
  }

  const updateIterationContent = (index, newContent) => {
    if (!activeProject) return
    const newIters = [...activeProject.iterations]
    newIters[index].content = newContent
    setActiveProject({ ...activeProject, iterations: newIters })
  }

  const handleSave = () => {
    if (!activeProject) return
    if (!activeProject.name || activeProject.name === 'Untitled Project') {
      setSaveName(activeProject.name || 'My Project')
      setShowSaveModal(true)
    } else {
      // Quick save
      const saved = saveProject(activeProject)
      setActiveProject(saved)
      // Refresh list
      const data = loadData()
      setProjects(data.projects)
    }
  }

  const confirmSave = () => {
    if (!activeProject || !saveName.trim()) return

    let folderId = saveFolderId
    if (newFolderName.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        createdAt: new Date().toISOString()
      }
      saveFolder(newFolder)
      folderId = newFolder.id
      setFolders([...folders, newFolder])
    }

    const projectToSave = {
      ...activeProject,
      name: saveName.trim(),
      folderId
    }

    const saved = saveProject(projectToSave)
    setActiveProject(saved)
    setShowSaveModal(false)
    setNewFolderName('')

    // Refresh lists
    const data = loadData()
    setProjects(data.projects)
    setFolders(data.folders)
  }

  const goHome = () => {
    if (activeProject) {
      const hasUnsaved = activeProject.iterations.some(i => i.content.trim() !== '')
      if (hasUnsaved && !confirm('You have unsaved changes. Leave anyway?')) {
        return
      }
    }
    setView('home')
    setActiveProject(null)
  }

  // Group projects by folder
  const groupedProjects = folders.map(folder => ({
    ...folder,
    projects: projects.filter(p => p.folderId === folder.id)
  }))

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">Text Iterator</h1>
          {view === 'editor' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={goHome}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                ← Back
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save
              </button>
            </div>
          )}
        </header>

        {view === 'home' ? (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-medium text-gray-800">Your Projects</h2>
                <p className="text-gray-500 text-sm mt-1">Organized by folder</p>
              </div>
              <button 
                onClick={createNewProject}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm"
              >
                + New Project
              </button>
            </div>

            {groupedProjects.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-400">No projects yet. Create your first one!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedProjects.map(folder => (
                  <div key={folder.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="font-semibold text-gray-700 text-lg">{folder.name}</div>
                      <div className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{folder.projects.length}</div>
                    </div>
                    
                    {folder.projects.length === 0 ? (
                      <div className="text-sm text-gray-400 pl-1">No projects in this folder</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {folder.projects.map(project => (
                          <div 
                            key={project.id}
                            onClick={() => openProject(project)}
                            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">{project.name}</div>
                            <div className="text-sm text-gray-500">
                              {project.iterations.length} drafts • Last edited {new Date(project.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Editing</div>
                <div className="font-semibold text-2xl">{activeProject?.name}</div>
              </div>
            </div>

            {/* Optional image header placeholder for future */}
            {activeProject?.image && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <img src={activeProject.image} alt="Header" className="w-full max-h-[220px] object-cover" />
              </div>
            )}

            <div 
              id="columns-container"
              className="flex gap-5 overflow-x-auto pb-12 snap-x snap-mandatory"
            >
              {activeProject?.iterations?.map((iteration, index) => (
                <div 
                  key={iteration.id} 
                  className="column bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex-shrink-0 snap-start"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold text-gray-700">{iteration.label}</div>
                    <div className="text-[10px] text-gray-400">{new Date(iteration.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>
                  
                  <textarea
                    className="w-full min-h-[420px] p-5 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-[15px] leading-relaxed bg-[#fafafa]"
                    placeholder="Write your draft here..."
                    value={iteration.content}
                    onChange={(e) => updateIterationContent(index, e.target.value)}
                  />
                  
                  {index === activeProject.iterations.length - 1 && (
                    <button
                      onClick={addIteration}
                      className="mt-4 w-full py-3 border border-dashed border-gray-300 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2 transition-all"
                    >
                      + Add next draft
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-gray-400 mt-4">
              Scroll horizontally to compare drafts • Latest draft is on the right
            </div>
          </div>
        )}

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setShowSaveModal(false)}>
            <div 
              className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-8"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-6">Save Project</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Project name</label>
                  <input 
                    type="text" 
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-lg"
                    placeholder="My Facebook Post"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Folder</label>
                  <select 
                    value={saveFolderId} 
                    onChange={(e) => setSaveFolderId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Or create new folder</label>
                  <input 
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="New folder name"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => {
                    setShowSaveModal(false)
                    setNewFolderName('')
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmSave}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

export default App