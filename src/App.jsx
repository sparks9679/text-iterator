import React, { useState } from 'react'

function App() {
  const [view, setView] = useState('home')
  const [activeProject, setActiveProject] = useState(null)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-gray-900">Text Iterator</h1>
        </div>
      </header>

      {view === 'home' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium text-gray-800">Your Projects</h2>
            <button 
              onClick={() => {
                const newProject = {
                  id: Date.now().toString(),
                  name: 'Untitled Project',
                  folderId: 'default',
                  iterations: [{ id: '1', label: 'Draft 1', content: '', createdAt: new Date().toISOString() }],
                  image: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                setActiveProject(newProject)
                setView('editor')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Project
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No projects yet. Create your first one!</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setView('home')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div className="font-medium text-lg">{activeProject?.name || 'Untitled'}</div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-8">
            {activeProject?.iterations?.map((iter, index) => (
              <div key={iter.id} className="column bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="font-medium text-sm text-gray-500 mb-3">{iter.label}</div>
                <textarea 
                  className="w-full min-h-[400px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-[15px] leading-relaxed"
                  placeholder="Start writing..."
                  value={iter.content}
                  onChange={(e) => {
                    const newIters = [...activeProject.iterations]
                    newIters[index].content = e.target.value
                    setActiveProject({...activeProject, iterations: newIters})
                  }}
                />
                {index === activeProject.iterations.length - 1 && (
                  <button 
                    onClick={() => {
                      const newIter = {
                        id: Date.now().toString(),
                        label: `Draft ${activeProject.iterations.length + 1}`,
                        content: '',
                        createdAt: new Date().toISOString()
                      }
                      setActiveProject({
                        ...activeProject,
                        iterations: [...activeProject.iterations, newIter]
                      })
                    }}
                    className="mt-3 w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    + Add next draft
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App