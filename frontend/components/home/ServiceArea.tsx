import { MapPin } from "lucide-react";

export const SERVICE_CITIES = [
  "Amalapuram",
  "Bhimavaram",
  "Eluru",
  "Kakinada",
  "Machilipatnam",
  "Mandapeta",
  "Narasapuram",
  "Nelluru",
  "Nidadavolu",
  "Palakollu",
  "Rajahmundry",
  "Ramachandrapuram",
  "Ravulapalem",
  "Razole",
  "Tanuku",
  "Thadepalligudem",
  "Vijayawada",
  "Visakhapatnam",
];

export default function ServiceArea() {
  return (
    <section className="py-24 bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-cyan-300">
            <MapPin className="h-4 w-4" /> Service Coverage
          </div>
          <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            We serve major cities across Andhra Pradesh
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-slate-400">
            Fast inverter installation, battery service, and emergency support for homes and businesses in the region.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
            <h3 className="text-xl font-semibold text-white mb-5">Cities we cover</h3>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {SERVICE_CITIES.map((city) => (
                <div key={city} className="flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 border border-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  <span>{city}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-slate-400">
              If your city is not listed, get in touch anyway — we often cover nearby towns and can plan the nearest service team dispatch.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90">
            <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3 text-slate-100 font-semibold">
                <MapPin className="h-5 w-5 text-cyan-400" />
                Andhra Pradesh service map
              </div>
            </div>
            <iframe
              className="h-[320px] w-full border-0"
              src="https://maps.google.com/maps?q=Andhra+Pradesh,India&output=embed&z=6"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Andhra Pradesh Service Coverage"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
