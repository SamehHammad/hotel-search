"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSlider } from "@/components/shared/HeroSlider";
import { format, addDays } from "date-fns";
import { ArrowRight, MapPin, Star, Shield, Zap, Globe, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomeClient() {
    const t = useTranslations();
    const locale = useLocale();

    const getSearchUrl = (city: string) => {
        const checkIn = format(addDays(new Date(), 7), "yyyy-MM-dd");
        const checkOut = format(addDays(new Date(), 10), "yyyy-MM-dd");
        return `/${locale}/hotels?q=${city}&check_in_date=${checkIn}&check_out_date=${checkOut}&rooms_count=1&adults=2&children=0`;
    };

    const quickDestinations = [
        { nameKey: "dubai", img: "/hotels/h1.webp", count: "1,200+" },
        { nameKey: "cairo", img: "/hotels/h2.webp", count: "850+" },
        { nameKey: "newyork", img: "/hotels/h3.webp", count: "2,400+" },
        { nameKey: "london", img: "/hotels/h4.webp", count: "1,800+" },
        { nameKey: "paris", img: "/hotels/h5.webp", count: "1,500+" },
        { nameKey: "tokyo", img: "/hotels/h6.webp", count: "900+" },
    ];

    const popularHotels = [
        { name: t("home.popularHotels.burj"), location: t("home.popularHotels.dubai"), rating: 4.9, price: "$1,200", img: "/hotels/h1.webp" },
        { name: t("home.popularHotels.ritz"), location: t("home.popularHotels.cairo"), rating: 4.8, price: "$350", img: "/hotels/h2.webp" },
        { name: t("home.popularHotels.plaza"), location: t("home.popularHotels.nyc"), rating: 4.7, price: "$850", img: "/hotels/h3.webp" },
        { name: t("home.popularHotels.savoy"), location: t("home.popularHotels.london"), rating: 4.8, price: "$600", img: "/hotels/h4.webp" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-surface-muted">
            <Navbar />

            <main className="flex-1">
                <HeroSlider />

                {/*---** Quick Search Section **---*/}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-20" aria-labelledby="quick-search-title">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div className="space-y-2">
                            <Badge variant="outline" className="border-primary/20 text-primary font-bold px-3 py-1 rounded-full bg-primary/5 uppercase tracking-wider text-[10px]">
                                {t("home.quickSearch.title")}
                            </Badge>
                            <h2 id="quick-search-title" className="text-3xl md:text-5xl font-black tracking-tight text-brand-dark">
                                {t("home.quickSearch.subtitle")}
                            </h2>
                        </div>
                        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full group" aria-label={t("common.learnMore")}>
                            {t("common.learnMore")}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {quickDestinations.map((city, i) => (
                            <Link
                                key={i}
                                href={getSearchUrl(t(`home.destinations.${city.nameKey}`))}
                                className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                                aria-label={`${t("search.explore")} ${t(`home.destinations.${city.nameKey}`)}`}
                            >
                                <Image
                                    src={city.img}
                                    alt={t(`home.destinations.${city.nameKey}`)}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent p-6 flex flex-col justify-end text-white">
                                    <h3 className="text-xl font-black tracking-tight mb-1">{t(`home.destinations.${city.nameKey}`)}</h3>
                                    <p className="text-xs font-medium text-white/70">{city.count} {t("hotels.properties")}</p>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/*---** Why Choose Us Section **---*/}
                <section className="bg-surface py-24 border-y border-border overflow-hidden relative" aria-labelledby="features-title">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50 -z-0" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="space-y-3 mb-16">
                            <h2 id="features-title" className="text-3xl md:text-5xl font-black tracking-tight text-brand-dark">
                                {t("home.features.title")}
                            </h2>
                            <p className="text-brand-muted max-w-2xl mx-auto text-lg font-medium">
                                {t("home.features.subtitle")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            <div className="bg-surface-muted p-10 rounded-[3rem] shadow-sm border border-border group hover:bg-primary transition-colors duration-500">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-brand-dark mb-4 group-hover:text-white">{t("home.features.smart.title")}</h3>
                                <p className="text-brand-muted leading-relaxed font-medium group-hover:text-white/80">
                                    {t("home.features.smart.desc")}
                                </p>
                            </div>
                            <div className="bg-surface-muted p-10 rounded-[3rem] shadow-sm border border-border group hover:bg-primary transition-colors duration-500">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-brand-dark mb-4 group-hover:text-white">{t("home.features.global.title")}</h3>
                                <p className="text-brand-muted leading-relaxed font-medium group-hover:text-white/80">
                                    {t("home.features.global.desc")}
                                </p>
                            </div>
                            <div className="bg-surface-muted p-10 rounded-[3rem] shadow-sm border border-border group hover:bg-primary transition-colors duration-500">
                                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-brand-dark mb-4 group-hover:text-white">{t("home.features.security.title")}</h3>
                                <p className="text-brand-muted leading-relaxed font-medium group-hover:text-white/80">
                                    {t("home.features.security.desc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/*---** Popular Hotels Dummy Section **---*/}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" aria-labelledby="popular-hotels-title">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="space-y-2">
                            <Badge variant="outline" className="border-primary/20 text-primary font-bold px-3 py-1 rounded-full bg-primary/5 uppercase tracking-wider text-[10px]">
                                {t("home.popularHotels.title")}
                            </Badge>
                            <h2 id="popular-hotels-title" className="text-3xl md:text-5xl font-black tracking-tight text-brand-dark">
                                {t("home.popularHotels.subtitle")}
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <Button size="icon" variant="outline" className="rounded-full border-border hover:bg-surface-muted" aria-label="Show top rated hotels">
                                <TrendingUp className="w-5 h-5 text-brand-muted" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {popularHotels.map((hotel, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-lg shadow-black/5">
                                    <Image
                                        src={hotel.img}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                    <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xl">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-black text-brand-dark">{hotel.rating}</span>
                                    </div>
                                    <div className="absolute bottom-5 left-5 right-5 bg-black/20 backdrop-blur-xl p-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                        <Button className="w-full bg-white text-brand-dark hover:bg-primary hover:text-white font-black rounded-2xl py-6 tracking-tight" aria-label={`${t("hotels.viewDeal")} ${hotel.name}`}>
                                            {t("hotels.viewDeal")}
                                        </Button>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black text-brand-dark tracking-tight">{hotel.name}</h3>
                                        <span className="text-lg font-black text-primary">{hotel.price}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-brand-muted font-bold text-sm">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        {hotel.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/*---** Footer section of the page **---*/}
            <footer className="bg-brand-dark text-brand-muted py-12 mt-auto border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p className="font-medium text-white/70">&copy; {new Date().getFullYear()} {t("common.appName")}. {t("common.allRightsReserved")}</p>
                    <nav className="flex gap-6 mt-6 md:mt-0 font-black uppercase tracking-widest text-[11px]" aria-label="Footer navigation">
                        <Link href={`/${locale}/about`} className="text-white/60 hover:text-primary transition-colors">
                            {t("nav.about")}
                        </Link>
                        <a href="#" className="text-white/60 hover:text-primary transition-colors">{t("common.privacy")}</a>
                        <a href="#" className="text-white/60 hover:text-primary transition-colors">{t("common.terms")}</a>
                        <Link href={`/${locale}/contact`} className="text-white/60 hover:text-primary transition-colors">
                            {t("nav.contact")}
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
