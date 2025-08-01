import React, { useEffect } from 'react';
import { Upload, UploadProps, Modal, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { v4 as uuid } from 'uuid';
import qs from 'qs';
import clone from 'lodash/clone';
import * as request from '@src/util/request';
import { UploadFile } from 'antd/lib/upload/interface';
import {
  UploadRequestOption,
  UploadRequestError,
} from 'rc-upload/lib/interface';
import { usePrevious } from '@src/packages/pro-utils';
import { useUpdateEffect } from '@src/packages/pro-table/component/util';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { IS_DEBUG } from '@src/constants/constants';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import _ from 'lodash';

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<
    any,
    string | React.JSXElementConstructor<any>
  >;
  file: UploadFile<any>;
}

const DraggableUploadListItem = ({
  originNode,
  file,
}: DraggableUploadListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: file.uid,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // prevent preview event when drag end
      className={isDragging ? 'is-dragging' : ''}
      {...attributes}
      {...listeners}
    >
      {/* hide error tooltip when dragging */}
      {file.status === 'error' && isDragging
        ? originNode.props.children
        : originNode}
    </div>
  );
};

/* const DEFAULT_IMAGE_WIDTH = 200
const DEFAULT_IMAGE_HEIGHT = 180 */
const IMAGE_MAX_COUNT = 9;

export type ImageProps = {
  schema?: any;
  onChange?: (val: any) => void;
  value?: string | { url: string };
  disabled?: boolean;
  width?: number;
  height?: number;
  autoUpload?: boolean;
  title?: string;
  tooltip?: string;
} & Omit<UploadProps, ''>;

export type MyUploadFile = {
  id?: string | number;
} & UploadFile;

export interface MyUploadChangeParam<
  T extends {
    id?: string | number;
  }
> extends Omit<UploadChangeParam, 'file' | 'fileList'> {
  file: T;
  fileList: MyUploadFile[] & {
    name?: string;
  };
}

const valueToFileList = (value: string | string[]): Array<UploadFile<any>> => {
  if (!value) return [];
  let _value: Array<UploadFile<any>>;
  if (Array.isArray(value)) {
    _value = value.map((url) => ({
      uid: uuid(),
      name: url.split('/')[url.split('/').length - 1],
      url,
      thumbUrl: url,
    }));
  } else {
    _value = [
      {
        uid: uuid(),
        name: value.split('/')[value.split('/').length - 1],
        url: value,
        thumbUrl: value,
      },
    ];
  }
  return _value;
};

const fileListToValue = (
  fileList: Array<UploadFile<any>>,
  multiple: boolean
): string | string[] => {
  if (multiple) {
    if (!fileList) return [];
    return fileList.map((i) => i?.url || '');
  } else {
    if (!fileList) return '';
    return (fileList[0] && fileList[0]?.url) || '';
  }
};

const Image: React.FC<ImageProps> = (props) => {
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
  } = props;
  const [,] = React.useState(initSchema);
  const [fileList, setFileList] = React.useState<Array<UploadFile<any>>>([]);
  const preFileList = usePrevious(fileList);
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | undefined>();

  useEffect(() => {
    if (value) {
      const fileUrl = typeof value === 'string' ? value : value.url;
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: fileUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [value]);

  useUpdateEffect(() => {
    if (
      !value ||
      (Array.isArray(value) &&
        _.isEqual(
          value,
          fileList.map((i) => i.url)
        ))
    )
      return;
    if (
      (typeof value == 'string' && fileList.length === 0) ||
      (Array.isArray(value) && value.length !== 0 && fileList.length === 0)
    ) {
      setFileList(valueToFileList(value));
    }
  }, [value]);

  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append('images', file);
    const queryInput: any = {};
    let url = '';
    if (imageWidth && imageHeight) {
      queryInput.width = imageWidth;
      queryInput.height = imageHeight;
      queryInput.isToJPG = 1;
      url = `/api/file/v2/upload-image?${qs.stringify(queryInput)}`;
    } else {
      url = `/api/file/v2/upload-image`;
    }
    const rs = await request.upload(url, formData);
    return {
      url: rs.created[0]?.url,
      fileName: rs.created[0]?.fileName ?? '',
    };
  };

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
            };

            onSuccess?.(arrImg, file as any);
          } catch (error) {
            if (IS_DEBUG) {
              console.log(error);
            }
          }
        } else {
          const err: UploadRequestError = new Error('Upload lỗi');
          onError?.(err, ret);
        }
      })
      .catch((err) => {
        onError?.(err);
      });
  };

  const onPreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };

  const onChange = ({
    file,
    fileList: newFileList,
  }: MyUploadChangeParam<MyUploadFile>) => {
    setFileList(newFileList);
    switch (file.status) {
      case 'done':
        {
          let _newFileList: any;
          if (!multiple) {
            _newFileList = [
              {
                originFileObj: file,
                id: file.id,
                ...file,
                url: file?.response?.url || '',
              },
            ];
          } else {
            _newFileList = clone(preFileList || []);
            _newFileList.push({
              ...file,
              url: file?.response?.url || '',
            });
          }
          superChange?.(fileListToValue(_newFileList, multiple));
        }
        break;
      case 'removed':
        {
          let _newFileList: any;
          if (!multiple) {
            _newFileList = [];
          } else {
            _newFileList = clone(newFileList || []);
          }
          superChange?.(fileListToValue(_newFileList, multiple));
        }
        break;
      default:
        break;
    }
  };

  const moreUpload = () => {
    const domUpload = (
      <>
        <Tooltip title={tooltip}>
          <UploadOutlined className='gx-text-orange' />
        </Tooltip>
      </>
    );
    if (!multiple) {
      if (fileList.length === 0) {
        return domUpload;
      }
      return null;
    } else if (fileList.length === 0 || fileList.length <= maxCount) {
      return domUpload;
    }
    return null;
  };

  /* let { width, height } = this.state
    if (width && Number(width) > DEFAULT_IMAGE_WIDTH) {
      const ratio = Math.ceil(Number(width) / DEFAULT_IMAGE_WIDTH)
      width = Math.ceil(Number(width) / ratio)
      height = height
        ? Math.ceil(Number(height) / ratio)
        : DEFAULT_IMAGE_HEIGHT * ratio
    } */

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setFileList((prev) => {
        const activeIndex = prev.findIndex((i) => i.uid === active.id);
        const overIndex = prev.findIndex((i) => i.uid === over?.id);
        const newData = arrayMove(prev, activeIndex, overIndex);
        superChange?.(fileListToValue(newData, multiple));
        return newData;
      });
    }
  };

  return (
    <>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext
          items={fileList.map((i) => i.uid)}
          strategy={horizontalListSortingStrategy}
        >
          <Upload
            listType='picture-card'
            {...rest}
            multiple={multiple}
            fileList={fileList}
            onChange={onChange}
            customRequest={customRequest}
            onPreview={onPreview}
            maxCount={multiple ? maxCount : 1}
            itemRender={(originNode, file) => (
              <DraggableUploadListItem originNode={originNode} file={file} />
            )}
            style={{
              width: '100%',
              height: '100%',
              ...((!multiple && fileList.length === 0) ||
              (multiple && fileList.length < maxCount)
                ? {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }
                : {}),
            }}
          >
            {moreUpload()}
          </Upload>
        </SortableContext>
      </DndContext>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={'100%'}
      >
        <img style={{ width: '100%', height: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default Image;
