//---** Global navigation bar shared across all pages **---//

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plane, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const t = useTranslations("nav");
    const tCommon = useTranslations("common");

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition-colors">
                            <Plane className="w-6 h-6 rotate-45 transform group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline-block">
                            {tCommon("appName")}
                        </span>
                    </Link>
                </div>

                {/* Links */}
                <nav className="flex items-center gap-4 sm:gap-6 ml-auto">
                    <Link
                        href="/"
                        className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        {t("home")}
                    </Link>
                    <Link
                        href="/hotels"
                        className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                    >
                        <Building2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("hotels")}</span>
                    </Link>

                    {/* Lang switcher demo */}
                    <div className="h-6 w-px bg-slate-200 mx-2" />
                    <div className="flex items-center gap-2">
                        <Link href="/en" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase">EN</Link>
                        <Link href="/ar" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase">AR</Link>
                    </div>
                </nav>

            </div>
        </header>
    );
}
