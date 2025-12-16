'use client';

import { useState } from 'react';
import {
  TopicsDistributionChart,
  TopicsOverviewPieChart,
  AlignmentChart,
} from '@/components/visualizations';

interface SummaryContent {
  type?: string;
  title?: string;
  text: string;
  citations?: string[];
  subContents?: SummaryContent[];
}

interface Topic {
  name: string;
  count: number;
  subtopics?: { name: string; count: number }[];
}

interface ReportViewerProps {
  reportName: string;
  projectName: string;
  createdAt: string;
  summary: SummaryContent[];
  topics: Topic[];
  commentCount: number;
  onExportPdf?: () => void;
  onExportJson?: () => void;
  onExportHtml?: () => void;
}

export function ReportViewer({
  reportName,
  projectName,
  createdAt,
  summary,
  topics,
  commentCount,
  onExportPdf,
  onExportJson,
  onExportHtml,
}: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'topics' | 'charts'>('summary');

  return (
    <div className="bg-card rounded-lg border">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold mb-2">{reportName}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Project: {projectName}</span>
          <span>•</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{commentCount} comments analyzed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4 px-6">
          {(['summary', 'topics', 'charts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="prose prose-sm max-w-none">
            {summary.length === 0 ? (
              <p className="text-muted-foreground">No summary content available.</p>
            ) : (
              summary.map((content, index) => (
                <SummarySection key={index} content={content} />
              ))
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div>
            {topics.length === 0 ? (
              <p className="text-muted-foreground">No topics available.</p>
            ) : (
              <div className="space-y-4">
                {topics.map((topic, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{topic.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {topic.count} comments
                      </span>
                    </div>
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {topic.subtopics.map((subtopic, subIndex) => (
                          <div
                            key={subIndex}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">• {subtopic.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {subtopic.count} comments
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-8">
            {topics.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-4">Topics Distribution</h3>
                  <div className="flex justify-center">
                    <TopicsDistributionChart topics={topics} />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Topics Overview</h3>
                  <div className="flex justify-center">
                    <TopicsOverviewPieChart topics={topics} />
                  </div>
                </div>
              </>
            )}

            {topics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No chart data available
              </p>
            )}
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="p-6 border-t flex gap-4">
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            📥 Export PDF
          </button>
        )}
        {onExportJson && (
          <button
            onClick={onExportJson}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            📋 Export JSON
          </button>
        )}
        {onExportHtml && (
          <button
            onClick={onExportHtml}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            🌐 Export HTML
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Recursive component to render summary content
 */
function SummarySection({ content, level = 0 }: { content: SummaryContent; level?: number }) {
  const HeadingTag = (['h2', 'h3', 'h4', 'h5', 'h6'] as const)[Math.min(level, 4)];

  return (
    <div className={`mb-4 ${level > 0 ? 'ml-4' : ''}`}>
      {content.title && (
        <HeadingTag className="font-semibold mb-2">
          {content.title}
        </HeadingTag>
      )}

      {content.text && (
        <p className="text-sm text-muted-foreground mb-2">{content.text}</p>
      )}

      {content.citations && content.citations.length > 0 && (
        <div className="text-xs text-muted-foreground italic mb-2">
          Citations: {content.citations.join(', ')}
        </div>
      )}

      {content.subContents && content.subContents.length > 0 && (
        <div className="space-y-2">
          {content.subContents.map((subContent, index) => (
            <SummarySection key={index} content={subContent} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
