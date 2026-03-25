/**
 * PDF Generation Service for Petitions
 * Uses simple HTML-to-PDF conversion via browser print API
 */

export const petitionPdfService = {
  /**
   * Generate PDF filename based on case reference
   */
  generateFilename(caseReference: string, version: number): string {
    const timestamp = new Date().toISOString().split("T")[0];
    return `petition-${caseReference}-v${version}-${timestamp}.pdf`;
  },

  /**
   * Convert HTML content to PDF-ready format
   * Adds print CSS and page break styling
   */
  formatHtmlForPdf(html: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 3cm;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .page-break {
                page-break-after: always;
                margin: 0;
                padding: 0;
              }
            }

            body {
              font-family: "Times New Roman", Times, serif;
              line-height: 1.5;
              color: #333;
              font-size: 12pt;
            }

            h1, h2, h3, h4, h5, h6 {
              margin-top: 1em;
              margin-bottom: 0.5em;
              font-weight: bold;
            }

            h1 {
              font-size: 18pt;
              text-align: center;
              page-break-after: avoid;
            }

            h2 {
              font-size: 14pt;
              border-bottom: 1px solid #ccc;
              padding-bottom: 0.5em;
              page-break-after: avoid;
            }

            h3 {
              font-size: 13pt;
              page-break-after: avoid;
            }

            p {
              margin-bottom: 1em;
              text-align: justify;
              orphans: 3;
              widows: 3;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1em 0;
              page-break-inside: avoid;
            }

            th, td {
              border: 1px solid #999;
              padding: 0.5em;
              text-align: left;
            }

            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }

            strong, b {
              font-weight: bold;
            }

            em, i {
              font-style: italic;
            }

            ul, ol {
              margin-left: 2em;
              margin-bottom: 1em;
            }

            li {
              margin-bottom: 0.5em;
            }

            blockquote {
              margin-left: 2em;
              margin-right: 2em;
              padding-left: 1em;
              border-left: 3px solid #999;
              color: #666;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  },

  /**
   * Calculate estimated file size for PDF
   */
  estimateFileSize(htmlLength: number): number {
    // Rough estimate: 1 KB per 1000 HTML chars after compression
    return Math.ceil(htmlLength / 1000) * 1024;
  },
};
