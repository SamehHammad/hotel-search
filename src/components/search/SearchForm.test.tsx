import { render } from "@testing-library/react";
import { SearchForm } from "./SearchForm";

// Mock specific hooks to run simple UI component test
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
}));

describe("SearchForm Component", () => {
    // {/*---** Informational tooltip for checking component render logic **---*/}
    it("should render SearchForm correctly without crashing", () => {
        const { getByRole } = render(<SearchForm variant="hero" />);

        // Assert the main form element is present
        expect(getByRole("button", { name: "searchButton" })).toBeDefined();
    });

    // {/*---** Informational tooltip for rendering header variant **---*/}
    it("should render the header variant without crashing", () => {
        const { getByRole } = render(<SearchForm variant="header" />);

        expect(getByRole("button", { name: "searchButton" })).toBeDefined();
    });
});
