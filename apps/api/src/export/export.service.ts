/**
 * @fileoverview Export service for generating PDF and JSON exports.
 */

import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

interface SummaryContent {
  type?: string;
  title?: string;
  text: string;
  citations?: string[];
  subContents?: SummaryContent[];
}

interface ExportData {
  reportName: string;
  projectName: string;
  createdAt: string;
  summary: SummaryContent[];
  topics: { name: string; subtopics?: { name: string }[] }[];
  commentCount: number;
}

@Injectable()
export class ExportService {
  /**
   * Generate PDF from report data
   */
  async generatePdf(data: ExportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text(data.reportName, { align: 'center' });
      doc.moveDown();

      // Project info
      doc.fontSize(12).font('Helvetica').text(`Project: ${data.projectName}`);
      doc.text(`Generated: ${new Date(data.createdAt).toLocaleDateString()}`);
      doc.text(`Comments Analyzed: ${data.commentCount}`);
      doc.moveDown(2);

      // Topics Overview
      doc.fontSize(18).font('Helvetica-Bold').text('Topics Overview');
      doc.moveDown(0.5);

      for (const topic of data.topics) {
        doc.fontSize(14).font('Helvetica-Bold').text(`• ${topic.name}`);
        if (topic.subtopics && topic.subtopics.length > 0) {
          for (const subtopic of topic.subtopics) {
            doc.fontSize(12).font('Helvetica').text(`  - ${subtopic.name}`);
          }
        }
        doc.moveDown(0.5);
      }

      doc.moveDown();

      // Summary
      doc.fontSize(18).font('Helvetica-Bold').text('Summary');
      doc.moveDown(0.5);

      this.renderSummaryContent(doc, data.summary);

      // Finalize PDF
      doc.end();
    });
  }

  /**
   * Render summary content recursively
   */
  private renderSummaryContent(doc: PDFKit.PDFDocument, contents: SummaryContent[], level = 0): void {
    for (const content of contents) {
      const indent = level * 20;

      if (content.title) {
        const fontSize = Math.max(16 - level * 2, 10);
        doc.fontSize(fontSize).font('Helvetica-Bold').text(content.title, { indent });
        doc.moveDown(0.25);
      }

      if (content.text) {
        doc.fontSize(11).font('Helvetica').text(content.text, { indent, align: 'justify' });
        doc.moveDown(0.5);
      }

      if (content.citations && content.citations.length > 0) {
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666')
          .text(`Citations: ${content.citations.join(', ')}`, { indent });
        doc.fillColor('#000000');
        doc.moveDown(0.5);
      }

      if (content.subContents && content.subContents.length > 0) {
        this.renderSummaryContent(doc, content.subContents, level + 1);
      }
    }
  }

  /**
   * Generate JSON export
   */
  async generateJson(data: ExportData): Promise<string> {
    return JSON.stringify({
      metadata: {
        reportName: data.reportName,
        projectName: data.projectName,
        createdAt: data.createdAt,
        commentCount: data.commentCount,
        exportedAt: new Date().toISOString(),
      },
      topics: data.topics,
      summary: data.summary,
    }, null, 2);
  }

  /**
   * Generate HTML export
   */
  async generateHtml(data: ExportData): Promise<string> {
    const summaryHtml = this.renderSummaryHtml(data.summary);
    const topicsHtml = data.topics.map(topic => {
      const subtopicsHtml = topic.subtopics
        ? topic.subtopics.map(st => `<li>${st.name}</li>`).join('')
        : '';
      return `
        <li>
          <strong>${topic.name}</strong>
          ${subtopicsHtml ? `<ul>${subtopicsHtml}</ul>` : ''}
        </li>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.reportName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 { color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        h3 { color: #555; }
        .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
        .citation { font-size: 12px; color: #888; font-style: italic; }
        ul { padding-left: 20px; }
        .summary-section { margin-bottom: 20px; }
        @media print {
            body { max-width: none; }
        }
    </style>
</head>
<body>
    <h1>${data.reportName}</h1>
    <div class="meta">
        <p>Project: ${data.projectName}</p>
        <p>Generated: ${new Date(data.createdAt).toLocaleDateString()}</p>
        <p>Comments Analyzed: ${data.commentCount}</p>
    </div>

    <h2>Topics Overview</h2>
    <ul>${topicsHtml}</ul>

    <h2>Summary</h2>
    ${summaryHtml}
</body>
</html>
    `;
  }

  /**
   * Render summary content to HTML
   */
  private renderSummaryHtml(contents: SummaryContent[], level = 0): string {
    return contents.map(content => {
      const titleTag = `h${Math.min(level + 3, 6)}`;
      let html = '<div class="summary-section">';
      
      if (content.title) {
        html += `<${titleTag}>${content.title}</${titleTag}>`;
      }
      
      if (content.text) {
        html += `<p>${content.text}</p>`;
      }
      
      if (content.citations && content.citations.length > 0) {
        html += `<p class="citation">Citations: ${content.citations.join(', ')}</p>`;
      }
      
      if (content.subContents && content.subContents.length > 0) {
        html += this.renderSummaryHtml(content.subContents, level + 1);
      }
      
      html += '</div>';
      return html;
    }).join('');
  }
}
