"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package, MessageCircle, Smartphone, Building2 } from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { ordersApi } from "@/lib/api";
import { formatCurrency, getWhatsAppUrl, getProductImageSrc } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(20, "Please enter a complete address (min 20 characters)"),
  paymentMethod: z.enum(["UPI", "BANK_TRANSFER"]),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [ordered, setOrdered] = useState<string | null>(null);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "UPI" },
  });
  const selectedPayment = watch("paymentMethod");

  const handleOrder = async (data: CheckoutForm) => {
    if (!user) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }
    setPlacing(true);
    // Wake up the backend before placing (Render free tier sleeps after 15 min)
    try { await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/health`); } catch { /* ignore */ }
    try {
      const res = await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        notes: data.notes || "",
        totalAmount: totalPrice,
      });
      const orderNumber = res.data.data?.orderNumber || "ORDER";
      clearCart();
      setOrdered(orderNumber);
      toast.success("Order placed successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; code?: string };
      const msg = error?.response?.data?.message;
      if (error?.code === "ECONNABORTED" || !error?.response) {
        toast.error("Server is waking up — please wait 30 seconds and try again.");
      } else {
        toast.error(msg || "Failed to place order. Please try again.");
      }
    } finally {
      setPlacing(false);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full mx-4"
        >
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Package className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-3">Your order has been received and is being processed.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-mono font-extrabold text-blue-700">{ordered}</p>
          </div>
          <div className="space-y-3">
            <Link href="/order-tracking"
              className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-center">
              Track My Order
            </Link>
            <a
              href={getWhatsAppUrl(`Hi! I just placed an order: ${ordered}. Please confirm and let me know the delivery details.`)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" /> Confirm on WhatsApp
            </a>
            <Link href="/products" className="block text-center text-sm text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add products to your cart to place an order</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-blue-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">Your Cart ({items.length} items)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.productId || `cart-item-${idx}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
              >
                <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  {item.image ? (
                    <img src={getProductImageSrc(item.image)}
                      alt={item.name} className="h-full w-full object-contain rounded-xl" />
                  ) : (
                    <Package className="h-8 w-8 text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-blue-700 font-bold">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="font-bold text-gray-900 w-24 text-right shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>

                <button onClick={() => removeItem(item.productId)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div>
            <form onSubmit={handleSubmit(handleOrder)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-extrabold text-gray-900 mb-4">Order Summary</h3>

              {/* Total */}
              <div className="bg-blue-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <hr className="border-blue-200 mb-2" />
                <div className="flex justify-between font-extrabold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-700">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 mb-1 block">Delivery Address *</label>
                <textarea
                  {...register("shippingAddress")}
                  rows={3}
                  placeholder="House No, Street, Area, City, Pincode..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                {errors.shippingAddress && (
                  <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>
                )}
              </div>

              {/* Payment */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 mb-2 block">Payment Method</label>
                <div className="space-y-2">

                  {/* UPI */}
                  <label className={`flex items-start gap-3 cursor-pointer rounded-xl border px-3 py-2.5 transition-colors ${selectedPayment === "UPI" ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-200"}`}>
                    <input type="radio" {...register("paymentMethod")} value="UPI" className="mt-0.5 accent-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-800">UPI / Google Pay / PhonePe</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Instant digital payment</p>
                    </div>
                  </label>

                  {/* UPI details — shown when UPI is selected */}
                  {selectedPayment === "UPI" && (
                    <div className="rounded-xl border border-blue-200 bg-white p-4">
                      <p className="text-xs font-bold text-gray-600 mb-3 text-center">Pay via UPI — search by phone number</p>
                      <div className="bg-blue-50 rounded-xl p-3 mb-3 text-center">
                        <p className="text-2xl font-extrabold text-blue-700 tracking-widest mb-0.5">9951447358</p>
                        <p className="text-sm font-semibold text-gray-700">Mani Prasad Rotte</p>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 text-center">Open any UPI app → Send money → Enter the number above</p>
                      <div className="flex justify-center gap-2 mb-3">
                        {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                          <span key={app} className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">{app}</span>
                        ))}
                      </div>
                      <p className="text-xs text-orange-600 font-medium text-center">After payment, confirm your order on WhatsApp with your transaction ID</p>
                    </div>
                  )}

                  {/* Net Banking */}
                  <label className={`flex items-start gap-3 cursor-pointer rounded-xl border px-3 py-2.5 transition-colors ${selectedPayment === "BANK_TRANSFER" ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-green-200"}`}>
                    <input type="radio" {...register("paymentMethod")} value="BANK_TRANSFER" className="mt-0.5 accent-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-semibold text-gray-800">Net Banking / NEFT / RTGS</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Direct bank transfer</p>
                    </div>
                  </label>

                  {/* Bank details — shown when Bank Transfer is selected */}
                  {selectedPayment === "BANK_TRANSFER" && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm space-y-1.5">
                      <p className="font-bold text-green-800 mb-2">Bank Transfer Details</p>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Account Name</span><span className="font-semibold text-gray-800">Smart Inverter&apos;s</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Account No.</span><span className="font-semibold text-gray-800 font-mono">— (shared on WhatsApp)</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">IFSC Code</span><span className="font-semibold text-gray-800 font-mono">— (shared on WhatsApp)</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Bank</span><span className="font-semibold text-gray-800">— (shared on WhatsApp)</span></div>
                      <p className="text-xs text-orange-600 font-medium pt-1">Place your order — we will send full bank details on WhatsApp immediately</p>
                    </div>
                  )}

                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 mb-1 block">Notes (optional)</label>
                <input
                  {...register("notes")}
                  placeholder="Any special instructions..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-700">
                  Please <Link href="/login" className="font-bold underline">login</Link> to place an order
                </div>
              )}

              <button
                type="submit"
                disabled={placing || !user}
                className="w-full bg-blue-600 text-white font-extrabold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {placing ? "Placing Order..." : `Place Order — ${formatCurrency(totalPrice)}`}
              </button>

              <a
                href={getWhatsAppUrl(`Hi! I want to order: ${items.map(i => `${i.name} x${i.quantity}`).join(", ")}. Total: ₹${totalPrice}. Please confirm availability.`)}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
