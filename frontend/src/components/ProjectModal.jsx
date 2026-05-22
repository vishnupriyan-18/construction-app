import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/api'

const initialForm = {
  project_name: '',
  client_name: '',
  client_phone: '',
  start_date: '',
}

export default function ProjectModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm(initialForm)
  }, [open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/projects', form)
      toast.success('Project created!')
      onSuccess(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 bg-slate-950/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="w-full max-w-lg rounded-[32px] bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-950">New Project</p>
                <p className="text-sm text-slate-500">Add a project with only essential details.</p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Project Name</label>
                <input
                  name="project_name"
                  type="text"
                  placeholder="e.g. Lotus Apartments"
                  value={form.project_name}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Client Name</label>
                  <input
                    name="client_name"
                    type="text"
                    placeholder="Client full name"
                    value={form.client_name}
                    onChange={handleChange}
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Client Phone</label>
                  <input
                    name="client_phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.client_phone}
                    onChange={handleChange}
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Start Date</label>
                <input
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
