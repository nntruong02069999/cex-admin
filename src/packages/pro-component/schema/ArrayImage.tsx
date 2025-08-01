import React, { useEffect, useState } from 'react';
import { Space, Button, Row, Col, Progress, Modal } from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import Image from './Image';
import { Image as AntImage } from 'antd';

interface ArrayImageProps {
  value?: string[] | { url: string }[];
  onChange?: (value: string[]) => void;
  onAddClick?: () => void;
  schema?: any;
}

const ArrayImage: React.FC<ArrayImageProps> = ({
  value,
  onChange,
  onAddClick,
  schema,
}) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const urls = value.map((item) =>
        typeof item === 'string' ? item : item.url
      );
      setImages(urls);
    } else {
      setImages([]);
    }
  }, [value]);

  const handleImageChange = (index: number) => (newValue: any) => {
    const newImages = [...images];
    newImages[index] =
      typeof newValue === 'string' ? newValue : newValue.file.response;
    setImages(newImages);
    onChange?.(newImages);
  };

  const handleAddImage = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const handleRemoveImage = (index: number) => {
    Modal.confirm({
      title: 'Xoá hình ảnh',
      content: 'Bạn có chắc chắn muốn xóa hình ảnh này?',
      okText: 'Đồng ý',
      onOk: () => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onChange?.(newImages);
      },
    });
  };

  return (
    // <Space direction='vertical' size='middle'>
    //   {images.map((image, index) => (
    //     <Space key={index} align='start'>
    //       <Image value={image} onChange={handleImageChange(index)} />
    //       <Button onClick={() => handleRemoveImage(index)} danger>
    //         Xoá
    //       </Button>
    //     </Space>
    //   ))}
    //   {images.length < 5 && (
    //     <Button onClick={handleAddImage} icon={<PlusOutlined />}>
    //       Thêm ảnh
    //     </Button>
    //   )}
    // </Space>
    <AntImage.PreviewGroup>
      <Row gutter={[8, 8]}>
        {images.map((image, index) => (
          <Col key={index} xs={12} sm={8} md={6} lg={4}>
            <div
              style={{
                position: 'relative',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                overflow: 'hidden',
                height: '100px',
                width: '100%',
              }}
            >
              {image ? (
                <AntImage
                  src={image}
                  alt={`Image ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  previewPrefixCls=''
                />
              ) : (
                <Image
                  value={image}
                  onChange={handleImageChange(index)}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              )}
              <Button
                size='small'
                danger
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'white',
                  padding: '0 4px',
                  minWidth: 'unset',
                  height: 'auto',
                }}
                onClick={() => handleRemoveImage(index)}
              >
                X
              </Button>
            </div>
          </Col>
        ))}
        {images.length < 5 && (
          <Col xs={12} sm={8} md={6} lg={4}>
            <div
              style={{
                border: '1px dashed #d9d9d9',
                borderRadius: '2px',
                height: '100px', // Match the height of image containers
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={handleAddImage}
            >
              <PlusOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            </div>
          </Col>
        )}
      </Row>
    </AntImage.PreviewGroup>
  );
};

export default ArrayImage;
