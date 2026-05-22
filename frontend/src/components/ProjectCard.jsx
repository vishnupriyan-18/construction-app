import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, IndianRupee } from 'lucide-react'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProjectCard({ project, index }) {
  const navigate = useNavigate()
  const remaining = project.balance ?? ((project.total_received || 0) - (project.total_expenses || 0))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/project/${project.id}`)}
      className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-slate-950 text-base font-semibold truncate">{project.project_name}</h3>
          <p className="mt-1 text-sm text-slate-500 truncate">{project.client_name}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.08em] text-slate-600">Live</div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Received</p>
          <p className="mt-3 text-lg font-semibold text-slate-900 flex items-center gap-2">
            <IndianRupee size={14} /> {fmt(project.total_received)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Expenses</p>
          <p className="mt-3 text-lg font-semibold text-slate-900 flex items-center gap-2">
            <IndianRupee size={14} /> {fmt(project.total_expenses)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Remaining</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{fmt(remaining)}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Calendar size={14} />
          {fmtDate(project.start_date)}
        </div>
      </div>
    </motion.div>
  )
}
