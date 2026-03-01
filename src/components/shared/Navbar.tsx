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
    ChevronDown,
    Heart,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useWishlistStore from "@/store/wishlist.store";

export function Navbar() {
    const t = useTranslations("nav");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { wishlist } = useWishlistStore();
    const wishlistCount = wishlist.length;

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
        { href: "/about", label: t("about"), icon: Compass },
        { href: "/contact", label: t("contact"), icon: Mail },
    ];

    const switchLocale = (newLocale: string) => {
        const pathSegments = pathname.split("/");
        pathSegments[1] = newLocale;
        router.push(pathSegments.join("/"));
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300 border-b",
                isScrolled ? "bg-surface/95 backdrop-blur-md shadow-sm border-border py-2" : "bg-surface border-transparent py-4"
            )}
        >
            <div className="container mx-auto max-w-[1440px] flex items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo Section */}
                <div className="flex items-center gap-8">
                    <Link href={`/${locale}`} className="flex items-center gap-2 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
                            <Plane className={cn("w-6 h-6 transform transition-transform group-hover:rotate-12", isRtl ? "-rotate-45" : "rotate-45")} />
                        </div>
                        {/* <span className="font-extrabold text-2xl tracking-tighter text-brand-dark hidden md:inline-block">
                            {tCommon("appName")}
                        </span> */}
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
                                            : "text-brand-muted hover:bg-surface-muted hover:text-primary"
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
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Language Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 rounded-full font-bold text-brand-muted">
                                <Globe className="w-4 h-4" />
                                <span>{locale.toUpperCase()}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border">
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

                    {/* Wishlist Heart */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="group rounded-full text-brand-muted hover:text-primary relative"
                        onClick={() => router.push(`/${locale}/hotels?wishlist=true`)}
                    >
                        <Heart className={cn("w-6 h-6 transition-all", wishlistCount > 0 ? "fill-red-500 text-red-500" : "")} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white px-1">
                                {wishlistCount}
                            </span>
                        )}
                    </Button>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative flex items-center gap-2 rounded-full font-bold text-brand-muted hover:text-primary hover:bg-surface-muted transition-all p-1 pe-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                <span className="hidden md:block text-sm">Sameh Hammad</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border mt-2">
                            <div className="px-3 py-2 border-b border-surface-muted mb-1">
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{t("profile")}</p>
                                <p className="text-sm font-bold text-brand-dark mt-0.5 truncate">Sameh Hammad</p>
                            </div>
                            <DropdownMenuItem className="rounded-xl flex items-center gap-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                                <UserCircle className="w-4 h-4 opacity-70" />
                                <span className="font-semibold">{t("profile")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex items-center gap-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                                <Building2 className="w-4 h-4 opacity-70" />
                                <span className="font-semibold">{t("myBookings")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex items-center gap-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors text-brand-muted">
                                <Globe className="w-4 h-4 opacity-70" />
                                <span className="font-semibold">{t("settings")}</span>
                            </DropdownMenuItem>
                            <div className="h-px bg-border my-1 mx-2" />
                            <DropdownMenuItem className="rounded-xl flex items-center gap-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 transition-colors">
                                <X className="w-4 h-4" />
                                <span className="font-bold">{t("logout")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


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
                <div className="lg:hidden absolute top-full left-0 right-0 bg-surface border-b border-border shadow-xl p-4 animate-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={`/${locale}${link.href}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-surface-muted hover:bg-primary/5 text-brand-muted font-bold transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shadow-sm">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="flex flex-col gap-4 mt-4 py-6 border-t border-border">
                            {/* Mobile User Info */}
                            <div className="flex items-center gap-4 px-2 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <UserCircle className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-brand-dark">Sameh Hammad</p>
                                    <p className="text-xs text-brand-muted font-medium">sameh@example.com</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    variant="outline"
                                    className="rounded-2xl border-border font-bold justify-start h-14 px-6 text-brand-muted"
                                    onClick={() => switchLocale(locale === "en" ? "ar" : "en")}
                                >
                                    <Globe className="w-5 h-5 me-3 text-primary" />
                                    {locale === "en" ? "العربية" : "English"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="rounded-2xl border-border font-bold justify-start h-14 px-6 text-brand-muted"
                                >
                                    <UserCircle className="w-5 h-5 me-3 text-primary" />
                                    {t("profile")}
                                </Button>
                                <Button
                                    className="rounded-2xl font-black h-14 px-6 bg-destructive/5 text-destructive hover:bg-destructive/10 border-none shadow-none justify-start"
                                >
                                    <X className="w-5 h-5 me-3" />
                                    {t("logout")}
                                </Button>
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
