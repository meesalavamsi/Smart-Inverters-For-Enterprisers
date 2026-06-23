import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Smart Inverter's",
  description: "Privacy policy for Smart Inverter's — Terranova authorized dealer in Andhra Pradesh.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-3xl px-4 flex items-center gap-3">
          <Shield className="h-7 w-7 text-blue-300" />
          <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700">
          <p className="text-sm text-gray-400">Last updated: June 2025</p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed">
              We collect information you provide directly to us, such as your name, phone number, email address,
              and delivery address when you place an order, book a service, or register an account. We also collect
              information about your interactions with our website including pages visited and products viewed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="text-sm leading-relaxed list-disc list-inside space-y-2">
              <li>To process orders and deliver products to you</li>
              <li>To schedule and confirm service bookings</li>
              <li>To send order updates and service notifications via SMS/WhatsApp</li>
              <li>To respond to your queries and issue reports</li>
              <li>To improve our website and customer experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing of Information</h2>
            <p className="text-sm leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your
              information with our service technicians solely to fulfil your service booking. We may disclose
              information if required by law or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against
              unauthorized access, alteration, disclosure, or destruction. Passwords are stored in hashed form
              and are never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies</h2>
            <p className="text-sm leading-relaxed">
              Our website uses essential cookies to maintain your session and preferences. We do not use
              third-party advertising cookies. You can disable cookies in your browser settings, though
              some features of the site may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-sm leading-relaxed">
              You may request access to, correction of, or deletion of your personal data at any time by
              contacting us at{" "}
              <a href="mailto:maniagency.rvpm@gmail.com" className="text-blue-600 hover:underline">
                maniagency.rvpm@gmail.com
              </a>{" "}
              or calling{" "}
              <a href="tel:9133639888" className="text-blue-600 hover:underline">9133639888</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              For any privacy-related questions, contact Mani Agencies (Smart Inverter&apos;s):<br />
              Indira Colony, Daggara, Ravulapalem, East Godavari, Andhra Pradesh<br />
              Email: maniagency.rvpm@gmail.com | Phone: 9133639888
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
