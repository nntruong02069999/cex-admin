import { Component } from 'react'
import { Input } from 'antd'
import * as request from '@src/util/request'
import { helper } from '@src/controls/controlHelper'
class UploadWidget extends Component<
  {
    onChange?: (val: any) => void
    disabled?: boolean
  },
  {
    width: number
    height: number
  }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      width: props.width,
      height: props.height,
    }
  }
  async uploadFile(file: File) {
    try {
      const formData = new FormData()
      formData.append('files', file)
      const rs = await request.upload(`/api/file/upload-file`, formData)
      if (this.props.onChange) {
        this.props.onChange(rs.created[0].id)
      }
    } catch (err: any) {
      helper.alert(err.message)
    }
  }
  render() {
    return (
      <div>
        <Input
          type="file"
          disabled={this.props.disabled}
          onChange={(evt: any) => {
            this.uploadFile(evt.target.files[0])
          }}
        />
      </div>
    )
  }
}

export default UploadWidget
