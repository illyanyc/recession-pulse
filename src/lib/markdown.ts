import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import sanitize from "sanitize-html";

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: sanitize.defaults.allowedTags.concat([
    "h1", "h2", "h3", "h4", "h5", "h6",
    "img", "del", "table", "thead", "tbody", "tr", "th", "td",
    "hr", "br", "details", "summary",
  ]),
  allowedAttributes: {
    ...sanitize.defaults.allowedAttributes,
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "title", "width", "height"],
    th: ["align"],
    td: ["align"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
};

export async function markdownToHtml(md: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(md);

  return sanitize(result.toString(), SANITIZE_OPTIONS);
}
