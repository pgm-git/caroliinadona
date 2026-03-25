/**
 * DOCX Generation Service for Petitions
 * Converts HTML to basic DOCX structure
 */

export const petitionDocxService = {
  /**
   * Convert HTML to basic DOCX XML structure
   * DOCX is actually a ZIP with XML files inside
   * This creates a simplified version that can be extracted by basic tools
   */
  generateDocxContent(htmlContent: string, title: string): {
    document: string;
    contentTypes: string;
    rels: string;
  } {
    // Extract text content from HTML (simple regex approach)
    const textContent = htmlContent
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    // Create Word Open XML document
    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>${escapeXml(title)}</w:t>
      </w:r>
    </w:p>
    ${textContent
      .split("\n")
      .filter((line) => line.trim())
      .map((paragraph) => {
        return `<w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
        <w:jc w:val="both"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>${escapeXml(paragraph)}</w:t>
      </w:r>
    </w:p>`;
      })
      .join("\n")}
  </w:body>
</w:document>`;

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    return { document, contentTypes, rels };
  },

  /**
   * Generate filename for DOCX
   */
  generateFilename(caseReference: string, version: number): string {
    const timestamp = new Date().toISOString().split("T")[0];
    return `petition-${caseReference}-v${version}-${timestamp}.docx`;
  },
};

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
