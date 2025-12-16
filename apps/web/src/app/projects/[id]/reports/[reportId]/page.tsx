'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { reportsApi, jobsApi } from '@/lib/api';

interface Report {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    userId: string;
    additionalContext?: string;
  };
  processingJobs: ProcessingJob[];
  summary?: {
    summaryData: unknown;
  };
}

interface ProcessingJob {
  id: string;
  status: string;
  stage?: string;
  progress: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const reportId = params.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const response = await reportsApi.get(reportId);
      setReport(response.data);
    } catch {
      router.push(`/projects/${projectId}`);
    } finally {
      setIsLoading(false);
    }
  }, [reportId, projectId, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Poll for job status when processing
  useEffect(() => {
    if (report?.status === 'PROCESSING') {
      const interval = setInterval(async () => {
        await fetchReport();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [report?.status, fetchReport]);

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    try {
      await reportsApi.startProcessing(reportId);
      await fetchReport();
    } catch (err) {
      console.error('Failed to start processing:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getLatestJob = () => {
    if (!report?.processingJobs?.length) return null;
    return report.processingJobs[0];
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 60) return 'bg-yellow-500';
    if (progress < 90) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStageLabel = (stage?: string) => {
    switch (stage) {
      case 'PARSING_CSV':
        return 'Parsing CSV...';
      case 'LEARNING_TOPICS':
        return 'Learning topics...';
      case 'CATEGORIZING_COMMENTS':
        return 'Categorizing comments...';
      case 'GENERATING_SUMMARY':
        return 'Generating summary...';
      case 'COMPLETE':
        return 'Complete!';
      default:
        return 'Starting...';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const latestJob = getLatestJob();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold">
            🧠 Sensemaker
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href={`/projects/${projectId}`} className="hover:text-foreground">
              {report.project.name}
            </Link>
            <span>/</span>
            <span>{report.name}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{report.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                report.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : report.status === 'PROCESSING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : report.status === 'FAILED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {report.status}
            </span>
            <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Processing Status */}
        {report.status === 'PENDING' && (
          <div className="mb-8 p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-4">Ready to Analyze</h2>
            <p className="text-muted-foreground mb-4">
              Start processing to analyze the uploaded CSV and generate insights.
            </p>
            <button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isProcessing ? 'Starting...' : '▶️ Start Analysis'}
            </button>
          </div>
        )}

        {report.status === 'PROCESSING' && latestJob && (
          <div className="mb-8 p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-4">Processing in Progress</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{getStageLabel(latestJob.stage)}</span>
                <span>{latestJob.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(latestJob.progress)}`}
                  style={{ width: `${latestJob.progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This may take several minutes depending on the size of your data.
            </p>
          </div>
        )}

        {report.status === 'FAILED' && latestJob && (
          <div className="mb-8 p-6 rounded-lg border border-destructive/50 bg-destructive/5">
            <h2 className="text-lg font-semibold mb-2 text-destructive">Processing Failed</h2>
            <p className="text-muted-foreground mb-4">
              {latestJob.error || 'An unknown error occurred during processing.'}
            </p>
            <button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              🔄 Retry
            </button>
          </div>
        )}

        {report.status === 'COMPLETED' && (
          <div className="space-y-8">
            {/* Summary Section */}
            <div className="p-6 rounded-lg border bg-card">
              <h2 className="text-lg font-semibold mb-4">Analysis Summary</h2>
              {report.summary ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    Analysis complete! The summary data is available.
                  </p>
                  {/* In a full implementation, we would render the summary contents here */}
                  <pre className="mt-4 p-4 bg-muted rounded-md text-xs overflow-auto">
                    {JSON.stringify(report.summary.summaryData, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Summary data is being generated...
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                📥 Export PDF
              </button>
              <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                📋 Export JSON
              </button>
              <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                🔗 Share Report
              </button>
            </div>
          </div>
        )}

        {/* Job History */}
        {report.processingJobs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Processing History</h2>
            <div className="space-y-2">
              {report.processingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        job.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'RUNNING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : job.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status}
                    </span>
                    {job.stage && (
                      <span className="text-sm text-muted-foreground">
                        {getStageLabel(job.stage)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {job.completedAt
                      ? new Date(job.completedAt).toLocaleString()
                      : job.startedAt
                      ? `Started ${new Date(job.startedAt).toLocaleString()}`
                      : 'Queued'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
