'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { projectsApi, uploadsApi, reportsApi } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  additionalContext?: string;
  createdAt: string;
  reports: Report[];
  csvUploads: CsvUpload[];
  _count?: {
    reports: number;
    csvUploads: number;
    topics: number;
    comments: number;
  };
}

interface Report {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface CsvUpload {
  id: string;
  originalFilename: string;
  rowCount: number;
  status: string;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsApi.get(projectId);
      setProject(response.data);
      setEditName(response.data.name);
      setEditDescription(response.data.description || '');
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadResult = await uploadsApi.upload(projectId, file);
      
      if (!uploadResult.data.validation?.valid) {
        setUploadError(uploadResult.data.validation?.error || 'Invalid CSV format');
        return;
      }

      // Create a report for this upload
      const reportResult = await reportsApi.create({
        projectId,
        name: file.name.replace(/\.(csv|tsv)$/i, ''),
      });

      // Refresh project data
      await fetchProject();

      // Navigate to report
      router.push(`/projects/${projectId}/reports/${reportResult.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setUploadError(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsApi.update(projectId, {
        name: editName,
        description: editDescription,
      });
      await fetchProject();
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsApi.delete(projectId);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold">
            🧠 Sensemaker
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{project._count?.reports || 0} reports</span>
              <span>{project._count?.topics || 0} topics</span>
              <span>{project._count?.comments || 0} comments</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="rounded-md px-4 py-2 text-sm font-medium border hover:bg-muted"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteProject}
              className="rounded-md px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8 p-6 rounded-lg border bg-card">
          <h2 className="text-lg font-semibold mb-4">Upload CSV for Analysis</h2>
          <div className="flex items-center gap-4">
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium cursor-pointer transition-colors
                ${isUploading ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              {isUploading ? 'Uploading...' : '📤 Upload CSV'}
              <input
                id="file-upload"
                type="file"
                accept=".csv,.tsv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
            <span className="text-sm text-muted-foreground">
              Supports CSV and TSV files up to 100MB
            </span>
          </div>
          {uploadError && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 text-sm text-destructive">
              {uploadError}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Reports</h2>
          {project.reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No reports yet. Upload a CSV to create your first report.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {project.reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/projects/${projectId}/reports/${report.id}`}
                  className="block p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium mb-2">{report.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
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
                    <span className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Uploads Section */}
        {project.csvUploads.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
            <div className="space-y-2">
              {project.csvUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <span className="font-medium">{upload.originalFilename}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({upload.rowCount} rows)
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      upload.status === 'VALIDATED'
                        ? 'bg-green-100 text-green-800'
                        : upload.status === 'INVALID'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {upload.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="projectDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
