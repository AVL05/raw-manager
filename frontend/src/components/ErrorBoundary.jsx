import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <p className="text-5xl mb-6">⚠️</p>
            <h1 className="text-xl font-semibold text-zinc-100 mb-2">Algo salió mal</h1>
            <p className="text-sm text-zinc-500 mb-6">
              {this.state.error?.message ?? 'Error inesperado en la aplicación.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard' }}
              className="bg-white text-zinc-900 px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
