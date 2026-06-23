"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

const MANAGER_WA_NUMBER = "919133639888";

const FAQS = [
  {
    q_en: "What types of inverters do you sell?",
    q_te: "మీరు ఏ రకమైన ఇన్వర్టర్లు అమ్ముతారు?",
    a_en: "We are the authorized distributors of Terranova lithium inverters — 1kV, 2kV, 3kV and 5kV models with inbuilt LiFePO4 battery. Zero maintenance, 5-year warranty.",
    a_te: "మేము Terranova లిథియం ఇన్వర్టర్ల అధికారిక పంపిణీదారులం — 1kV, 2kV, 3kV మరియు 5kV మోడల్స్, LiFePO4 బ్యాటరీతో. నిర్వహణ అవసరం లేదు, 5 సంవత్సరాల వారంటీ.",
  },
  {
    q_en: "What is the warranty on batteries?",
    q_te: "బ్యాటరీలకు వారంటీ ఎంత?",
    a_en: "All Terranova lithium inverters come with 5 years warranty on the battery and 2 years warranty on electronics. No other brand matches this.",
    a_te: "అన్ని Terranova లిథియం ఇన్వర్టర్లకు బ్యాటరీపై 5 సంవత్సరాల వారంటీ మరియు ఎలక్ట్రానిక్స్‌పై 2 సంవత్సరాల వారంటీ ఉంటుంది.",
  },
  {
    q_en: "Do you provide home installation?",
    q_te: "మీరు ఇంట్లో ఇన్స్టాలేషన్ చేస్తారా?",
    a_en: "Yes! We provide free installation for all products purchased from us. Our technician will visit your home within 24 hours.",
    a_te: "అవును! మా వద్ద కొన్న అన్ని ఉత్పత్తులకు ఉచిత ఇన్స్టాలేషన్ అందిస్తాము. మా టెక్నీషియన్ 24 గంటల్లో మీ ఇంటికి వస్తారు.",
  },
  {
    q_en: "What are your working hours?",
    q_te: "మీ పని వేళలు ఏమిటి?",
    a_en: "Office: Monday–Saturday 9:00 AM to 10:00 PM. Sunday is a holiday. Emergency service is available 24/7.",
    a_te: "కార్యాలయం: సోమవారం–శనివారం 9:00 AM నుండి 10:00 PM వరకు. ఆదివారం సెలవు. అత్యవసర సేవ 24/7 అందుబాటులో ఉంటుంది.",
  },
  {
    q_en: "Which areas do you serve?",
    q_te: "మీరు ఏ ప్రాంతాలలో సేవలు అందిస్తారు?",
    a_en: "We serve all major cities in Andhra Pradesh and Telangana, including Ravulapalem, Rajahmundry, Kakinada, Hyderabad, Warangal and more.",
    a_te: "మేము ఆంధ్రప్రదేశ్ మరియు తెలంగాణలోని అన్ని ప్రధాన నగరాల్లో సేవలు అందిస్తాము — రావులపాలెం, రాజమహేంద్రవరం, కాకినాడ, హైదరాబాద్, వరంగల్ మరియు మరిన్ని.",
  },
  {
    q_en: "How do I book a service?",
    q_te: "సేవని ఎలా బుక్ చేయాలి?",
    a_en: "You can book a service online via our website (Service Booking page) or call/WhatsApp us at 9133639888 or 9951447358.",
    a_te: "మీరు మా వెబ్‌సైట్ ద్వారా ఆన్‌లైన్‌లో (Service Booking పేజీ ద్వారా) లేదా 9133639888 లేదా 9951447358 కి కాల్/WhatsApp ద్వారా బుక్ చేసుకోవచ్చు.",
  },
  {
    q_en: "What is the price range for inverters?",
    q_te: "ఇన్వర్టర్ ధర ఎంత?",
    a_en: "Terranova 1kV starts at ₹34,000, 2kV at ₹69,000, 3kV at ₹1,12,000, and 5kV at ₹1,78,000. All include inbuilt LiFePO4 battery. Contact us for details.",
    a_te: "Terranova 1kV ₹34,000 నుండి, 2kV ₹69,000, 3kV ₹1,12,000, మరియు 5kV ₹1,78,000. అన్నింటికీ LiFePO4 బ్యాటరీ అంతర్గతంగా ఉంటుంది. వివరాలకు మమ్మల్ని సంప్రదించండి.",
  },
  {
    q_en: "Do you repair old inverters?",
    q_te: "పాత ఇన్వర్టర్లు రిపేర్ చేస్తారా?",
    a_en: "Yes, we repair all brands of inverters and batteries. Book a repair service on our website or call us at 9133639888.",
    a_te: "అవును, మేము అన్ని బ్రాండ్ ఇన్వర్టర్లు మరియు బ్యాటరీలను రిపేర్ చేస్తాము. మా వెబ్‌సైట్‌లో రిపేర్ సేవని బుక్ చేయండి లేదా 9133639888 కి కాల్ చేయండి.",
  },
];

type Message = {
  from: "bot" | "user";
  text: string;
  isOptions?: boolean;
};

const GREETING_EN = "Hi! 👋 I'm the Smart Inverter's assistant. How can I help you today? Please choose your preferred language:";
const GREETING_TE = "నమస్కారం! 👋 నేను Smart Inverter's సహాయకుడిని. మీరు ఏ భాషలో మాట్లాడాలనుకుంటున్నారు?";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "te" | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: GREETING_EN + "\n" + GREETING_TE, isOptions: false },
  ]);
  const [showLangPick, setShowLangPick] = useState(true);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function addBotMessage(text: string) {
    setMessages((prev) => [...prev, { from: "bot", text }]);
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [...prev, { from: "user", text }]);
  }

  function handleLangSelect(selected: "en" | "te") {
    setLang(selected);
    setShowLangPick(false);
    addUserMessage(selected === "en" ? "English" : "తెలుగు");
    setTimeout(() => {
      addBotMessage(
        selected === "en"
          ? "Great! Here are some common questions. Please select one:"
          : "సరే! ఇవి సాధారణ ప్రశ్నలు. దయచేసి ఒకదాన్ని ఎంచుకోండి:"
      );
      setShowFAQs(true);
    }, 400);
  }

  function handleFAQ(faq: typeof FAQS[0]) {
    const q = lang === "te" ? faq.q_te : faq.q_en;
    const a = lang === "te" ? faq.a_te : faq.a_en;
    addUserMessage(q);
    setTimeout(() => {
      addBotMessage(a);
      setTimeout(() => {
        addBotMessage(
          lang === "te"
            ? "మీకు మరిన్ని సందేహాలు ఉన్నాయా? మళ్ళీ ఎంచుకోండి లేదా మా మేనేజర్‌ని సంప్రదించండి."
            : "Do you have more questions? Choose another or contact our manager."
        );
        setShowEscalate(true);
      }, 400);
    }, 400);
  }

  function handleReset() {
    setShowFAQs(true);
    setShowEscalate(false);
    addBotMessage(
      lang === "te"
        ? "సరే, మరో ప్రశ్న ఎంచుకోండి:"
        : "Sure! Pick another question:"
    );
  }

  const managerWAUrl = `https://wa.me/${MANAGER_WA_NUMBER}?text=${encodeURIComponent(
    lang === "te"
      ? "నమస్కారం! నాకు Smart Inverters గురించి అడగాలనుకుంటున్నాను."
      : "Hello! I want to know about Smart Inverters. I was chatting on your website and need help."
  )}`;

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all hover:scale-110"
        aria-label="Open chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-44 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">⚡</div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Smart Inverter's Bot</p>
                <p className="text-blue-200 text-xs">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Options */}
          <div className="border-t border-gray-100 bg-white p-3 space-y-2">
            {showLangPick && (
              <div className="flex gap-2">
                <button onClick={() => handleLangSelect("en")}
                  className="flex-1 py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  🇬🇧 English
                </button>
                <button onClick={() => handleLangSelect("te")}
                  className="flex-1 py-2 text-sm font-semibold bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors">
                  🇮🇳 తెలుగు
                </button>
              </div>
            )}

            {showFAQs && !showLangPick && (
              <div className="space-y-1">
                {FAQS.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => { setShowFAQs(false); setShowEscalate(false); handleFAQ(faq); }}
                    className="w-full text-left text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
                  >
                    {lang === "te" ? faq.q_te : faq.q_en}
                  </button>
                ))}
              </div>
            )}

            {showEscalate && !showFAQs && (
              <div className="space-y-2">
                <button onClick={handleReset}
                  className="w-full py-2 text-sm font-semibold bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  {lang === "te" ? "🔁 మరో ప్రశ్న అడగండి" : "🔁 Ask another question"}
                </button>
                <a href={managerWAUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                  {lang === "te" ? "మేనేజర్‌ని సంప్రదించండి (WhatsApp)" : "Contact Manager on WhatsApp"}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
