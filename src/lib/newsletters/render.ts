export type NewsletterRenderInput = {
  title: string;
  subject?: string;
  previewText?: string | null;
  heroImage?: string | null;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export function escapeNewsletterHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderParagraphs(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return `<p style="margin: 0; color: rgba(36,38,23,0.68);">Your newsletter content will appear here.</p>`;
  }

  return paragraphs
    .map(
      (paragraph) => `
        <p style="margin: 0 0 20px; color: rgba(36,38,23,0.72); font-size: 15px; line-height: 1.8;">
          ${escapeNewsletterHtml(paragraph).replaceAll("\n", "<br />")}
        </p>
      `,
    )
    .join("");
}

export function buildNewsletterHtml(input: NewsletterRenderInput) {
  const title = input.title || "Untitled newsletter";
  const previewText = input.previewText || "";
  const heroImage = input.heroImage || "";
  const ctaLabel = input.ctaLabel || "";
  const ctaHref = input.ctaHref || "";

  return `<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeNewsletterHtml(input.subject || title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f4efe4;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      ${escapeNewsletterHtml(previewText)}
    </div>

    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:#f4efe4; margin:0; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="max-width:680px; background:#fffaf0; border:1px solid rgba(36,38,23,0.10); border-radius:28px; overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px; text-align:center;">
                <p style="margin:0; color:#b88a3b; font-family:Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase;">
                  Odyssea Vision
                </p>

                <h1 style="margin:18px 0 0; color:#242617; font-family:Georgia,serif; font-size:44px; line-height:0.96; letter-spacing:-0.04em; text-transform:uppercase;">
                  ${escapeNewsletterHtml(title)}
                </h1>

                ${
                  previewText
                    ? `<p style="margin:18px auto 0; max-width:460px; color:rgba(36,38,23,0.56); font-family:Arial,sans-serif; font-size:14px; line-height:1.7;">${escapeNewsletterHtml(previewText)}</p>`
                    : ""
                }
              </td>
            </tr>

            ${
              heroImage
                ? `<tr>
                    <td style="padding:0 32px 28px;">
                      <img src="${escapeNewsletterHtml(heroImage)}" alt="" style="display:block; width:100%; max-height:360px; object-fit:cover; border-radius:22px;" />
                    </td>
                  </tr>`
                : ""
            }

            <tr>
              <td style="padding:0 32px 34px; font-family:Arial,sans-serif;">
                ${renderParagraphs(input.body)}

                ${
                  ctaLabel && ctaHref
                    ? `<div style="padding-top:12px;">
                        <a href="${escapeNewsletterHtml(ctaHref)}" style="display:inline-block; background:#071321; color:#f4efe4; padding:14px 22px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; text-decoration:none;">
                          ${escapeNewsletterHtml(ctaLabel)}
                        </a>
                      </div>`
                    : ""
                }
              </td>
            </tr>

            <tr>
              <td style="padding:22px 32px; background:#071321; color:rgba(244,239,228,0.72); font-family:Arial,sans-serif; font-size:11px; line-height:1.7; text-align:center;">
                You are receiving this email because you subscribed to Odyssea Vision updates.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildNewsletterText(input: NewsletterRenderInput) {
  return [
    input.title,
    "",
    input.previewText || "",
    "",
    input.body,
    "",
    input.ctaLabel && input.ctaHref ? `${input.ctaLabel}: ${input.ctaHref}` : "",
    "",
    "Odyssea Vision",
  ]
    .filter(Boolean)
    .join("\n");
}
