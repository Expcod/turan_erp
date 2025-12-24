"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Modal } from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/status-badge"
import { CreditCard, Wallet, CheckCircle, Clock, XCircle, ExternalLink, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { paymentsApi, authApi, groupsApi, Payment as ApiPayment } from "@/lib/api"

interface PaymentRecord {
  id: number
  amount: number
  month: string
  status: "confirmed" | "pending" | "rejected"
  method: "payme" | "cash" | "card"
  date: string
  transactionId?: string
}

export default function StudentPaymentsPage() {
  const { t, language } = useI18n()
  const [statusFilter, setStatusFilter] = useState("all")
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [groupName, setGroupName] = useState<string>("")
  const [monthlyFee, setMonthlyFee] = useState<number>(0)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user
        const currentUser = await authApi.getCurrentUser()
        
        // Fetch payments
        const paymentsResponse = await paymentsApi.getAll()
        
        // Ensure array
        const paymentsData: ApiPayment[] = Array.isArray(paymentsResponse) 
          ? paymentsResponse 
          : (paymentsResponse as any)?.results || []
        
        // Filter only current student's payments
        const studentPayments = paymentsData.filter((p: ApiPayment) => p.student === currentUser.id)
        
        // Map to payment records
        const mappedPayments: PaymentRecord[] = studentPayments.map((p: ApiPayment) => {
          // Determine status
          let status: "confirmed" | "pending" | "rejected" = "pending"
          if (p.status === "confirmed") {
            status = "confirmed"
          } else if (p.status === "rejected") {
            status = "rejected"
          }
          
          // Use paid_date if available, otherwise due_date
          const paymentDate = p.paid_date || p.due_date
          const month = new Date(paymentDate).toISOString().slice(0, 7)
          
          return {
            id: p.id,
            amount: p.amount,
            month,
            status,
            method: p.method,
            date: paymentDate,
            transactionId: undefined // Backend doesn't have transaction_id yet
          }
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setPayments(mappedPayments)
        
        // Try to get group info for monthly fee
        try {
          const groupsResponse = await groupsApi.getAll()
          const groupsData = Array.isArray(groupsResponse) ? groupsResponse : (groupsResponse as any)?.results || []
          
          if (groupsData.length > 0) {
            const firstGroup = groupsData[0]
            setGroupName(firstGroup.name)
            setMonthlyFee(firstGroup.monthly_fee || 500000)
          }
        } catch (err) {
          console.error('Groups fetch error:', err)
          setMonthlyFee(500000) // Default fee
        }
        
      } catch (err) {
        console.error('Payments fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchPayments()
  }, [t])

  const filteredPayments = statusFilter === "all" ? payments : payments.filter((p) => p.status === statusFilter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "payme":
        return <CreditCard className="w-4 h-4" />
      case "cash":
        return <Wallet className="w-4 h-4" />
      case "card":
        return <CreditCard className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS"
  }

  const handlePayWithPayme = () => {
    // In real app, redirect to Payme
    window.open("https://payme.uz", "_blank")
    setShowPayModal(false)
  }

  // Calculate next payment due date
  const getNextPaymentDue = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString().split('T')[0]
  }

  const getDaysUntilDue = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const diff = nextMonth.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const upcomingMonths = [
    { 
      value: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 7), 
      label: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: 'long', year: 'numeric' })
    },
    { 
      value: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 7), 
      label: new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: 'long', year: 'numeric' })
    },
  ]

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">{t("common.loading")}</span>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-muted-foreground">{error}</p>
          <GlassButton 
            variant="ghost" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t("common.back")}
          </GlassButton>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("payments.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("payments.history")}</p>
        </div>

        {/* Subscription Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">{t("payments.monthlyFee")}</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(monthlyFee)}</p>
            <p className="text-sm text-muted-foreground mt-1">{groupName || t("common.noData")}</p>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">{t("payments.next")}</span>
            </div>
            <p className="text-2xl font-bold">{getNextPaymentDue()}</p>
            <p className="text-sm text-yellow-600 mt-1">{getDaysUntilDue()} {language === 'uz' ? 'kun qoldi' : 'gün kaldı'}</p>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">{t("payments.payNow")}</span>
            </div>
            <GlassButton className="w-full" onClick={() => setShowPayModal(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              {t("payments.payWithPayme")}
            </GlassButton>
          </GlassCard>
        </div>

        {/* Filter */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t("payments.history")}</h2>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="w-48 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t("status.all")}</option>
            <option value="confirmed">{t("payments.confirmed")}</option>
            <option value="pending">{t("student.pending")}</option>
            <option value="rejected">{t("actions.reject")}</option>
          </select>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 && (
            <GlassCard className="p-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("common.noData")}</p>
            </GlassCard>
          )}
          {filteredPayments.map((payment) => (
            <GlassCard key={payment.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.status === "confirmed"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : payment.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                      <StatusBadge
                        status={
                          payment.status === "confirmed"
                            ? "success"
                            : payment.status === "pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {payment.status === "confirmed" 
                          ? t("payments.confirmed") 
                          : payment.status === "rejected" 
                          ? t("actions.reject") 
                          : t("student.pending")}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.month + "-01").toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getMethodIcon(payment.method)}
                    <span className="capitalize">{payment.method}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{payment.date}</div>
                  {payment.transactionId && (
                    <div className="text-xs text-muted-foreground font-mono">{payment.transactionId}</div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Payment Modal */}
        <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title={t("payments.payWithPayme")} size="md">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("payments.selectMonth")}</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="mt-2 w-full px-4 py-2 rounded-xl bg-background/50 backdrop-blur-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t("payments.selectMonth")}</option>
                {upcomingMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("payments.amount")}</span>
                <span className="text-xl font-bold">{formatCurrency(monthlyFee)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="flex items-start gap-3">
                <CreditCard className="w-8 h-8 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  {language === 'uz' 
                    ? "Payme orqali xavfsiz to'lov qiling. Siz Payme ilovasiga yo'naltirilasiz."
                    : "Payme üzerinden güvenli ödeme yapın. Payme uygulamasına yönlendirileceksiniz."}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <GlassButton variant="ghost" className="flex-1" onClick={() => setShowPayModal(false)}>
                {t("common.cancel")}
              </GlassButton>
              <GlassButton className="flex-1" onClick={handlePayWithPayme} disabled={!selectedMonth}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("payments.payNow")}
              </GlassButton>
            </div>
          </div>
        </Modal>
      </div>
    </StudentLayout>
  )
}
