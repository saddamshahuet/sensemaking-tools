import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🧠 Sensemaker
        </h1>
        <p className="text-xl text-muted-foreground mb-8 text-center max-w-2xl">
          Transform community feedback at scale into actionable insights through AI-powered conversation analysis.
        </p>
        
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="rounded-lg px-6 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg px-6 py-3 bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg mb-2">📊 Analyze at Scale</h3>
            <p className="text-muted-foreground text-sm">
              Process thousands of comments in minutes with AI-powered topic extraction.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg mb-2">🔍 Grounded Insights</h3>
            <p className="text-muted-foreground text-sm">
              Every claim is linked to source comments for full transparency.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg mb-2">👥 Collaborate</h3>
            <p className="text-muted-foreground text-sm">
              Share projects and reports with your team for collective analysis.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
