import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error in component tree:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
          <div className="max-w-sm w-full bg-[#161b22] border border-[#1f2937] rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f87171]/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-[#f87171]" />
            </div>
            <h1 className="text-base font-medium text-[#f5f5f0] mb-1">Something went wrong</h1>
            <p className="text-sm text-[#8b95a1] mb-5">
              {this.state.error?.message || 'The app hit an unexpected error. Reloading usually fixes it.'}
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm px-4 py-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              <RefreshCw size={15} />
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
