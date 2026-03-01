import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlogList } from "@/app/blog/BlogList";

vi.mock("@/components/shared/NewsletterSignup", () => ({
  NewsletterSignup: () => <div data-testid="newsletter-signup">Newsletter</div>,
}));

const MOCK_POSTS = Array.from({ length: 25 }, (_, i) => ({
  slug: `post-${i + 1}`,
  title: `Post ${i + 1}`,
  excerpt: `Excerpt for post ${i + 1}`,
  content_type: i % 3 === 0 ? "daily_risk_assessment" : i % 3 === 1 ? "weekly_report" : "deep_dive",
  published_at: new Date(Date.now() - i * 86400000).toISOString(),
  keywords: ["recession", `keyword-${i}`],
}));

describe("BlogList", () => {
  it("should render search and filter controls", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    expect(screen.getByPlaceholderText("Search articles...")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Daily Risk")).toBeInTheDocument();
    expect(screen.getByText("Weekly Reports")).toBeInTheDocument();
  });

  it("should paginate with 12 posts per page", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    expect(screen.getByText("Showing 1–12 of 25 articles")).toBeInTheDocument();
  });

  it("should navigate to page 2", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    const page2 = screen.getByText("2");
    fireEvent.click(page2);
    expect(screen.getByText("Showing 13–24 of 25 articles")).toBeInTheDocument();
  });

  it("should filter by content type", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    const dailyBtn = screen.getByText("Daily Risk");
    fireEvent.click(dailyBtn);
    const dailyCount = MOCK_POSTS.filter((p) => p.content_type === "daily_risk_assessment").length;
    expect(screen.getByText(new RegExp(`of ${dailyCount} articles`))).toBeInTheDocument();
  });

  it("should search by title", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    const input = screen.getByPlaceholderText("Search articles...");
    fireEvent.change(input, { target: { value: "Post 1" } });
    const matching = MOCK_POSTS.filter((p) => p.title.includes("Post 1"));
    expect(screen.getByText(new RegExp(`of ${matching.length} articles`))).toBeInTheDocument();
  });

  it("should show empty state when no results", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    const input = screen.getByPlaceholderText("Search articles...");
    fireEvent.change(input, { target: { value: "nonexistent" } });
    expect(screen.getByText("No matching articles")).toBeInTheDocument();
  });

  it("should show 'first report coming soon' for empty posts", () => {
    render(<BlogList posts={[]} />);
    expect(screen.getByText("First report coming soon")).toBeInTheDocument();
  });

  it("should clear filters", () => {
    render(<BlogList posts={MOCK_POSTS} />);
    const input = screen.getByPlaceholderText("Search articles...");
    fireEvent.change(input, { target: { value: "nonexistent" } });
    const clearBtn = screen.getByText("Clear filters");
    fireEvent.click(clearBtn);
    expect(screen.getByText("Showing 1–12 of 25 articles")).toBeInTheDocument();
  });
});
