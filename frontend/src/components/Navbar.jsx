import { BellRing, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ search, setSearch, logout }) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-glass backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Welcome back</p>
        <h1 className="text-3xl font-semibold text-white">Construction Projects</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-[320px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects, client, notes"
            className="w-full rounded-full border border-white/10 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-400 hover:text-sky-300"
        >
          <BellRing className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
