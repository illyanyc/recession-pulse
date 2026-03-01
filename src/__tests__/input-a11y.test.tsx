import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/Input";

describe("Input component accessibility", () => {
  it("should associate label with input via htmlFor/id", () => {
    render(<Input label="Username" />);
    const input = screen.getByLabelText("Username");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("should use provided id", () => {
    render(<Input label="Email" id="custom-email" />);
    const input = screen.getByLabelText("Email");
    expect(input.id).toBe("custom-email");
  });

  it("should mark input as invalid when error is provided", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should link error message via aria-describedby", () => {
    render(<Input label="Email" error="Required field" />);
    const input = screen.getByLabelText("Email");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!);
    expect(errorEl?.textContent).toBe("Required field");
  });

  it("should render without label", () => {
    render(<Input placeholder="No label" />);
    const input = screen.getByPlaceholderText("No label");
    expect(input).toBeInTheDocument();
  });
});
