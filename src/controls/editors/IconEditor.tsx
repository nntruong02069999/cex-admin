import React, { FC, useState } from 'react';
import { Modal, Card } from 'antd';
import Icons from '@src/packages/pro-icon';

interface IconEditorProps {
  title?: string;
  visible: boolean;
  setVisible: (val: any) => void;
  onChange?: (iconIdentity: string, iconType: string) => void;
}

const IconEditor: FC<IconEditorProps> = (props: IconEditorProps) => {
  const {
    visible: initVisible,
    setVisible: superChange,
    title = `CHỌN ICONS`,
  } = props;
  const [visible, setVisible] = useState<boolean>(initVisible || false);
  const [activeTabKey, setActiveTabKey] = useState<string>('antdIcons');
  const tabList = [
    {
      key: 'antdIcons',
      tab: 'Antd Icons',
    },
    {
      key: 'gaxonIcons',
      tab: 'Gaxon Icons',
    },
    {
      key: 'iconifyIcons',
      tab: 'Iconify Icons',
    },
  ];
  const contentList: { [key: string]: JSX.Element } = {
    antdIcons: <Icons.AntdIcons onChange={props.onChange} />,
    gaxonIcons: <Icons.GaxonIcons onChange={props.onChange} />,
    iconifyIcons: <Icons.InconifyIcons onChange={props.onChange} />,
  };

  const onCancel = () => {
    setVisible(false);
    superChange(false);
  };

  React.useEffect(() => {
    setVisible(initVisible);
  }, [initVisible]);

  return (
    <React.Fragment>
      <Modal
        width={`80vw`}
        centered
        style={
          {
            // maxHeight: `500px`,
          }
        }
        bodyStyle={
          {
            // maxHeight: `500px`,
          }
        }
        title={title}
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Card
          className='gx-card'
          bodyStyle={{
            maxHeight: `500px`,
            overflow: 'scroll',
          }}
          tabList={tabList}
          activeTabKey={activeTabKey}
          onTabChange={(key) => {
            setActiveTabKey(key);
          }}
        >
          {contentList[activeTabKey]}
        </Card>
      </Modal>
    </React.Fragment>
  );
};

export default IconEditor;
