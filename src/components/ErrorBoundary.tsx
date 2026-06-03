import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-md mx-auto card text-center mt-12">
          <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
          <p className="text-gray-400 text-sm mb-4">{this.state.error.message}</p>
          <button className="btn" onClick={() => this.setState({ error: null })}>
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
