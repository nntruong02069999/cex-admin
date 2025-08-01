import { Component } from 'react'
import { Button } from 'antd'
import ImageWidget from './ImageWidget'
import _ from 'lodash'
class MultipleImageWidget extends Component<
  {
    value?: any
    schema?: any
    onChange?: (val?: any) => void
    onAddClick?: (val?: any) => void
  },
  {
    schema?: any
    width?: number
    height?: number
  }
> {
  constructor(props: any) {
    super(props)
    console.log('props', props)
    this.state = {
      schema: props.schema,
      width: props.schema.imageWidth,
      height: props.schema.imageHeight,
    }
  }

  addImage() {
    if (this.props.onAddClick) {
      console.log('on add click')
      return this.props.onAddClick()
    }
    const data = _.clone(this.props.value) || []
    data.push('')
    if (this.props.onChange) {
      this.props.onChange(data)
    }
  }
  removeImage(index: number) {
    const data = _.clone(this.props.value) || []
    data.splice(index, 1)
    if (this.props.onChange) {
      this.props.onChange(data)
    }
  }

  render() {
    console.log(this.props.value)
    return (
      <div>
        {(this.props.value || []).map((item: any, index: number) => (
          <div className="single-image-container" key={index}>
            <ImageWidget
              value={item}
              key={index}
              schema={this.props.schema}
              onChange={(e) => {
                const data = _.clone(this.props.value) || []
                data[index] = e
                if (this.props.onChange) {
                  this.props.onChange(data)
                }
              }}
            />
            <Button
              className="btn-remove-image"
              color="danger"
              onClick={() => {
                this.removeImage(index)
              }}
            >
              <i className="fa fa-remove"></i>
            </Button>
          </div>
        ))}
        <Button
          type="primary"
          onClick={() => {
            this.addImage()
          }}
        >
          <i className="fa fa-plus" /> Thêm ảnh
        </Button>
      </div>
    )
  }
}

export default MultipleImageWidget
