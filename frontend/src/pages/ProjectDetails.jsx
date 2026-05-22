import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Calendar, Check, Printer, Download } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import api from '../api/api'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ExpenseRow({ expense, fields, onChange, onSave, onDelete }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50 transition-colors"
    >
      {fields.map((field) => (
        <td key={field.key} className="px-4 py-3 text-sm text-slate-700">
          {field.type === 'input' ? (
            <input
              type={field.inputType}
              value={expense[field.key] || ''}
              onChange={(e) => onChange(expense.id, field.key, e.target.value)}
              className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-900 outline-none transition hover:bg-slate-100 focus:border-slate-300 focus:bg-white"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ) : (
            <span className="px-2 font-medium">{field.format ? field.format(expense[field.key]) : (expense[field.key] || '—')}</span>
          )}
        </td>
      ))}
      <td className="px-4 py-3 flex items-center justify-end gap-2">
        <button
          onClick={() => onSave(expense)}
          title="Save Row"
          className="rounded-xl bg-slate-950 px-3 py-1.5 text-white transition hover:bg-slate-800 flex items-center gap-1"
        >
          <Check size={14} /> Save
        </button>
        <button
          onClick={() => onDelete(expense)}
          title="Delete Row"
          className="rounded-xl bg-slate-100 px-3 py-1.5 text-slate-600 transition hover:bg-slate-200 flex items-center gap-1"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </motion.tr>
  )
}

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Data States
  const [project, setProject] = useState(null)
  const [payments, setPayments] = useState([])
  const [productExpenses, setProductExpenses] = useState([])
  const [serviceExpenses, setServiceExpenses] = useState([])
  
  // UI States
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, payments, products, services
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_date: new Date().toISOString().slice(0, 10) })

  // Refs for printing
  const printPaymentRef = useRef(null)
  const printProductRef = useRef(null)
  const printServiceRef = useRef(null)

  const fetchProject = async () => {
    const { data } = await api.get(`/projects/${id}`)
    setProject(data)
  }

  const fetchPayments = async () => {
    const { data } = await api.get(`/projects/${id}/payments`)
    setPayments(data || [])
  }

  const fetchProductExpenses = async () => {
    const { data } = await api.get(`/projects/${id}/expenses/products`)
    setProductExpenses(data.productExpenses || [])
  }

  const fetchServiceExpenses = async () => {
    const { data } = await api.get(`/projects/${id}/expenses/services`)
    setServiceExpenses(data.serviceExpenses || [])
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      await fetchProject()
      await Promise.all([fetchPayments(), fetchProductExpenses(), fetchServiceExpenses()])
    } catch (error) {
      console.error('Project details load failed', error)
      toast.error('Failed to load project details.')
      if (error.response?.status === 404) navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  // Payments Logic
  const handleAddPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.amount || !paymentForm.payment_date) return toast.error('Enter payment amount and date')
    try {
      await api.post(`/projects/${id}/payments`, {
        amount_received: Number(paymentForm.amount),
        payment_date: paymentForm.payment_date,
      })
      toast.success('Payment added')
      setPaymentForm({ amount: '', payment_date: new Date().toISOString().slice(0, 10) })
      await fetchPayments()
      await fetchProject()
    } catch {
      toast.error('Unable to save payment')
    }
  }

  const handleDeletePayment = async (payment) => {
    try {
      await api.delete(`/projects/${id}/payments/${payment.id}`)
      toast.success('Payment removed')
      await fetchPayments()
      await fetchProject()
    } catch {
      toast.error('Unable to delete payment')
    }
  }

  // Expense Table Logic
  const handleExpenseChange = (rowId, field, value, type) => {
    const updater = type === 'product' ? setProductExpenses : setServiceExpenses
    updater((prev) => prev.map((exp) => (exp.id === rowId ? { ...exp, [field]: value } : exp)))
  }

  const handleSaveExpense = async (expense, type) => {
    const endpoint = type === 'product' ? 'products' : 'services'
    
    let payload = {}
    if (type === 'product') {
      if (!expense.product_name || !expense.amount || !expense.expense_date) {
        return toast.error('Name, amount and date are required')
      }
      payload = {
        product_name: expense.product_name,
        quantity_text: expense.quantity_text || '1',
        amount: Number(expense.amount || 0),
        expense_date: expense.expense_date,
      }
    } else {
      if (!expense.name || !expense.amount || !expense.expense_date) {
        return toast.error('Name, amount and date are required')
      }
      payload = {
        name: expense.name,
        type: expense.type || '',
        amount: Number(expense.amount || 0),
        expense_date: expense.expense_date,
      }
    }

    try {
      if (expense.isNew) {
        const { data } = await api.post(`/projects/${id}/expenses/${endpoint}`, payload)
        toast.success('Row saved')
        if (type === 'product') {
          setProductExpenses((prev) => prev.filter((item) => item.id !== expense.id).concat(data))
        } else {
          setServiceExpenses((prev) => prev.filter((item) => item.id !== expense.id).concat(data))
        }
      } else {
        await api.put(`/projects/${id}/expenses/${endpoint}/${expense.id}`, payload)
        toast.success('Row updated')
        if (type === 'product') {
          await fetchProductExpenses()
        } else {
          await fetchServiceExpenses()
        }
      }
      await fetchProject()
    } catch (err) {
      console.error('Save expense error:', err)
      toast.error(err.response?.data?.message || 'Unable to save row')
    }
  }

  const handleDeleteExpense = async (expense, type) => {
    const updater = type === 'product' ? setProductExpenses : setServiceExpenses
    if (expense.isNew) {
      updater((prev) => prev.filter((item) => item.id !== expense.id))
      return
    }
    const endpoint = type === 'product' ? 'products' : 'services'
    try {
      await api.delete(`/projects/${id}/expenses/${endpoint}/${expense.id}`)
      toast.success('Row deleted')
      updater((prev) => prev.filter((item) => item.id !== expense.id))
      await fetchProject()
    } catch {
      toast.error('Unable to delete row')
    }
  }

  const handleAddRow = (type) => {
    const row = {
      id: `new-${Date.now()}`,
      amount: '',
      expense_date: new Date().toISOString().slice(0, 10),
      isNew: true,
    }
    if (type === 'product') {
      row.product_name = ''
      row.quantity_text = ''
      setProductExpenses((prev) => [row, ...prev])
    } else {
      row.name = ''
      row.type = ''
      setServiceExpenses((prev) => [row, ...prev])
    }
  }

  // PDF Export Logic
  const handleExportPDF = (title, columns, data) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text(title, 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Project: ${project?.project_name}`, 14, 30)
    doc.text(`Client: ${project?.client_name}`, 14, 36)
    doc.text(`Generated: ${fmtDate(new Date())}`, 14, 42)
    
    const tableData = data.map(item => columns.map(col => item[col.key] || ''))
    
    autoTable(doc, {
      startY: 50,
      head: [columns.map(col => col.label)],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }, // Slate 950
      styles: { fontSize: 10, cellPadding: 5 },
    })
    
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`)
  }

  // Print Handlers
  const printPayments = useReactToPrint({ content: () => printPaymentRef.current })
  const printProducts = useReactToPrint({ content: () => printProductRef.current })
  const printServices = useReactToPrint({ content: () => printServiceRef.current })

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 ml-60 flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </main>
      </div>
    )
  }

  if (!project) return null

  const totalExpenses = (project.total_expenses || 0)
  const remainingBalance = (project.total_received || 0) - totalExpenses

  const productFields = [
    { label: 'Product Name', key: 'product_name', type: 'input', inputType: 'text' },
    { label: 'Quantity', key: 'quantity_text', type: 'input', inputType: 'text' },
    { label: 'Amount (₹)', key: 'amount', type: 'input', inputType: 'number' },
    { label: 'Date', key: 'expense_date', type: 'input', inputType: 'date' },
  ]

  const serviceFields = [
    { label: 'Name', key: 'name', type: 'input', inputType: 'text' },
    { label: 'Type', key: 'type', type: 'input', inputType: 'text' },
    { label: 'Amount (₹)', key: 'amount', type: 'input', inputType: 'number' },
    { label: 'Date', key: 'expense_date', type: 'input', inputType: 'date' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'Client Payments' },
    { id: 'products', label: 'Product Expenses' },
    { id: 'services', label: 'Service Expenses' },
  ]

  return (
    <div className="flex min-h-screen bg-bg text-slate-950 font-sans">
      <Sidebar />
      <main className="flex-1 ml-60 flex flex-col h-screen overflow-hidden">
        {/* Workspace Header */}
        <header className="border-b border-slate-200 bg-white px-8 py-6 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Started {fmtDate(project.start_date)}</span>
            </div>
          </div>
          
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{project.project_name}</h1>
              <p className="mt-1 text-base text-slate-600">Client: {project.client_name} {project.client_phone ? `· ${project.client_phone}` : ''}</p>
            </div>
            
            <div className="flex gap-6 xl:gap-10 pb-1">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Total Received</p>
                <p className="text-2xl font-bold text-slate-800">{fmt(project.total_received)}</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Expenses</p>
                <p className="text-2xl font-bold text-rose-600">{fmt(totalExpenses)}</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Balance</p>
                <p className="text-2xl font-bold text-emerald-600">{fmt(remainingBalance)}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex items-center gap-8 border-b border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab.id ? 'text-slate-950' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950" />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Tab Content - Scrollable Area */}
        <div className="flex-1 overflow-auto bg-slate-50/50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="max-w-3xl space-y-8">
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Workspace Overview</h2>
                    <p className="text-slate-600 leading-relaxed">
                      This is your dedicated workspace for <strong>{project.project_name}</strong>. 
                      Navigate through the tabs above to manage Client Payments, Product Expenses, and Service Expenses.
                      <br/><br/>
                      The tables are designed for fast, spreadsheet-style data entry. You can edit inline, add new rows quickly, and export your data to PDF for reporting.
                    </p>
                  </div>
                </div>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Client Payments Log</h2>
                      <p className="text-sm text-slate-500 mt-1">Record payments received from the client.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleExportPDF('Client Payments', [{label:'Date', key:'payment_date'}, {label:'Amount', key:'amount_received'}], payments)} className="btn-outline flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold">
                        <Download size={16} /> PDF
                      </button>
                      <button onClick={printPayments} className="btn-outline flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold">
                        <Printer size={16} /> Print
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50/50 border-b border-slate-200">
                    <form onSubmit={handleAddPayment} className="flex flex-wrap items-end gap-4 max-w-3xl">
                      <div className="flex-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Amount Received (₹)</label>
                        <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm(p => ({...p, amount: e.target.value}))} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500" placeholder="0" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Date</label>
                        <input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm(p => ({...p, payment_date: e.target.value}))} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500" />
                      </div>
                      <button type="submit" className="rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shrink-0">
                        Record Payment
                      </button>
                    </form>
                  </div>

                  <div className="flex-1 overflow-auto p-0" ref={printPaymentRef}>
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white sticky top-0 border-b border-slate-200 z-10 shadow-sm">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <AnimatePresence>
                          {payments.map(payment => (
                            <motion.tr key={payment.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">{fmtDate(payment.payment_date)}</td>
                              <td className="px-6 py-4 text-sm font-bold text-emerald-600">{fmt(payment.amount_received || payment.amount)}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeletePayment(payment)} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={14} /> Remove
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Product Expenses Tracker</h2>
                      <p className="text-sm text-slate-500 mt-1">Spreadsheet for materials and products.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleExportPDF('Product Expenses', productFields, productExpenses)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold">
                        <Download size={16} /> PDF
                      </button>
                      <button onClick={printProducts} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold">
                        <Printer size={16} /> Print
                      </button>
                      <button onClick={() => handleAddRow('product')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 text-sm font-semibold shadow-md">
                        <Plus size={16} /> Add Row
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto bg-white" ref={printProductRef}>
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          {productFields.map(f => (
                            <th key={f.key} className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{f.label}</th>
                          ))}
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <AnimatePresence>
                          {productExpenses.map((expense) => (
                            <ExpenseRow
                              key={expense.id}
                              expense={expense}
                              fields={productFields}
                              onChange={(rowId, key, value) => handleExpenseChange(rowId, key, value, 'product')}
                              onSave={(row) => handleSaveExpense(row, 'product')}
                              onDelete={(row) => handleDeleteExpense(row, 'product')}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Service Expenses Tracker</h2>
                      <p className="text-sm text-slate-500 mt-1">Spreadsheet for labor, contractors, and services.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleExportPDF('Service Expenses', serviceFields, serviceExpenses)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold">
                        <Download size={16} /> PDF
                      </button>
                      <button onClick={printServices} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold">
                        <Printer size={16} /> Print
                      </button>
                      <button onClick={() => handleAddRow('service')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 text-sm font-semibold shadow-md">
                        <Plus size={16} /> Add Row
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto bg-white" ref={printServiceRef}>
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          {serviceFields.map(f => (
                            <th key={f.key} className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">{f.label}</th>
                          ))}
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <AnimatePresence>
                          {serviceExpenses.map((expense) => (
                            <ExpenseRow
                              key={expense.id}
                              expense={expense}
                              fields={serviceFields}
                              onChange={(rowId, key, value) => handleExpenseChange(rowId, key, value, 'service')}
                              onSave={(row) => handleSaveExpense(row, 'service')}
                              onDelete={(row) => handleDeleteExpense(row, 'service')}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
