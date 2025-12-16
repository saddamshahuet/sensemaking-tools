/**
 * @fileoverview Export controller for PDF and JSON export endpoints.
 */

import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { ReportsService } from '../reports/reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get('reports/:id/pdf')
  @ApiOperation({ summary: 'Export report as PDF' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportPdf(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.findByIdWithSummary(id, req.user.id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const exportData = this.buildExportData(report);
    const pdfBuffer = await this.exportService.generatePdf(exportData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${this.sanitizeFilename(report.name)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Get('reports/:id/json')
  @ApiOperation({ summary: 'Export report as JSON' })
  @ApiResponse({ status: 200, description: 'JSON file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportJson(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.findByIdWithSummary(id, req.user.id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const exportData = this.buildExportData(report);
    const jsonContent = await this.exportService.generateJson(exportData);

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${this.sanitizeFilename(report.name)}.json"`,
    });

    res.send(jsonContent);
  }

  @Get('reports/:id/html')
  @ApiOperation({ summary: 'Export report as HTML' })
  @ApiResponse({ status: 200, description: 'HTML file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportHtml(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.findByIdWithSummary(id, req.user.id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const exportData = this.buildExportData(report);
    const htmlContent = await this.exportService.generateHtml(exportData);

    if (download === 'true') {
      res.set({
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${this.sanitizeFilename(report.name)}.html"`,
      });
    } else {
      res.set({
        'Content-Type': 'text/html',
      });
    }

    res.send(htmlContent);
  }

  /**
   * Build export data from report
   */
  private buildExportData(report: {
    name: string;
    createdAt: Date;
    project: { name: string };
    summary?: { summaryData: unknown } | null;
    outputJson?: Record<string, unknown> | null;
  }) {
    const summaryData = report.summary?.summaryData || [];
    const outputJson = report.outputJson || {};

    return {
      reportName: report.name,
      projectName: report.project.name,
      createdAt: report.createdAt.toISOString(),
      summary: Array.isArray(summaryData) ? summaryData : [],
      topics: (outputJson as { topics?: unknown[] }).topics || [],
      commentCount: (outputJson as { commentCount?: number }).commentCount || 0,
    };
  }

  /**
   * Sanitize filename for safe download
   */
  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 200);
  }
}
