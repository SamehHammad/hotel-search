//---** Global navigation bar shared across all pages with RTL support **---//

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
    Plane,
    Building2,
    Car,
    Compass,
    Menu,
    X,
    Globe,
    UserCircle,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
    const t = useTranslations("nav");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // RTL detection
    const isRtl = locale === "ar";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/hotels", label: t("hotels"), icon: Building2 },
        { href: "/flights", label: t("flights"), icon: Plane },
        { href: "/cars", label: t("cars"), icon: Car },
        { href: "/tours", label: t("tours"), icon: Compass },
    ];

    const switchLocale = (newLocale: string) => {
        const pathSegments = pathname.split("/");
        pathSegments[1] = newLocale;
        router.push(pathSegments.join("/"));
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-[100] w-full transition-all duration-300 border-b",
                isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-slate-100 py-2" : "bg-white border-transparent py-4"
            )}
        >
            <div className="container mx-auto max-w-[1440px] flex items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo Section */}
                <div className="flex items-center gap-8">
                    <Link href={`/${locale}`} className="flex items-center gap-2 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
                            <Plane className={cn("w-6 h-6 transform transition-transform group-hover:rotate-12", isRtl ? "-rotate-45" : "rotate-45")} />
                        </div>
                        <span className="font-extrabold text-2xl tracking-tighter text-slate-900 hidden md:inline-block">
                            {tCommon("appName")}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname.includes(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={`/${locale}${link.href}`}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                                        isActive
                                            ? "bg-primary/5 text-primary"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Actions Section */}
                <div className="flex items-center gap-2 sm:gap-4">

                    {/* Language Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 rounded-full font-bold text-slate-600">
                                <Globe className="w-4 h-4" />
                                <span>{locale.toUpperCase()}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100">
                            <DropdownMenuItem
                                onClick={() => switchLocale("en")}
                                className={cn("flex items-center justify-between gap-8 font-semibold", locale === "en" && "text-primary bg-primary/5")}
                            >
                                English <span>EN</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => switchLocale("ar")}
                                className={cn("flex items-center justify-between gap-8 font-semibold", locale === "ar" && "text-primary bg-primary/5")}
                            >
                                العربية <span>AR</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile & Auth */}
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:text-primary">
                        <UserCircle className="w-6 h-6" />
                    </Button>

                    <Button className="hidden sm:flex rounded-full font-bold px-6 shadow-md shadow-primary/10">
                        Login
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden rounded-full"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 animate-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={`/${locale}${link.href}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-primary/5 text-slate-700 font-bold transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                className="rounded-xl border-slate-200 font-bold"
                                onClick={() => switchLocale(locale === "en" ? "ar" : "en")}
                            >
                                <Globe className="w-4 h-4 me-2" />
                                {locale === "en" ? "العربية" : "English"}
                            </Button>
                            <Button className="rounded-xl font-bold">
                                Login
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
