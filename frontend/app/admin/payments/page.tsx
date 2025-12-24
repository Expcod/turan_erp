"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { DataTable } from "@/components/ui/data-table"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Modal } from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Check, X, Loader2 } from "lucide-react"
import { paymentsApi, type Payment as ApiPayment } from "@/lib/api"

interface Payment {
  id: string
  student: string
  group: string
  amount: string
  method: "cash" | "card" | "payme"
  date: string
  status: "pending" | "confirmed" | "rejected"
}

export default function PaymentsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentsApi.getAll().catch(() => [])
      const data = Array.isArray(response) ? response : []
      const mapped = data.map((p: ApiPayment) => ({
        id: String(p.id),
        student: p.student_name || `Student #${p.student}`,
        group: p.group_name || `Group #${p.group}`,
        amount: `${p.amount?.toLocaleString()} UZS`,
        method: p.method,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
        status: p.status,
      }))
      setPayments(mapped)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (status: "confirmed" | "rejected") => {
    if (!selectedPayment) return
    setConfirmLoading(true)
    try {
      await paymentsApi.confirm(Number(selectedPayment.id), status)
      setIsConfirmModalOpen(false)
      setSelectedPayment(null)
      fetchPayments()
    } catch (error) {
      console.error("Failed to confirm payment:", error)
    } finally {
      setConfirmLoading(false)
    }
  }

  const statusMap = {
    pending: { type: "pending" as const, label: t("payments.pending") },
    confirmed: { type: "success" as const, label: t("payments.confirmed") },
    rejected: { type: "error" as const, label: t("payments.rejected") },
  }

  const methodLabels = {
    cash: t("payments.cash"),
    card: t("payments.card"),
    payme: t("payments.payme"),
  }

  const columns = [
    { key: "student", header: t("payments.student") },
    { key: "group", header: t("payments.group") },
    { key: "amount", header: t("payments.amount") },
    {
      key: "method",
      header: t("payments.method"),
      render: (item: Payment) => <span className="capitalize">{methodLabels[item.method]}</span>,
    },
    { key: "date", header: t("payments.date") },
    {
      key: "status",
      header: t("payments.status"),
      render: (item: Payment) => (
        <StatusBadge status={statusMap[item.status].type}>{statusMap[item.status].label}</StatusBadge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: Payment) =>
        item.status === "pending" ? (
          <div className="flex items-center gap-1">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPayment(item)
                setIsConfirmModalOpen(true)
              }}
            >
              <Check size={16} className="text-green-600" />
            </GlassButton>
            <GlassButton variant="ghost" size="sm">
              <X size={16} className="text-red-500" />
            </GlassButton>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">-</span>
        ),
    },
  ]

  const filteredPayments = payments.filter((payment) =>
    payment.student.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("admin.payments")}</h1>
          <p className="text-slate-500 mt-1">{t("admin.paymentList")}</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <GlassInput
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredPayments}
          currentPage={currentPage}
          totalPages={5}
          onPageChange={setCurrentPage}
          emptyMessage={t("common.noData")}
        />

        {/* Confirm Payment Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={t("admin.confirmPayment")}
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">{t("payments.student")}</p>
                    <p className="font-medium text-slate-700">{selectedPayment.student}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("payments.amount")}</p>
                    <p className="font-medium text-slate-700">{selectedPayment.amount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("payments.method")}</p>
                    <p className="font-medium text-slate-700 capitalize">{methodLabels[selectedPayment.method]}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("payments.date")}</p>
                    <p className="font-medium text-slate-700">{selectedPayment.date}</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-600">Are you sure you want to confirm this payment?</p>
              <div className="flex justify-end gap-3 pt-2">
                <GlassButton variant="ghost" onClick={() => setIsConfirmModalOpen(false)} disabled={confirmLoading}>
                  {t("common.cancel")}
                </GlassButton>
                <GlassButton 
                  variant="ghost" 
                  onClick={() => handleConfirmPayment("rejected")} 
                  disabled={confirmLoading}
                  className="text-red-600"
                >
                  <X size={16} className="mr-1" />
                  {t("payments.rejected")}
                </GlassButton>
                <GlassButton variant="primary" onClick={() => handleConfirmPayment("confirmed")} disabled={confirmLoading}>
                  {confirmLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check size={16} className="mr-1" />}
                  {t("common.confirm")}
                </GlassButton>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}
