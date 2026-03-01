import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("Error page", () => {
  it("should render error message and retry button", async () => {
    const ErrorPage = (await import("@/app/error")).default;
    const error = new Error("Test error");
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Go home")).toBeInTheDocument();
  });

  it("should call reset when retry button is clicked", async () => {
    const ErrorPage = (await import("@/app/error")).default;
    const error = new Error("Test error");
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);
    screen.getByText("Try again").click();
    expect(reset).toHaveBeenCalledOnce();
  });

  it("should display error digest when available", async () => {
    const ErrorPage = (await import("@/app/error")).default;
    const error = Object.assign(new Error("Test"), { digest: "abc123" });
    const reset = vi.fn();

    render(<ErrorPage error={error} reset={reset} />);
    expect(screen.getByText("Error ID: abc123")).toBeInTheDocument();
  });
});

describe("Loading page", () => {
  it("should render loading spinner", async () => {
    const Loading = (await import("@/app/loading")).default;
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
