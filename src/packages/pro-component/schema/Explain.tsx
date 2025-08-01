import { Component } from 'react'
class Explain extends Component<{
  schema?: any
}> {
  render() {
    return <pre>{this.props.schema.intro}</pre>
  }
}

export default Explain
