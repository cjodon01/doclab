'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try again</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}