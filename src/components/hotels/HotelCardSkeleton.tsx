//---** Loading skeleton for HotelCard during initial and infinite scroll fetch **---//

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function HotelCardSkeleton() {
    return (
        <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl bg-white mb-4">
            <span className="sr-only">Loading hotel card details...</span>
            <div className="flex flex-col sm:flex-row h-full">
                {/*---** Image section skeleton with pulse animation **---*/}
                <Skeleton className="relative w-full sm:w-72 h-48 sm:h-auto shrink-0 bg-slate-100 skeleton-pulse rounded-r-none" />

                {/*---** Content area skeleton for titles, ratings and pricing **---*/}
                <CardContent className="flex-1 p-5 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-4">
                            {/*---** Title and location skeleton labels **---*/}
                            <div className="flex-1">
                                <Skeleton className="h-6 w-3/4 mb-2 bg-slate-200 skeleton-pulse" />
                                <Skeleton className="h-4 w-1/4 bg-slate-100 skeleton-pulse" />
                            </div>
                            {/*---** Rating score badge skeleton **---*/}
                            <div className="flex flex-col items-end shrink-0">
                                <Skeleton className="h-8 w-12 rounded-lg bg-emerald-100 skeleton-pulse mb-1" />
                                <Skeleton className="h-3 w-16 bg-slate-100 skeleton-pulse" />
                            </div>
                        </div>

                        {/*---** Additional metadata and ratings row skeleton **---*/}
                        <div className="flex gap-4 mt-2">
                            <Skeleton className="h-4 w-16 bg-slate-100 skeleton-pulse" />
                            <Skeleton className="h-4 w-16 bg-slate-100 skeleton-pulse" />
                        </div>

                        {/*---** Description text line placeholders **---*/}
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-3 w-full bg-slate-100 skeleton-pulse" />
                            <Skeleton className="h-3 w-4/5 bg-slate-100 skeleton-pulse" />
                        </div>
                    </div>

                    {/*---** Visual separator between content and pricing **---*/}
                    <div className="my-4 border-t border-slate-100"></div>

                    {/*---** Pricing and CTA button footer skeleton **---*/}
                    <div className="flex justify-between items-end">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16 rounded-md bg-slate-100 skeleton-pulse" />
                            <Skeleton className="h-5 w-20 rounded-md bg-slate-100 skeleton-pulse" />
                        </div>
                        <div className="flex flex-col items-end">
                            <Skeleton className="h-8 w-24 mb-1 bg-slate-200 skeleton-pulse" />
                            <Skeleton className="h-4 w-20 rounded-md bg-slate-100 skeleton-pulse" />
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
