import { Component, Fragment, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  attempt: number
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, attempt: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack)
  }

  retry = () => {
    // bumping attempt remounts the subtree so the failing component re-runs from scratch
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }))
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-md mx-auto card text-center mt-12">
          <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
          <p className="text-gray-400 text-sm mb-4">{this.state.error.message}</p>
          <button className="btn" onClick={this.retry}>
            Reintentar
          </button>
        </div>
      )
    }
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>
  }
}
