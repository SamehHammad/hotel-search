//---** Wishlist Store: manage favorite hotels with localStorage persistence **---//

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
    wishlist: string[]; // array of property_tokens
    toggleWishlist: (propertyToken: string) => void;
    isInWishlist: (propertyToken: string) => boolean;
    clearWishlist: () => void;
}

const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlist: [],

            toggleWishlist: (propertyToken) => {
                const { wishlist } = get();
                const isItemInWishlist = wishlist.includes(propertyToken);

                if (isItemInWishlist) {
                    set({ wishlist: wishlist.filter((token) => token !== propertyToken) });
                } else {
                    set({ wishlist: [...wishlist, propertyToken] });
                }
            },

            isInWishlist: (propertyToken) => {
                return get().wishlist.includes(propertyToken);
            },

            clearWishlist: () => set({ wishlist: [] }),
        }),
        {
            name: "hotel-wishlist-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useWishlistStore;
