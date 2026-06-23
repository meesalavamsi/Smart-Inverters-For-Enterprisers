"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const trackOrder = async () => {
    if (!orderNumber.trim()) { toast.error("Please enter an order number"); return; }
    setLoading(true);
    setNotFound(false);
    try {
      const res = await ordersApi.track(orderNumber.trim());
      setOrder(res.data.data);
    } catch {
      setOrder(null);
      setNotFound(true);
    } finally { setLoading(false); }
  };

  const currentStep = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : -1;
  const isCancelled = order?.status === "CANCELLED" || order?.status === "RETURNED";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-4xl font-extrabold mb-2">Order Tracking</h1>
          <p className="text-blue-200">Enter your order number to track your delivery</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Order Number</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. SI-ABC123-DEF"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                onKeyDown={e => e.key === "Enter" && trackOrder()}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button onClick={trackOrder} disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </div>
        </div>

        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="font-semibold text-red-700">Order not found</p>
              <p className="text-red-500 text-sm mt-1">Please check the order number and try again</p>
            </motion.div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Order info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="text-xl font-extrabold text-blue-700">{order.orderNumber}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                    isCancelled ? "bg-red-100 text-red-700" :
                    order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                    "bg-yellow-100 text-yellow-700"}`}>
                    {order.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Customer</p>
                    <p className="font-semibold text-gray-900">{order.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-extrabold text-blue-700">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Progress tracker */}
              {!isCancelled && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6">Delivery Progress</h3>
                  <div className="relative">
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                    <div className="space-y-6">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= currentStep;
                        const current = i === currentStep;
                        return (
                          <div key={step.key} className="flex items-center gap-4 relative">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all ${
                              done ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-400"
                            } ${current ? "ring-4 ring-blue-100" : ""}`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${done ? "text-gray-900" : "text-gray-400"}`}>
                                {step.label}
                              </p>
                              {current && <p className="text-xs text-blue-600 mt-0.5">Current status</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Ordered Items</h3>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-blue-700 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-gray-100">
                  <p className="font-bold text-gray-900">Total</p>
                  <p className="font-extrabold text-blue-700 text-lg">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-5 text-center">
          <p className="text-sm text-blue-700 font-medium">Need help with your order?</p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="tel:7207762577" className="text-blue-600 font-semibold text-sm hover:underline">📞 7207762577</a>
            <a href="https://wa.me/917207762577" target="_blank" rel="noopener noreferrer"
              className="text-green-600 font-semibold text-sm hover:underline">💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
