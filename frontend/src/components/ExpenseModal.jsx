import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/api'

const productForm = { item_name: '', quantity: '', amount: '', expense_date: '' }
const serviceForm = { item_name: '', service_type: '', amount: '', expense_date: '' }

export default function ExpenseModal({ open, onClose, projectId, onSuccess }) {
  const [category, setCategory] = useState('Product')
  const [form, setForm] = useState(productForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setCategory('Product')
      setForm(productForm)
    }
  }, [open])

  useEffect(() => {
    setForm(category === 'Product' ? productForm : serviceForm)
  }, [category])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, category }
      const { data } = await api.post(`/projects/${projectId}/expenses`, payload)
      toast.success('Expense added!')
      onSuccess(data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Receipt size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">Add Expense</h2>
                  <p className="text-gray-600 text-xs">Record a new expense entry</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Category toggle */}
              <div>
                <label className="block text-gray-500 text-xs mb-1.5">Category</label>
                <div className="flex bg-[#0a0a0a] border border-[#222222] rounded-xl p-1">
                  {['Product', 'Service'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        category === cat
                          ? 'bg-white text-black'
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {category === 'Product' ? (
                  <motion.div
                    key="product"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-500 text-xs mb-1.5">Product Name</label>
                      <input
                        name="item_name"
                        type="text"
                        placeholder="e.g. Cement bags"
                        value={form.item_name}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-500 text-xs mb-1.5">Quantity</label>
                        <input
                          name="quantity"
                          type="number"
                          placeholder="0"
                          min="0"
                          value={form.quantity}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-xs mb-1.5">Amount (₹)</label>
                        <input
                          name="amount"
                          type="number"
                          placeholder="0"
                          min="0"
                          value={form.amount}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1.5">Date</label>
                      <input
                        name="expense_date"
                        type="date"
                        value={form.expense_date}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="service"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-500 text-xs mb-1.5">Service Name</label>
                      <input
                        name="item_name"
                        type="text"
                        placeholder="e.g. Labour work"
                        value={form.item_name}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1.5">Service Type</label>
                      <input
                        name="service_type"
                        type="text"
                        placeholder="e.g. Electrical, Plumbing"
                        value={form.service_type}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-500 text-xs mb-1.5">Amount (₹)</label>
                        <input
                          name="amount"
                          type="number"
                          placeholder="0"
                          min="0"
                          value={form.amount}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-xs mb-1.5">Date</label>
                        <input
                          name="expense_date"
                          type="date"
                          value={form.expense_date}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm text-gray-500 border border-[#222222] hover:text-white hover:border-[#333333] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
