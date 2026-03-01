import { describe, it, expect } from "vitest";
import { markdownToHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  it("should convert headings", async () => {
    const html = await markdownToHtml("## Hello World");
    expect(html).toContain("<h2>");
    expect(html).toContain("Hello World");
  });

  it("should convert bold text", async () => {
    const html = await markdownToHtml("This is **bold** text");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("should convert italic text", async () => {
    const html = await markdownToHtml("This is *italic* text");
    expect(html).toContain("<em>italic</em>");
  });

  it("should convert links with rel and target attributes", async () => {
    const html = await markdownToHtml("[RecessionPulse](https://recessionpulse.com)");
    expect(html).toContain('href="https://recessionpulse.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("should convert unordered lists", async () => {
    const html = await markdownToHtml("- Item 1\n- Item 2\n- Item 3");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("Item 1");
  });

  it("should convert horizontal rules", async () => {
    const html = await markdownToHtml("Above\n\n---\n\nBelow");
    expect(html).toContain("<hr");
  });

  it("should sanitize XSS attempts in scripts", async () => {
    const html = await markdownToHtml('<script>alert("xss")</script>');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert");
  });

  it("should sanitize XSS attempts in event handlers", async () => {
    const html = await markdownToHtml('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("onerror");
  });

  it("should sanitize javascript: URLs", async () => {
    const html = await markdownToHtml('[click me](javascript:alert(1))');
    expect(html).not.toContain("javascript:");
  });

  it("should handle GFM tables", async () => {
    const md = `| Col A | Col B |\n| --- | --- |\n| 1 | 2 |`;
    const html = await markdownToHtml(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<td>");
  });

  it("should handle inline code", async () => {
    const html = await markdownToHtml("Use `npm install` to install");
    expect(html).toContain("<code>npm install</code>");
  });

  it("should handle empty input", async () => {
    const html = await markdownToHtml("");
    expect(html).toBe("");
  });
});
