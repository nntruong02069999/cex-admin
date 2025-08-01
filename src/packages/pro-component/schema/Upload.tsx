import { Component } from 'react';
import { Input } from 'antd';
import * as request from '@src/util/request';
import { helper } from '@src/controls/controlHelper';

class Upload extends Component<
  {
    schema: Record<string, any>;
    disabled?: boolean;
    invalid?: boolean;
    value: any;
    onChange?: (val: any) => void;
  },
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      width: props.width,
      height: props.height,
      progress: 0,
      uploading: false,
    };
  }

  async uploadFile(file: File) {
    try {
      const formData = new FormData();
      formData.append('files', file);
      this.setState({ uploading: true });
      const interval = setInterval(() => {
        this.setState((prevState: any) => ({
          progress: prevState.progress + 10,
        }));
        if (this.state.progress >= 100) {
          clearInterval(interval);
          this.setState({ uploading: false, progress: 0 });
        }
      }, 800);
      const rs = await request.upload(`/api/file/upload-file`, formData);
      if (this.props.onChange) {
        this.setState({ progress: 100 });
        this.props.onChange(rs.created[0].id);
      }
    } catch (err: any) {
      helper.alert(err.message);
    }
  }
  render() {
    const { progress, uploading } = this.state;
    return (
      <div>
        <Input
          type='file'
          disabled={this.props.disabled}
          onChange={(evt: any) => {
            this.uploadFile(evt.target.files[0]);
          }}
        />
        {uploading && <div>Đang đẩy file...: {progress}%</div>}
      </div>
    );
  }
}

export default Upload;
