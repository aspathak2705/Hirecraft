import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a0f1d',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#161e31',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#f59e0b' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
              We encountered an unexpected application issue. Your diagnostic information and submitted inputs remain safe.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reload Page
              </button>
              <button 
                onClick={this.handleReset}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Return to HireCraft
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
