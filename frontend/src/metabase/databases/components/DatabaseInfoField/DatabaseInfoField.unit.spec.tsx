import { render, screen } from "__support__/ui";

import DatabaseInfoField from "./DatabaseInfoField";

describe("DatabaseInfoField", () => {
  it("renders markdown links", () => {
    const content = 'Text "[link](https://www.metabase.com/)';
    render(<DatabaseInfoField placeholder={content} />);

    const link = screen.getByRole("link");

    expect(link).toHaveTextContent("link");
    expect(link).toHaveAttribute("href", "https://www.metabase.com/");
  });
});
