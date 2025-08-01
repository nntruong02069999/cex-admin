import React from 'react'
import { Upload, UploadProps, Modal, Tooltip } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { v4 as uuid } from 'uuid'
import qs from 'qs'
import clone from 'lodash/clone'
import * as request from '@src/util/request'
import { UploadFile } from 'antd/lib/upload/interface'
import {
  UploadRequestOption,
  UploadRequestError,
} from 'rc-upload/lib/interface'
import { usePrevious } from '@src/packages/pro-utils'
import { useUpdateEffect } from '@src/packages/pro-table/component/util'
import { UploadChangeParam } from 'antd/es/upload/interface'

/* const DEFAULT_IMAGE_WIDTH = 200
const DEFAULT_IMAGE_HEIGHT = 180 */
const IMAGE_MAX_COUNT = 9

export type ImageProps = {
  schema?: any
  onChange?: (val: any) => void
  value?: any
  disabled?: boolean
  width?: number
  height?: number
  autoUpload?: boolean
  title?: string
  tooltip?: string
} & Omit<UploadProps, ''>

export type MyUploadFile = {
  id?: string | number
} & UploadFile

export interface MyUploadChangeParam<
  T extends {
    id?: string | number
  }
> extends Omit<UploadChangeParam, 'file' | 'fileList'> {
  file: T
  fileList: MyUploadFile[] & {
    name?: string
  }
}

const valueToFileList = (value: string | string[]): Array<UploadFile<any>> => {
  if (!value) return []
  let _value: Array<UploadFile<any>>
  if (Array.isArray(value)) {
    _value = value.map((url) => ({
      uid: uuid(),
      name: url.split('/')[url.split('/').length - 1],
      url,
      thumbUrl: url,
    }))
  } else {
    _value = [
      {
        uid: uuid(),
        name: value.split('/')[value.split('/').length - 1],
        url: value,
        thumbUrl: value,
      },
    ]
  }
  return _value
}

const fileListToValue = (
  fileList: Array<UploadFile<any>>,
  multiple: boolean
): string | string[] => {
  if (multiple) {
    if (!fileList) return []
    return fileList.map((i) => i?.url || '')
  } else {
    if (!fileList) return ''
    return (fileList[0] && fileList[0]?.url) || ''
  }
}

const ImageRichText: React.FC<ImageProps> = (props) => {
  const {
    title = 'Thêm ảnh',
    tooltip = 'Thêm ảnh',
    onChange: superChange,
    value,
    schema: initSchema,
    width: imageWidth,
    height: imageHeight,
    /* action,
    headers, */
    multiple = false,
    // autoUpload = true,
    maxCount = IMAGE_MAX_COUNT,
    ...rest
  } = props
  const [,] = React.useState(initSchema)
  const [fileList, setFileList] = React.useState<Array<UploadFile<any>>>(() =>
    valueToFileList(value)
  )
  const preFileList = usePrevious(fileList)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | undefined>()

  useUpdateEffect(() => {
    setFileList(valueToFileList(value))
    return () => undefined
  }, [value])

  const uploadFile = async (file: any) => {
    const formData = new FormData()
    formData.append('images', file)
    const queryInput: any = {}
    let url = ''
    if (imageWidth && imageHeight) {
      queryInput.width = imageWidth
      queryInput.height = imageHeight
      queryInput.isToJPG = 1
      url = `/api/file/v2/upload-image?${qs.stringify(queryInput)}`
    } else {
      url = `/api/file/v2/upload-image`
    }
    const rs = await request.upload(url, formData)
    // // // // // // // // // // // // console.log(`🚀 ~ file: Image.tsx ~ line 111 ~ uploadFile ~ rs`, rs)
    // superChange?.(rs.created[0].url)
    return {
      url: rs.created[0]?.url,
      fileName: rs.created[0]?.fileName ?? '',
    }
  }

  const customRequest = ({ onSuccess, file, onError }: UploadRequestOption) => {
    uploadFile(file)
      .then((ret) => {
        if (ret && ret.url) {
          try {
            const arrImg = {
              // uid: uuid(),
              uid: '-1',
              name:
                ret?.fileName ||
                ret?.url.split('/')[ret?.url.split('/').length - 1],
              status: 'done',
              url: ret.url,
            }

            onSuccess?.(arrImg, file as any)
          } catch (error) {
            // console.log(
            // `🚀 ~ file: Image.tsx ~ line 139 ~ .then ~ error`,
            // error
            // )
          }
        } else {
          const err: UploadRequestError = new Error('Upload lỗi')
          onError?.(err, ret)
        }
      })
      .catch((err) => {
        // console.log(
        // `🚀 ~ file: Image.tsx ~ line 136 ~ customRequest ~ err`,
        // err
        // )
        onError?.(err)
      })
  }

  const onPreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.thumbUrl)
    setPreviewVisible(true)
  }

  const onChange = ({
    file,
    fileList: newFileList,
  }: MyUploadChangeParam<MyUploadFile>) => {
    setFileList(newFileList)
    switch (file.status) {
      case 'done':
        {
          let _newFileList: any
          if (!multiple) {
            _newFileList = [
              {
                originFileObj: file,
                id: file.id,
                ...file,
                url: file?.response?.url || '',
              },
            ]
          } else {
            _newFileList = clone(preFileList || [])
            _newFileList.push({
              ...file,
              url: file?.response?.url || '',
            })
          }
          superChange?.(fileListToValue(_newFileList, multiple))
        }
        break
      case 'removed':
        {
          let _newFileList: any
          if (!multiple) {
            _newFileList = []
          } else {
            _newFileList = clone(newFileList || [])
          }
          superChange?.(fileListToValue(_newFileList, multiple))
        }
        break
      default:
        break
    }
  }

  const moreUpload = () => {
    const domUpload = (
      <>
        <Tooltip title={tooltip}>
          <UploadOutlined className="gx-text-orange" />
        </Tooltip>
        &nbsp;{title}
      </>
    )
    if (!multiple) {
      if (fileList.length === 0) {
        return domUpload
      }
      return null
    } else if (fileList.length === 0 || fileList.length <= maxCount) {
      return domUpload
    }
    return null
  }

  /* let { width, height } = this.state
    if (width && Number(width) > DEFAULT_IMAGE_WIDTH) {
      const ratio = Math.ceil(Number(width) / DEFAULT_IMAGE_WIDTH)
      width = Math.ceil(Number(width) / ratio)
      height = height
        ? Math.ceil(Number(height) / ratio)
        : DEFAULT_IMAGE_HEIGHT * ratio
    } */

  return (
    <>
      <Upload
        listType="picture-card"
        {...rest}
        multiple={multiple}
        /* action={action}
        headers={headers} */
        fileList={fileList}
        onChange={onChange}
        customRequest={customRequest}
        onPreview={onPreview}
        maxCount={multiple ? maxCount : 1}
        /* beforeUpload={(_file) => {
          return autoUpload
        }} */
      >
        {moreUpload()}
      </Upload>
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  )
}

export default ImageRichText
