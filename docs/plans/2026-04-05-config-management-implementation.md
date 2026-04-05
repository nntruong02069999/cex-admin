# Config Management Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an admin page to view and edit system configurations grouped by 4 categories (Order, Deposit, Withdraw, KYC) with inline-editable tables.

**Architecture:** DVA-connected page with Tabs layout under `/main/config` route. Each tab renders a ConfigTable component that displays configs for one category with inline editing support.

**Tech Stack:** React 17 + TypeScript + Ant Design 4 + DVA (Redux-Saga) + LESS

---

### Task 1: Create configService.ts

**Files:**

- Create: `src/services/configService.ts`

**Step 1: Write the service file**

Create `src/services/configService.ts` with two functions following the pattern from `src/services/wheelSpinService.ts`:

```typescript
import { DEFAULT_ERROR_MESSAGE } from "@src/constants/constants";
import HttpStatusCode from "@src/constants/HttpStatusCode";
import request from "@src/util/request";

export interface ConfigItem {
  id: number;
  name: string | null;
  val: string | null;
  type: string | null;
  description: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface GetAllConfigResponse {
  configOrder: ConfigItem[];
  configDeposit: ConfigItem[];
  configWithdraw: ConfigItem[];
  configKyc: ConfigItem[];
}

export const getAllConfig = async () => {
  const token = localStorage.getItem("token");
  const res: any = await request({
    url: "/admin/config/get-all-config",
    options: {
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data.data as GetAllConfigResponse;
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    };
  }
};

export const editConfig = async (name: string, value: string) => {
  const token = localStorage.getItem("token");
  const res: any = await request({
    url: "/admin/config/edit-config",
    options: {
      method: "post",
      data: { name, value },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data;
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    };
  }
};
```

**Step 2: Verify no syntax errors**

Run: `yarn type-check`
Expected: No errors related to configService.ts

---

### Task 2: Create config.ts DVA Model

**Files:**

- Create: `src/models/config.ts`

**Step 1: Write the DVA model**

Create `src/models/config.ts` following the pattern from `src/models/houseWallet.ts`:

```typescript
import { EffectsCommandMap, Model } from "dva";
import { Reducer } from "redux";
import { message } from "antd";
import {
  getAllConfig,
  editConfig,
  ConfigItem,
} from "@src/services/configService";

export interface ConfigState {
  order: ConfigItem[];
  deposit: ConfigItem[];
  withdraw: ConfigItem[];
  kyc: ConfigItem[];
  loading: boolean;
}

const configModel: Model = {
  namespace: "config",

  state: {
    order: [],
    deposit: [],
    withdraw: [],
    kyc: [],
    loading: false,
  } as ConfigState,

  effects: {
    *fetchAllConfig(_, { call, put }: EffectsCommandMap): any {
      yield put({ type: "setLoading", payload: true });
      try {
        const result = yield call(getAllConfig);
        if ("errorCode" in result) {
          message.error(result.message);
          return;
        }
        yield put({
          type: "setConfigData",
          payload: {
            order: result.configOrder || [],
            deposit: result.configDeposit || [],
            withdraw: result.configWithdraw || [],
            kyc: result.configKyc || [],
          },
        });
      } catch (error: any) {
        message.error(error.message || "Không thể tải cấu hình");
      } finally {
        yield put({ type: "setLoading", payload: false });
      }
    },

    *editConfig({ payload }, { call, put }: EffectsCommandMap): any {
      try {
        const { name, value } = payload;
        const result = yield call(editConfig, name, value);
        if ("errorCode" in result) {
          message.error(result.message);
          return;
        }
        message.success("Cập nhật cấu hình thành công");
        yield put({ type: "fetchAllConfig" });
      } catch (error: any) {
        message.error(error.message || "Không thể cập nhật cấu hình");
      }
    },
  },

  reducers: {
    setConfigData(state: ConfigState, action: { payload: any }) {
      return {
        ...state,
        order: action.payload.order,
        deposit: action.payload.deposit,
        withdraw: action.payload.withdraw,
        kyc: action.payload.kyc,
      };
    },
    setLoading(state: ConfigState, action: { payload: boolean }) {
      return { ...state, loading: action.payload };
    },
  } as Record<string, Reducer<any, any>>,
};

export default configModel;
```

**Step 2: Verify no syntax errors**

Run: `yarn type-check`
Expected: No errors related to config.ts

---

### Task 3: Register config model in src/index.tsx

**Files:**

- Modify: `src/index.tsx:18-19` (add import before `/* PLOP_INJECT_IMPORT */`)
- Modify: `src/index.tsx:39-40` (add app.model before `/* PLOP_INJECT_EXPORT */`)

**Step 1: Add import**

Add before `/* PLOP_INJECT_IMPORT */`:

```typescript
import configModel from "./models/config";
```

**Step 2: Register model**

Add before `/* PLOP_INJECT_EXPORT */`:

```typescript
app.model(configModel);
```

**Step 3: Verify no syntax errors**

Run: `yarn type-check`
Expected: No errors

---

### Task 4: Create ConfigTable component

**Files:**

- Create: `src/components/Config/ConfigTable.tsx`
- Create: `src/components/Config/ConfigTable.less`

**Step 1: Write the ConfigTable component**

Create `src/components/Config/ConfigTable.tsx`:

```typescript
import React, { useState } from 'react'
import { connect } from 'dva'
import { Table, Input, InputNumber, Switch, Button, message as antdMessage, Tooltip } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import moment from 'moment'
import { ConfigItem } from '@src/services/configService'
import './ConfigTable.less'

interface ConfigTableProps {
  dataSource: ConfigItem[]
  loading: boolean
  dispatch: any
}

const ConfigTable: React.FC<ConfigTableProps> = ({ dataSource, loading, dispatch }) => {
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})

  const handleValueChange = (name: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (item: ConfigItem) => {
    const newValue = editingValues[item.name!]
    if (newValue === undefined || newValue === item.val) {
      return
    }
    dispatch({
      type: 'config/editConfig',
      payload: { name: item.name, value: newValue },
    })
  }

  const renderValueInput = (item: ConfigItem) => {
    const currentVal = editingValues[item.name!] ?? item.val ?? ''

    if (item.type === 'number') {
      return (
        <InputNumber
          value={currentVal === '' ? undefined : Number(currentVal)}
          onChange={(val) => handleValueChange(item.name!, val !== null ? String(val) : '')}
          style={{ width: '100%' }}
        />
      )
    }

    if (item.type === 'boolean') {
      return (
        <Switch
          checked={currentVal === 'true'}
          onChange={(checked) => handleValueChange(item.name!, String(checked))}
        />
      )
    }

    return (
      <Input
        value={currentVal}
        onChange={(e) => handleValueChange(item.name!, e.target.value)}
      />
    )
  }

  const columns = [
    {
      title: 'Tên cấu hình',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'val',
      key: 'val',
      width: 200,
      render: (_: any, record: ConfigItem) => renderValueInput(record),
    },
    {
      title: 'Cập nhật lúc',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (ts: number) => (ts ? moment(ts).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      render: (_: any, record: ConfigItem) => {
        const isChanged =
          editingValues[record.name!] !== undefined &&
          editingValues[record.name!] !== record.val
        return (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="small"
            disabled={!isChanged}
            onClick={() => handleSave(record)}
          >
            Lưu
          </Button>
        )
      },
    },
  ]

  return (
    <div className="config-table-wrapper">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        size="middle"
      />
    </div>
  )
}

const mapStateToProps = ({ config, loading }: any) => ({
  loading: loading.effects['config/fetchAllConfig'],
})

export default connect(mapStateToProps)(ConfigTable)
```

**Step 2: Write the LESS file**

Create `src/components/Config/ConfigTable.less`:

```less
.config-table-wrapper {
  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #c7254e;
  }

  .ant-table-cell {
    vertical-align: middle;
  }
}
```

**Step 3: Verify no syntax errors**

Run: `yarn type-check`
Expected: No errors related to ConfigTable

---

### Task 5: Create ConfigPage route component

**Files:**

- Create: `src/routes/main/config/index.tsx`
- Create: `src/routes/main/config/index.less`

**Step 1: Write the route page**

Create `src/routes/main/config/index.tsx`:

```typescript
import React, { useEffect } from 'react'
import { connect } from 'dva'
import { Tabs, Card, Spin } from 'antd'
import {
  ShoppingCartOutlined,
  WalletOutlined,
  MoneyCollectOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import ConfigTable from '@src/components/Config/ConfigTable'
import { ConfigState } from '@src/models/config'
import './index.less'

const { TabPane } = Tabs

interface ConfigPageProps {
  config: ConfigState
  dispatch: any
  loading: boolean
}

const ConfigPage: React.FC<ConfigPageProps> = ({ config, dispatch, loading }) => {
  const { order, deposit, withdraw, kyc } = config

  useEffect(() => {
    dispatch({ type: 'config/fetchAllConfig' })
  }, [dispatch])

  if (loading) {
    return (
      <div className="config-page">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="config-page">
      <Card bordered={false}>
        <Tabs defaultActiveKey="order" size="large" type="card">
          <TabPane
            tab={
              <span>
                <ShoppingCartOutlined />
                Đơn hàng
              </span>
            }
            key="order"
          >
            <ConfigTable dataSource={order} loading={loading} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <WalletOutlined />
                Nạp tiền
              </span>
            }
            key="deposit"
          >
            <ConfigTable dataSource={deposit} loading={loading} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <MoneyCollectOutlined />
                Rút tiền
              </span>
            }
            key="withdraw"
          >
            <ConfigTable dataSource={withdraw} loading={loading} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <IdcardOutlined />
                KYC
              </span>
            }
            key="kyc"
          >
            <ConfigTable dataSource={kyc} loading={loading} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

const mapStateToProps = ({ config, loading }: any) => ({
  config,
  loading: loading.effects['config/fetchAllConfig'],
})

export default connect(mapStateToProps)(ConfigPage)
```

**Step 2: Write the LESS file**

Create `src/routes/main/config/index.less`:

```less
.config-page {
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab,
  .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab {
    padding: 8px 16px;
  }
}
```

**Step 3: Verify no syntax errors**

Run: `yarn type-check`
Expected: No errors

---

### Task 6: Register route in src/routes/index.tsx

**Files:**

- Modify: `src/routes/index.tsx`

**Step 1: Add import**

Add after line 22 (before `/* PLOP_INJECT_IMPORT */`):

```typescript
import ConfigPage from "./main/config";
```

**Step 2: Add route**

Add inside the `<Switch>`, after the `/main` route (line 54):

```tsx
<Route path={`/main/config`} component={ConfigPage} />
```

The final file structure for the relevant section:

```tsx
import ConfigPage from "./main/config";
/* PLOP_INJECT_IMPORT */

// ... inside Switch:
<Route path={`${match.url}main`} component={Main} />
<Route path={`/main/config`} component={ConfigPage} />
```

**Step 3: Verify no syntax errors**

Run: `yarn type-check`
Expected: No errors

---

### Task 7: Final verification

**Step 1: Run full type check**

Run: `yarn type-check`
Expected: No errors

**Step 2: Run lint**

Run: `yarn lint`
Expected: No errors

**Step 3: Start dev server and manually test**

Run: `yarn dev`

Manual test checklist:

1. Navigate to `/main/config` — page loads with 4 tabs
2. Each tab shows correct config items for its category
3. Edit a number value → click Save → success message → data reloads
4. Edit a string value → click Save → success message → data reloads
5. Toggle a boolean switch → click Save → success message → data reloads
6. Edit without changing → Save button stays disabled
7. Loading spinner shows during initial fetch
8. Error message shows if API fails

**Step 4: Commit changes**

Run: `git add -A && git commit -m "feat: add config management page with inline editing"`

---
