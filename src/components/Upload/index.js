import React, { useState, useEffect } from 'react'
import { Upload, Modal } from 'antd'
/* import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'; */
// import ImgCrop from 'antd-img-crop';
// import update from 'immutability-helper';
import { uploadImage } from '../../util/helpers'
import { IS_DEBUG } from '@src/constants/constants'

// const type = 'DragableUploadList';
const MAX_COUNT = 9

const moreUpload = (multiple, maxCount, fileList) => {
  if (!multiple) {
    if (fileList.length === 0) {
      return '+ Upload'
    }
    return null
  } else if (fileList.length === 0 || fileList.length <= maxCount) {
    return '+ Upload'
  }
  return null
}

/* const DragableUploadListItem = ({ originNode, moveRow, file, fileList }) => {
  const ref = React.useRef();
  const index = fileList.indexOf(file);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: item => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
  return (
    <div
      ref={ref}
      className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move' }}
    >
      {file.status === 'error' ? errorNode : originNode}
    </div>
  );
}; */

const UploadImage = (props) => {
  const {
    onChange: handeChange,
    action,
    headers,
    multiple = false,
    maxCount = MAX_COUNT,
    ...rest
  } = props
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState()
  if (IS_DEBUG) {
    console.log('@@props.value', props.value)
  }
  useEffect(() => {
    if (props.value && props.value.length > 0) {
      setFileList(props.value)
    }
  }, [props.value])

  /* const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = fileList[dragIndex];
      setFileList(
        update(fileList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        }),
      );
    },
    [fileList],
  ); */

  const onChange = ({ /* file,  */ fileList: newFileList /* , event */ }) => {
    setFileList(newFileList)
    if (IS_DEBUG) {
      console.log('@@newFileList', newFileList)
    }

    if (handeChange) {
      handeChange(newFileList)
    }
  }

  const customRequest = ({ onSuccess, file, onError }) => {
    uploadImage(file)
      .then((ret) => {
        const arrImg = {
          uid: '-1',
          name: ret.created[0].fileName,
          status: 'finished',
          url: ret.created[0].url,
        }
        onSuccess(arrImg, file)
        console.log('@@return', arrImg)
        // if (props.onChange) {
        //   props.onChange(arrImg);
        // }
      })
      .catch(onError)
  }

  const onPreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl)
    setPreviewVisible(true)
  }

  return (
    <>
      {/* <DndProvider backend={HTML5Backend}> */}
      {/* <ImgCrop rotate> */}
      <Upload
        {...rest}
        multiple={multiple}
        action={action}
        headers={headers}
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        customRequest={customRequest}
        onPreview={onPreview}
        maxCount={multiple ? maxCount : 1}
        // itemRender={(originNode, file, currFileList) => (
        //   <DragableUploadListItem
        //     originNode={originNode}
        //     file={file}
        //     fileList={currFileList}
        //     moveRow={moveRow}
        //   />
        // )}
      >
        {moreUpload(multiple, maxCount, fileList)}
        {/* {multiple === false && fileList.length === 0 && '+ Upload'} */}
        {/* {multiple === true && (fileList.length === 0 || fileList.length <= maxCount) && '+ Upload'} */}
      </Upload>
      {/* </ImgCrop> */}
      {/* </DndProvider> */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  )
}

export default UploadImage
