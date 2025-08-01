import Widgets from './index'
import { Button } from 'antd'
export default (props: any) => {
  switch (props.uiSchema['ui:widget']) {
    case 'ImageWidget':
      return (
        <div>
          {(props.formData || []).map((d: any, index: number) => {
            return (
              <div key={index} className="single-image-container">
                <Widgets.ImageWidget
                  value={d}
                  schema={props.schema}
                  onChange={(e: any) => {
                    props.items[index].children.props.onChange(e)
                  }}
                />
                <Button
                  className="btn-remove-image"
                  color="danger"
                  onClick={props.items[index].onDropIndexClick(
                    props.items[index].index
                  )}
                >
                  <i className="fa fa-remove"></i>
                </Button>
              </div>
            )
          })}
          <Button onClick={props.onAddClick} color="primary">
            <i className="fa fa-plus" />
          </Button>
        </div>
      )
    case 'ModelSelectWidget':
      return (
        <Widgets.ArrayModelSelect
          value={props.formData || []}
          schema={props.schema}
          onItemAdded={(e: any) => {
            props.onAddClick({ preventDefault: () => {}, target: { value: e } })
          }}
          onItemGetValue={(val: any) => {
            props.items[props.items.length - 1].children.props.onChange(val)
          }}
          onItemRemoved={(val:any) => {
            let index = 0
            for (let i = 0; i < props.formData.length; i++) {
              if (props.formData[i] === val) {
                index = i
                break
              }
            }
            props.items[index].onDropIndexClick(props.items[index].index)()
          }}
          onChange={() => {}}
        />
      )
    default:
      return null
  }
}
