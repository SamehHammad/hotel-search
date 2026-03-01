"use client";

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/Navbar";
import { Globe, ShieldCheck, Banknote, Users, Hotel, Map } from "lucide-react";

export default function AboutPage() {
    const t = useTranslations("about");
    const tCommon = useTranslations("common");

    const stats = [
        { icon: Hotel, label: t("stats.hotels"), value: "2M+" },
        { icon: Users, label: t("stats.users"), value: "500K+" },
        { icon: Map, label: t("stats.countries"), value: "190+" },
    ];

    const features = [
        {
            icon: Banknote,
            title: t("bestPrices"),
            desc: t("bestPricesDesc"),
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            icon: Globe,
            title: t("globalReach"),
            desc: t("globalReachDesc"),
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            icon: ShieldCheck,
            title: t("trust"),
            desc: t("trustDesc"),
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-surface">
            <Navbar />

            <main className="flex-1">
                {/*---** Hero Section **---*/}
                <section className="relative pt-20 pb-16 overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tight mb-6">
                            {t("title")}
                        </h1>
                        <p className="text-xl text-brand-muted max-w-3xl mx-auto font-medium leading-relaxed">
                            {t("subtitle")}
                        </p>
                    </div>
                </section>

                {/*---** Stats Section **---*/}
                <section className="py-12 bg-surface-muted border-y border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center p-8 bg-surface rounded-[2rem] shadow-sm border border-border transform hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center text-primary mb-4">
                                        <stat.icon className="w-7 h-7" />
                                    </div>
                                    <div className="text-3xl font-black text-brand-dark mb-1">{stat.value}</div>
                                    <div className="text-sm font-bold text-brand-muted uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/*---** Mission Section **---*/}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-slate-200 rounded-[3rem] overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent z-10" />
                            <img
                                src="/hotels/h1.webp"
                                alt="Mission"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">
                                    {t("ourMission")}
                                </h2>
                                <h3 className="text-3xl md:text-5xl font-black text-brand-dark leading-[1.15] mb-6">
                                    {t("missionDesc")}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-3xl hover:bg-surface-muted transition-colors">
                                        <div className={`w-12 h-12 bg-brand-light text-primary shrink-0 rounded-2xl flex items-center justify-center`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-brand-dark mb-1">{feature.title}</h4>
                                            <p className="text-brand-muted leading-relaxed text-sm font-medium">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-brand-dark text-brand-muted py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                    <div className="text-2xl font-black text-white">{tCommon("appName")}</div>
                    <div className="flex justify-center gap-10 text-sm font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <div className="text-xs opacity-50 pt-8 border-t border-white/10">
                        &copy; {new Date().getFullYear()} {tCommon("appName")}. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
