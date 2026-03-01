"use client";

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/Navbar";
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    const t = useTranslations("contact");
    const tCommon = useTranslations("common");

    const contactInfo = [
        { icon: Mail, label: t("emailLabel"), value: t("emailValue") },
        { icon: Phone, label: t("phone"), value: t("phoneValue") },
        { icon: MapPin, label: t("office"), value: t("address") },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-surface-muted">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/*---** Header Section **---*/}
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tight mb-8">
                            {t("title")}
                        </h1>
                        <p className="text-xl text-brand-muted font-medium leading-relaxed">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

                        {/*---** Contact Information Cards **---*/}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-surface p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border h-full flex flex-col justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-brand-dark mb-12">
                                        {t("getInTouch")}
                                    </h2>
                                    <div className="space-y-10">
                                        {contactInfo.map((info, i) => (
                                            <div key={i} className="flex gap-6 items-start">
                                                <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-primary shrink-0">
                                                    <info.icon className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-brand-muted/70 uppercase tracking-widest leading-none mb-1">
                                                        {info.label}
                                                    </div>
                                                    <div className="text-lg font-bold text-brand-dark leading-tight">
                                                        {info.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-16 pt-10 border-t border-border shrink-0">
                                    <div className="flex gap-4">
                                        {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                            <a key={i} href="#" className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary hover:bg-primary/20 transition-all transform hover:-translate-y-1">
                                                <Icon className="w-5 h-5" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*---** Contact Form Section **---*/}
                        <div className="lg:col-span-7">
                            <form className="bg-surface p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border space-y-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest px-1">
                                            {t("name")}
                                        </label>
                                        <Input
                                            placeholder={t("namePlaceholder")}
                                            className="h-14 bg-surface-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary px-6 font-bold text-brand-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest px-1">
                                            {t("email")}
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder={t("emailPlaceholder")}
                                            className="h-14 bg-surface-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary px-6 font-bold text-brand-muted"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest px-1">
                                        {t("subject")}
                                    </label>
                                    <Input
                                        placeholder={t("subjectPlaceholder")}
                                        className="h-14 bg-surface-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary px-6 font-bold text-brand-muted"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest px-1">
                                        {t("message")}
                                    </label>
                                    <Textarea
                                        placeholder={t("messagePlaceholder")}
                                        className="min-h-[160px] bg-surface-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary px-6 py-4 font-bold text-brand-muted resize-none"
                                    />
                                </div>

                                <Button size="lg" className="h-16 w-full md:w-auto md:px-12 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-lg font-black tracking-tight flex items-center gap-4">
                                    {t("send")}
                                    <Send className="w-5 h-5 ml-1" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
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
