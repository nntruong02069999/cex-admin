import React, { useState, useEffect } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
/* import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'; */
// import ImgCrop from 'antd-img-crop';
// import update from 'immutability-helper';
import { uploadImage } from "util/helpers";

const MAX_COUNT = 9;
// const type = 'DragableUploadList';

/* const moreUpload = (multiple, maxCount, fileList) => {
  if (!multiple) {
    if (fileList.length === 0) {
      return '+ Upload';
    }
    return null;
  } else if (fileList.length === 0 || fileList.length <= maxCount) {
    return '+ Upload';
  }
  return null;
}; */

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
    autoUpload = true,
    maxCount = MAX_COUNT,
    ...rest
  } = props;
  const [fileList, setFileList] = useState([]);
  const [, setPreviewVisible] = useState(false);
  const [, setPreviewImage] = useState();

  useEffect(() => {
    if (props.value) {
      setFileList(props.value);
    }
  }, [props.value]);

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

  const onChange = ({ file, fileList: newFileList/* , event */ }) => {
    if (!multiple) {
      let newFileList1 = [{
        originFileObj: file,
        name: file.name,
        ...file,
        id: file.uid,
        url: file?.response?.url || '',
        path: `/uploads/${file.name}`
      }];
      setFileList(newFileList1);

      if (handeChange) {
        handeChange(newFileList1);
      }
    } else {
      newFileList = newFileList.map(item => ({
        originFileObj: file,
        name: file.name,
        ...item,
        id: item.uid,
        url: item?.response?.url || '',
        path: `/uploads/${item.name}`
      }));
      setFileList(newFileList);

      if (handeChange) {
        handeChange(newFileList);
      }
    }
  };

  const customRequest = ({ onSuccess, file, onError }) => {
    uploadImage(file)
      .then((ret) => {
        const arrImg = {
          status: "done",
          url: ret.url
        };
        onSuccess(arrImg, file);
        // if (props.onChange) {
        //   props.onChange(arrImg);
        // }
      })
      .catch(onError);
  };

  const onPreview = async file => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
  };

  return (
    <>
      {/* <DndProvider backend={HTML5Backend}> */}
      <Upload
        {...rest}
        multiple={multiple}
        action={action}
        headers={headers}
        fileList={fileList}
        onChange={onChange}
        customRequest={customRequest}
        onPreview={onPreview}
        maxCount={multiple ? maxCount : 1}
        beforeUpload={(_file) => {
          // if (!autoUpload) {
          //   if(multiple){
          //     setFileList(state => {
          //       let newFileList1 = [...state, file];
          //       if (handeChange) {
          //         handeChange(newFileList1);
          //       }
          //       return ;
          //     });
          //   }else {
          //     setFileList(state => {
          //       if (handeChange) {
          //         handeChange(file);
          //       }
          //       return [file];
          //     });
          //   }
          // }
          // setFileList(state => {
          //   return [...state, file];
          // });
          // return new Promise(resolve => {
          //   const reader = new FileReader();
          //   reader.readAsArrayBuffer(file);
          //   reader.onload = (e) => {
          //     const dataBit = new Uint8Array(e.target.result);
          //     const wb = XLSX.read(dataBit, { type: 'array' });
          //     /* Get first worksheet */
          //     const wsname = wb.SheetNames[0];
          //     const ws = wb.Sheets[wsname];
          //     /* Convert array of arrays */
          //     const data = XLSX.utils.sheet_to_json(ws);
          //     const cols = make_cols(ws['!ref']);
          //     resolve({ data, cols });
          //     console.log(`🚀 ~ file: index.js ~ line 181 ~ UploadImage ~ cols`, cols);
          //     console.log(`🚀 ~ file: index.js ~ line 175 ~ UploadImage ~ data`, data);
          //   };
          // });
          return autoUpload;
        }}
      // itemRender={(originNode, file, currFileList) => (
      //   <DragableUploadListItem
      //     originNode={originNode}
      //     file={file}
      //     fileList={currFileList}
      //     moveRow={moveRow}
      //   />
      // )}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      {/* </DndProvider> */}
    </>
  );
};

export default UploadImage;
