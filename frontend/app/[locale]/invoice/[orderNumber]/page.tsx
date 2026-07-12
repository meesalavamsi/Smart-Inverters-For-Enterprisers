"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Printer, Zap, Loader2, XCircle } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string; model: string };
}

interface Order {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  totalAmount: number;
  items: OrderItem[];
  user?: { name: string; email: string };
}

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const orderNumber = params.orderNumber as string;
    ordersApi.track(orderNumber).then((res) => {
      setOrder(res.data.data);
    }).catch(() => {
      setNotFound(true);
    }).finally(() => setLoading(false));
  }, [params.orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Invoice not found</p>
          <Link href="/order-tracking" className="text-green-600 hover:underline text-sm mt-2 inline-block">
            Track an order instead →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 print:pt-0 print:bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8 print:p-0">
        {/* Actions (hidden when printing) */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link href="/order-tracking" className="text-sm text-gray-500 hover:text-green-600">← Back to Order Tracking</Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>

        {/* Invoice sheet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-0 print:rounded-none">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-lg text-gray-900">Smart Inverter&apos;s</p>
                <p className="text-xs text-gray-500">Indira Colony (Near Community Hall)<br />Ravulapalem, Andhra Pradesh, India</p>
                <p className="text-xs text-gray-500 mt-1">9133639888 · maniagency.rvpm@gmail.com</p>
                <p className="text-xs text-gray-500 mt-1">GSTIN: 37DBKPR7589M1ZD</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-extrabold text-gray-900">INVOICE</h1>
              <p className="text-sm text-gray-500 mt-1">Order #</p>
              <p className="font-mono font-bold text-green-700">{order.orderNumber}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Bill to + status */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-semibold text-gray-900">{order.user?.name}</p>
              <p className="text-sm text-gray-500">{order.user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">{order.shippingAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
              <p className="text-sm text-gray-700">{order.paymentMethod}</p>
              <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-semibold ${PAYMENT_STATUS_STYLE[order.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mt-6 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-2">Item</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{item.product?.name}</p>
                    {item.product?.model && <p className="text-xs text-gray-400">Model: {item.product.model}</p>}
                  </td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mt-4">
            <div className="w-56">
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-green-700 text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Thank you for choosing Smart Inverter&apos;s — Authorized Terranova Distributor.</p>
            <p className="mt-1">This is a computer-generated invoice. For queries call 9133639888.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
