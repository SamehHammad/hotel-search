//---** Homepage route serving the hero section **---//

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSlider } from "@/components/shared/HeroSlider";

export default function Home() {
    const t = useTranslations("common");

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex-1">
                <HeroSlider />

                {/* Placeholder for promotional cards / features */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-20 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
                        Why choose {t("appName")}?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg mb-10">
                        Compare prices across hundreds of sites to find the best hotel deals.
                        Smart features like interactive map searching and localized experiences in one app.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 text-2xl font-bold">1</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Comprehensive Search</h3>
                            <p className="text-slate-500 leading-relaxed">Search thousands of top-rated hotels and vacation rentals worldwide instantly.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 text-2xl font-bold">2</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Interactive Maps</h3>
                            <p className="text-slate-500 leading-relaxed">Discover properties right on the map. Move and zoom to auto-update available listings.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 text-2xl font-bold">3</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Best Price Guarantee</h3>
                            <p className="text-slate-500 leading-relaxed">We aggregate the best available deals, highlighting discounts from major providers.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} {t("appName")}. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
