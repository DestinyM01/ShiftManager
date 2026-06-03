import { Component } from "react"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
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
