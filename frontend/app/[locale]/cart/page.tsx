"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package, MessageCircle, CreditCard, ShieldCheck } from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { ordersApi, paymentsApi } from "@/lib/api";
import { formatCurrency, getWhatsAppUrl, getProductImageSrc } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const checkoutSchema = z.object({
  recipientName: z.string().min(2, "Name is required"),
  doorNo: z.string().min(2, "Door No / Street is required"),
  mandal: z.string().min(2, "Mandal is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  landmark: z.string().min(2, "Landmark is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { recipientName: user?.name || "", phone: user?.phone || "", state: "Andhra Pradesh" },
  });

  useEffect(() => {
    if (user) reset((prev) => ({ ...prev, recipientName: prev.recipientName || user.name, phone: prev.phone || user.phone || "" }));
  }, [user, reset]);

  // Opens Razorpay checkout and resolves with the verified payment response once paid
  const collectPayment = () => {
    return new Promise<{ razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }>((resolve, reject) => {
      paymentsApi.createOrder(totalPrice).then((res) => {
        const { orderId, amount, currency, keyId } = res.data;
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: "Smart Inverter's",
          description: "Smart Inverter's purchase",
          order_id: orderId,
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: "#16a34a" },
          handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => resolve(response),
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rzp.on("payment.failed", (response) => {
          toast.error(response.error?.description || "Payment failed. Please try again.");
          reject(new Error("Payment failed"));
        });
        rzp.open();
      }).catch(() => reject(new Error("Could not start payment")));
    });
  };

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
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Could not load payment gateway. Please try again or contact us on WhatsApp.");
        return;
      }

      let paymentResponse;
      try {
        paymentResponse = await collectPayment();
      } catch (err) {
        if (err instanceof Error && err.message === "Payment cancelled") {
          toast.info("Payment cancelled — your order was not placed.");
        }
        return;
      }

      // Payment succeeded — now create the order and mark it paid
      const shippingAddress = `${data.doorNo}, ${data.mandal}, ${data.district}, ${data.state}, Near ${data.landmark} - ${data.pincode}\nRecipient: ${data.recipientName}, Phone: ${data.phone}`;
      const res = await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        shippingAddress,
        paymentMethod: "RAZORPAY",
        notes: data.notes || "",
        totalAmount: totalPrice,
      });
      const orderNumber = res.data.data?.orderNumber || "ORDER";
      const dbOrderId = res.data.data?.id;

      try {
        await paymentsApi.verify({ ...paymentResponse, orderId: dbOrderId });
      } catch {
        toast.error("Payment succeeded but we couldn't confirm it automatically — we'll verify manually, please contact us.");
      }

      clearCart();
      setOrdered(orderNumber);
      toast.success("Payment successful — order placed!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; code?: string };
      const msg = error?.response?.data?.message;
      if (error?.code === "ECONNABORTED" || !error?.response) {
        toast.error("Payment was successful, but we couldn't save your order — please contact us on WhatsApp with your payment details.");
      } else {
        toast.error(msg || "Payment was successful, but we couldn't save your order — please contact us on WhatsApp with your payment details.");
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
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-mono font-extrabold text-green-700">{ordered}</p>
          </div>
          <div className="space-y-3">
            <Link href={`/invoice/${ordered}`}
              className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors text-center">
              View / Download Invoice
            </Link>
            <Link href="/order-tracking"
              className="block w-full border-2 border-green-600 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition-colors text-center">
              Track My Order
            </Link>
            <a
              href={getWhatsAppUrl(`Hi! I just placed an order: ${ordered}. Please confirm and let me know the delivery details.`)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" /> Confirm on WhatsApp
            </a>
            <Link href="/products" className="block text-center text-sm text-green-600 hover:underline">
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
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
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
          <button onClick={() => router.back()} className="text-gray-500 hover:text-green-600">
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
                  <p className="text-green-700 font-bold">{formatCurrency(item.price)}</p>
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
              <div className="bg-green-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <hr className="border-green-200 mb-2" />
                <div className="flex justify-between font-extrabold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-green-700">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="mb-4 space-y-3">
                <label className="text-xs font-bold text-gray-700 block -mb-1">Delivery Details *</label>

                <div>
                  <input
                    {...register("recipientName")}
                    placeholder="Full Name *"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  {errors.recipientName && <p className="text-red-500 text-xs mt-1">{errors.recipientName.message}</p>}
                </div>

                <div>
                  <input
                    {...register("doorNo")}
                    placeholder="Door No / Street / Area *"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  {errors.doorNo && <p className="text-red-500 text-xs mt-1">{errors.doorNo.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      {...register("mandal")}
                      placeholder="Mandal *"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {errors.mandal && <p className="text-red-500 text-xs mt-1">{errors.mandal.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register("pincode")}
                      placeholder="Pincode *"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      {...register("district")}
                      placeholder="District *"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register("state")}
                      placeholder="State *"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>

                <div>
                  <input
                    {...register("landmark")}
                    placeholder="Landmark *"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  {errors.landmark && <p className="text-red-500 text-xs mt-1">{errors.landmark.message}</p>}
                </div>

                <div>
                  <input
                    {...register("phone")}
                    placeholder="Phone Number *"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Payment */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 mb-2 block">Payment</label>
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-3">
                  <CreditCard className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Pay Online — Cards / UPI / Netbanking</p>
                    <p className="text-xs text-gray-500 mt-0.5">Secure checkout via Razorpay. Your order is placed only after payment succeeds.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Payments are encrypted and processed securely by Razorpay
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 mb-1 block">Notes (optional)</label>
                <input
                  {...register("notes")}
                  placeholder="Any special instructions..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
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
                className="w-full bg-green-600 text-white font-extrabold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {placing ? "Processing Payment..." : `Pay ${formatCurrency(totalPrice)} & Place Order`}
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
