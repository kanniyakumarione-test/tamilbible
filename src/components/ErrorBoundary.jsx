import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell app-page flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center bg-[#000000]">
          <div className="app-surface rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/10 max-w-lg w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent opacity-50 pointer-events-none" />
            <h1 className="text-6xl font-black text-zinc-200 mb-6">Oops</h1>
            <h2 className="text-xl font-bold text-white mb-4">
              Something went wrong.
            </h2>
            <p className="text-sm text-stone-400 mb-8 max-w-sm mx-auto leading-relaxed">
              We're sorry, but the application encountered an unexpected error. 
              Please try refreshing the page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-white/20 transition active:scale-95"
              >
                Reload App
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
               <div className="mt-8 p-4 bg-black/50 rounded-xl border border-red-500/20 text-left overflow-auto max-h-40">
                  <p className="text-red-400 text-xs font-mono whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
               </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
