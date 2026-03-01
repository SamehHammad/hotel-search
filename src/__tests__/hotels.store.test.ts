import useHotelsStore from "../store/hotels.store";

describe("useHotelsStore", () => {
    // {/*---** Reset the store before each test to ensure a clean state **---*/}
    beforeEach(() => {
        useHotelsStore.getState().resetHotels();
    });

    // {/*---** Informational tooltip for checking initial state **---*/}
    it("should initialize with default states", () => {
        const state = useHotelsStore.getState();

        expect(state.hotels).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.mapBounds).toBeNull();
        expect(state.isFetchingMore).toBe(false);
        expect(state.pagination.records_from).toBe(1);
    });

    // {/*---** Informational tooltip for testing filter updates **---*/}
    it("should update filters correctly and handle major changes", () => {
        // Update the query filter
        useHotelsStore.getState().setFilters({ q: "Paris" });

        let state = useHotelsStore.getState();
        expect(state.filters.q).toBe("Paris");
        // A major change resets mapBounds and hotels
        expect(state.mapBounds).toBeNull();
        expect(state.hotels).toEqual([]);

        // Update map bounds
        useHotelsStore.getState().setBounds({
            north: 48.9, south: 48.8, east: 2.4, west: 2.3
        });

        state = useHotelsStore.getState();
        expect(state.mapBounds).toBeDefined();
        expect(state.mapBounds?.north).toBe(48.9);
    });
});
