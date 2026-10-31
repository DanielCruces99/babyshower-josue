import { Component } from 'react'

// Atrapa errores de carga de modelos dentro del Canvas y avisa a App para mostrar la versión de texto.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
