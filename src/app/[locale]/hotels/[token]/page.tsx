import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { MOCK_HOTELS, generateMoreHotels, getHotelImages } from "@/data/mockHotels";
import type { Hotel } from "@/types/hotel.types";

export const revalidate = 300;

function findHotelByToken(token: string): Hotel | null {
    const direct = MOCK_HOTELS.find((h) => h.property_token === token);
    if (direct) return direct;

    const match = token.match(/^mock_page(\d+)_token_(.+)_(\d+)$/);
    if (!match) return null;

    const pageVal = parseInt(match[1], 10);
    const cityStr = match[2].replace(/_/g, " ");
    const idx = parseInt(match[3], 10);

    if (!Number.isFinite(pageVal) || !Number.isFinite(idx)) return null;

    const generated = generateMoreHotels(pageVal, cityStr, "", 0, 0);
    return generated[idx] ?? null;
}

export function generateStaticParams() {
    return MOCK_HOTELS.map((h) => ({ token: h.property_token }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; token: string }>;
}) {
    const { locale, token } = await params;
    const t = await getTranslations({ locale, namespace: "hotels" });

    const hotel = findHotelByToken(token);

    return buildMetadata({
        title: hotel ? hotel.name : t("title"),
        description: hotel?.description ?? t("mockDesc"),
        path: `/hotels/${token}`,
        locale,
    });
}

export default async function HotelDetailsPage({
    params,
}: {
    params: Promise<{ locale: string; token: string }>;
}) {
    const { locale, token } = await params;
    const t = await getTranslations({ locale, namespace: "hotels" });

    const hotel = findHotelByToken(token);
    if (!hotel) notFound();

    const images = hotel.images?.length > 1 ? hotel.images : getHotelImages(hotel.property_token);

    return (
        <div className="min-h-screen bg-surface-muted">
            <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-6">
                <div className="mb-4">
                    <Link
                        href={`/${locale}/hotels?q=${encodeURIComponent(hotel.city)}`}
                        className="text-sm font-bold text-primary hover:underline"
                    >
                        {t("backToResults")}
                    </Link>
                </div>

                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border">
                        <h1 className="text-2xl md:text-3xl font-black text-brand-dark">{hotel.name}</h1>
                        <p className="mt-1 text-brand-muted font-medium">
                            {hotel.city}, {hotel.country}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="p-6 border-b md:border-b-0 md:border-e border-border">
                            <div className="grid grid-cols-2 gap-3">
                                {images.slice(0, 4).map((img, i) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={i}
                                        src={img.original || img.thumbnail}
                                        alt={`${hotel.name} image ${i + 1}`}
                                        className="w-full h-40 object-cover rounded-xl border border-border"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-black text-brand-muted uppercase tracking-widest">{t("description")}</p>
                                    <p className="mt-2 text-sm text-brand-muted leading-relaxed">
                                        {hotel.description ?? t("mockDesc")}
                                    </p>
                                </div>

                                <div className="h-px bg-border" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface-muted border border-border rounded-xl p-4">
                                        <p className="text-xs font-black text-brand-muted uppercase tracking-widest">{t("perNight")}</p>
                                        <p className="mt-1 text-xl font-black text-brand-dark">
                                            {hotel.price_per_night?.price ?? "—"}
                                        </p>
                                    </div>
                                    <div className="bg-surface-muted border border-border rounded-xl p-4">
                                        <p className="text-xs font-black text-brand-muted uppercase tracking-widest">{t("totalPrice")}</p>
                                        <p className="mt-1 text-xl font-black text-brand-dark">
                                            {hotel.total_price?.price ?? "—"}
                                        </p>
                                    </div>
                                </div>

                                {hotel.amenities?.length ? (
                                    <>
                                        <div className="h-px bg-border" />
                                        <div>
                                            <p className="text-xs font-black text-brand-muted uppercase tracking-widest">{t("amenities")}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {hotel.amenities.slice(0, 12).map((a) => (
                                                    <span
                                                        key={a}
                                                        className="text-xs font-semibold text-brand-dark bg-surface-muted border border-border px-3 py-1 rounded-full"
                                                    >
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
