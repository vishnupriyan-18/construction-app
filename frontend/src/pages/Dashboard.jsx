import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wallet, Receipt, ShieldCheck, Folder } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import api from '../api/api'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const StatCard = ({ icon: Icon, label, value, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <Icon size={20} />
      </div>
    </div>
  </motion.div>
)

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [summary, setSummary] = useState({ totalReceived: 0, totalExpenseAmount: 0, remainingBalance: 0, activeProjectsCount: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects)
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to load projects', error)
      toast.error('Unable to load projects. Check your connection or login status.')
      setProjects([])
      setSummary({ totalReceived: 0, totalExpenseAmount: 0, remainingBalance: 0, activeProjectsCount: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleProjectCreated = () => {
    fetchProjects()
  }

  const user = JSON.parse(localStorage.getItem('erp_user') || '{}')

  return (
    <div className="flex min-h-screen bg-bg text-slate-950">
      <Sidebar />
      <main className="flex-1 ml-60 px-6 py-8 lg:px-10 lg:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-sm text-slate-500">Welcome back,</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{user.full_name || 'Builder'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">Track client payment collections, project spending, and remaining balances from a single premium workspace.</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-4 mb-10">
            <StatCard icon={Receipt} label="Total Received" value={fmt(summary.totalReceived)} index={0} />
            <StatCard icon={ShieldCheck} label="Total Expenses" value={fmt(summary.totalExpenseAmount)} index={1} />
            <StatCard icon={Wallet} label="Remaining Balance" value={fmt(summary.remainingBalance)} index={2} />
            <StatCard icon={Folder} label="Active Projects" value={summary.activeProjectsCount} index={3} />
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Your projects</p>
              <p className="mt-1 text-sm text-slate-500">Minimal overview for quick action.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200/40 transition hover:bg-slate-800"
            >
              <Plus size={18} /> New Project
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">Loading projects…</div>
          ) : projects.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">No projects yet</p>
              <p className="mt-2 text-sm">Create a project to begin tracking your cashflow.</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ProjectModal open={showModal} onClose={() => setShowModal(false)} onSuccess={handleProjectCreated} />
    </div>
  )
}
