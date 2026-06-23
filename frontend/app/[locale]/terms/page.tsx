import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Smart Inverter's",
  description: "Terms and conditions for purchasing and servicing Terranova inverters through Smart Inverter's.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-3xl px-4 flex items-center gap-3">
          <FileText className="h-7 w-7 text-blue-300" />
          <h1 className="text-4xl font-extrabold">Terms &amp; Conditions</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700">
          <p className="text-sm text-gray-400">Last updated: June 2025</p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. General</h2>
            <p className="text-sm leading-relaxed">
              By accessing and using the Smart Inverter&apos;s website and services, you agree to be bound by
              these Terms &amp; Conditions. Smart Inverter&apos;s is a trade name of Mani Agencies, an authorized
              dealer of Terranova LiFePO4 products operating in Andhra Pradesh.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Products &amp; Pricing</h2>
            <ul className="text-sm leading-relaxed list-disc list-inside space-y-2">
              <li>All prices displayed are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.</li>
              <li>Prices are subject to change without prior notice.</li>
              <li>Product availability is subject to stock and may vary.</li>
              <li>Product images are for illustration purposes and actual appearance may vary slightly.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Orders &amp; Payment</h2>
            <p className="text-sm leading-relaxed">
              Orders placed on this website are subject to confirmation by our team. We reserve the right to
              cancel any order in case of pricing errors or stock unavailability. Payment must be completed
              before dispatch. We accept UPI, bank transfer, and cash on delivery (COD) for eligible areas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Warranty</h2>
            <p className="text-sm leading-relaxed">
              Terranova products carry a manufacturer warranty as specified on the product page (typically 5 years
              on battery). Warranty claims are processed through Mani Agencies. Warranty does not cover physical
              damage, improper installation, or use beyond rated capacity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Service Bookings</h2>
            <p className="text-sm leading-relaxed">
              Service bookings are subject to technician availability. We will confirm your appointment within
              24 hours of booking. Emergency service is available 24/7 at additional charges. Cancellations
              must be made at least 2 hours before the scheduled appointment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Returns &amp; Refunds</h2>
            <p className="text-sm leading-relaxed">
              Products may be returned within 7 days of delivery if they are in original, unused condition
              with packaging intact. Refunds are processed within 7–10 business days after inspection.
              Installation charges are non-refundable. Contact us at 9133639888 to initiate a return.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              Smart Inverter&apos;s / Mani Agencies shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of our products or services. Our total liability
              shall not exceed the purchase price of the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Governing Law</h2>
            <p className="text-sm leading-relaxed">
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of courts in East Godavari District, Andhra Pradesh.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-sm leading-relaxed">
              For any questions about these terms, contact us:<br />
              Mani Agencies (Smart Inverter&apos;s), Ravulapalem, East Godavari, AP<br />
              Email:{" "}
              <a href="mailto:maniagency.rvpm@gmail.com" className="text-blue-600 hover:underline">
                maniagency.rvpm@gmail.com
              </a>{" "}
              | Phone:{" "}
              <a href="tel:9133639888" className="text-blue-600 hover:underline">9133639888</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
