//---** Hero Slider component using Swiper.js **---//

"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { useTranslations } from "next-intl";
import { SearchForm } from "../search/SearchForm";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const SLIDE_IMAGES = [
    "/slider/slider1.avif",
    "/slider/slider2.avif",
    "/slider/slider3.avif",
    "/slider/slider4.webp",
];

export function HeroSlider() {
    const t = useTranslations("search");

    return (
        <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
            {/* Swiper Background */}
            <div className="absolute inset-0 z-0">
                <Swiper
                    modules={[Autoplay, EffectFade, Pagination]}
                    effect="fade"
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    loop={true}
                    className="h-full w-full"
                >
                    {SLIDE_IMAGES.map((src, index) => (
                        <SwiperSlide key={index}>
                            <div className="relative w-full h-full">
                                <Image
                                    src={src}
                                    alt={`Luxury Hotel View ${index + 1}`}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                    sizes="100vw"
                                />
                                {/* Overlay for readability */}
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl mb-6 max-w-4xl mx-auto">
                        {t("title")}
                    </h1>
                    <p className="text-lg sm:text-2xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-lg mb-12">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Search Form Integration */}
                <div className="w-full max-w-5xl mt-8 animate-in fade-in zoom-in duration-700 delay-300">
                    <SearchForm variant="hero" className="shadow-2xl" />
                </div>
            </div>

            {/* Bottom Gradient for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-muted to-transparent z-10" />
        </section>
    );
}
