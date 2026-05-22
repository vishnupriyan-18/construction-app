import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Package, Wrench, Phone, Calendar, Wallet, Check, Printer, Download, LayoutGrid } from 'lucide-react'
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
    <tr className="border-b border-slate-200 last:border-b-0">
      {fields.map((field) => (
        <td key={field.key} className="px-4 py-3 text-sm text-slate-700">
          {field.type === 'input' ? (
            <input
              type={field.inputType}
              value={expense[field.key] || ''}
              onChange={(e) => onChange(expense.id, field.key, e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
            />
          ) : (
            <span>{expense[field.key] || '—'}</span>
          )}
        </td>
      ))}
      <td className="px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => onSave(expense)}
          className="rounded-2xl bg-slate-950 px-3 py-2 text-white transition hover:bg-slate-800"
        >
          <Check size={16} />
        </button>
        <button
          onClick={() => onDelete(expense)}
          className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  )
}

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef(null)
  const [project, setProject] = useState(null)
  const [payments, setPayments] = useState([])
  const [productExpenses, setProductExpenses] = useState([])
  const [serviceExpenses, setServiceExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_date: '' })

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
      const message = error.response?.data?.message || 'Failed to load project details.'
      toast.error(message)
      if (error.response?.status === 404) {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  const handleAddPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.amount || !paymentForm.payment_date) {
      toast.error('Enter payment amount and date')
      return
    }

    try {
      await api.post(`/projects/${id}/payments`, {
        amount_received: Number(paymentForm.amount),
        payment_date: paymentForm.payment_date,
      })
      toast.success('Payment added')
      setPaymentForm({ amount: '', payment_date: '' })
      await fetchPayments()
      await fetchProject()
    } catch (error) {
      console.error('Save payment failed', error)
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

  const handleExpenseChange = (id, field, value, type) => {
    const updater = type === 'product' ? setProductExpenses : setServiceExpenses
    updater((prev) => prev.map((expense) => (expense.id === id ? { ...expense, [field]: value } : expense)))
  }

  const handleSaveExpense = async (expense, type) => {
    const endpoint = type === 'product' ? 'products' : 'services'
    const payload = {
      item_name: expense.item_name,
      amount: Number(expense.amount || 0),
      expense_date: expense.expense_date,
    }

    if (type === 'product') {
      payload.quantity = Number(expense.quantity || 0)
    } else {
      payload.service_type = expense.service_type
    }

    try {
      if (expense.isNew) {
        const { data } = await api.post(`/projects/${id}/expenses/${endpoint}`, payload)
        toast.success('Expense added')
        if (type === 'product') {
          setProductExpenses((prev) => prev.filter((item) => item.id !== expense.id).concat(data))
        } else {
          setServiceExpenses((prev) => prev.filter((item) => item.id !== expense.id).concat(data))
        }
      } else {
        await api.put(`/projects/${id}/expenses/${endpoint}/${expense.id}`, payload)
        toast.success('Expense updated')
      }
      await fetchProject()
      if (type === 'product') {
        await fetchProductExpenses()
      } else {
        await fetchServiceExpenses()
      }
    } catch {
      toast.error('Unable to save expense')
    }
  }

  const handleDeleteExpense = async (expense, type) => {
    if (expense.isNew) {
      if (type === 'product') {
        setProductExpenses((prev) => prev.filter((item) => item.id !== expense.id))
      } else {
        setServiceExpenses((prev) => prev.filter((item) => item.id !== expense.id))
      }
      return
    }

    const endpoint = type === 'product' ? 'products' : 'services'
    try {
      await api.delete(`/projects/${id}/expenses/${endpoint}/${expense.id}`)
      toast.success('Expense removed')
      if (type === 'product') {
        await fetchProductExpenses()
      } else {
        await fetchServiceExpenses()
      }
      await fetchProject()
    } catch {
      toast.error('Unable to delete expense')
    }
  }

  const handleAddRow = (type) => {
    const row = {
      id: `new-${Date.now()}`,
      item_name: '',
      amount: '',
      expense_date: new Date().toISOString().slice(0, 10),
      quantity: type === 'product' ? 1 : undefined,
      service_type: type === 'service' ? '' : undefined,
      isNew: true,
    }
    if (type === 'product') {
      setProductExpenses((prev) => [row, ...prev])
    } else {
      setServiceExpenses((prev) => [row, ...prev])
    }
  }

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

  if (!project) {
    return (
      <div className="flex min-h-screen bg-bg text-slate-950">
        <Sidebar />
        <main className="flex-1 ml-60 flex items-center justify-center py-24 px-6">
          <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Unable to load project details.</p>
            <p className="mt-3 text-sm text-slate-500">Please check your network connection or return to the dashboard.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  const totalExpenses = (project.total_expenses || 0)
  const remainingBalance = (project.total_received || 0) - totalExpenses

  const paymentFields = [
    { label: 'Amount (₹)', key: 'amount', inputType: 'number' },
    { label: 'Payment Date', key: 'payment_date', inputType: 'date' },
  ]

  const productFields = [
    { label: 'Item', key: 'item_name', type: 'input', inputType: 'text' },
    { label: 'Qty', key: 'quantity', type: 'input', inputType: 'number' },
    { label: 'Amount', key: 'amount', type: 'input', inputType: 'number' },
    { label: 'Date', key: 'expense_date', type: 'input', inputType: 'date' },
  ]

  const serviceFields = [
    { label: 'Service', key: 'item_name', type: 'input', inputType: 'text' },
    { label: 'Type', key: 'service_type', type: 'input', inputType: 'text' },
    { label: 'Amount', key: 'amount', type: 'input', inputType: 'number' },
    { label: 'Date', key: 'expense_date', type: 'input', inputType: 'date' },
  ]

  return (
    <div className="flex min-h-screen bg-bg text-slate-950">
      <Sidebar />
      <main className="flex-1 ml-60 px-6 py-8 lg:px-10 lg:py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Back to dashboard
            </button>
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Project overview</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{project.project_name}</h1>
                  <p className="mt-3 text-sm text-slate-600">{project.client_name} · {project.client_phone || 'No phone provided'}</p>
                  <p className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                    <Calendar size={16} /> {fmtDate(project.start_date)}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Received</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{fmt(project.total_received)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Expenses</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{fmt(totalExpenses)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Remaining</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{fmt(remainingBalance)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-900">Client Payments</p>
                  <p className="mt-1 text-sm text-slate-500">A clean running log of payments received.</p>
                </div>
                <form onSubmit={handleAddPayment} className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Amount</label>
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Date</label>
                    <input
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Save Payment
                    </button>
                  </div>
                </form>

                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-[0.18em]">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500">
                            No payments recorded yet.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id} className="border-t border-slate-200">
                            <td className="px-4 py-4 text-sm text-slate-700">{fmtDate(payment.payment_date)}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-950">{fmt(payment.amount_received ?? payment.amount)}</td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleDeletePayment(payment)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Product Expenses</p>
                    <p className="mt-1 text-sm text-slate-500">Track material purchases in one spreadsheet-style table.</p>
                  </div>
                  <button
                    onClick={() => handleAddRow('product')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus size={16} /> New Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-3xl border border-slate-200">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-[0.18em]">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                            No product expenses yet.
                          </td>
                        </tr>
                      ) : (
                        productExpenses.map((expense) => (
                          <ExpenseRow
                            key={expense.id}
                            expense={expense}
                            fields={productFields}
                            onChange={(rowId, key, value) => handleExpenseChange(rowId, key, value, 'product')}
                            onSave={(row) => handleSaveExpense(row, 'product')}
                            onDelete={(row) => handleDeleteExpense(row, 'product')}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Service Expenses</p>
                    <p className="mt-1 text-sm text-slate-500">Manage onsite labor, subcontractor, and service costs.</p>
                  </div>
                  <button
                    onClick={() => handleAddRow('service')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus size={16} /> New Row
                  </button>
                </div>
                <div className="overflow-x-auto rounded-3xl border border-slate-200">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-[0.18em]">
                      <tr>
                        <th className="px-4 py-3">Service</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                            No service expenses yet.
                          </td>
                        </tr>
                      ) : (
                        serviceExpenses.map((expense) => (
                          <ExpenseRow
                            key={expense.id}
                            expense={expense}
                            fields={serviceFields}
                            onChange={(rowId, key, value) => handleExpenseChange(rowId, key, value, 'service')}
                            onSave={(row) => handleSaveExpense(row, 'service')}
                            onDelete={(row) => handleDeleteExpense(row, 'service')}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
