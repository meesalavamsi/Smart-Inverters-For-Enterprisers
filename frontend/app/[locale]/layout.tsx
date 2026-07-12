import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import OfferTicker from "@/components/layout/OfferTicker";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ChatBot from "@/components/ui/ChatBot";
import SpecialOfferPopup from "@/components/ui/SpecialOfferPopup";

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <OfferTicker />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ChatBot />
      <SpecialOfferPopup />
      <Toaster position="top-right" richColors closeButton />
    </NextIntlClientProvider>
  );
}
