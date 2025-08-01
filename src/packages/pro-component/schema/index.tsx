import React from 'react'
import { Form, FormInstance, FormProps } from 'antd'
import clone from 'lodash/clone'
import { ISchemaEditorProperties } from '@src/controls/editors/SchemaEditor'
import { ISchemaSetting } from '@src/routes/default/pageManager/PageEditor'
import FormOneColumn from '@src/controls/layouts/FormOneColumn'
import FormTwoColumn from '@src/controls/layouts/FormTwoColumn'
import { IS_DEBUG } from '@src/constants/constants'

export interface FieldData {
  name: string | number | (string | number)[]
  value?: any
  touched?: boolean
  validating?: boolean
  errors?: string[]
}

export type FormSchemaProps = {
  ref?: any
  itemId?: number | string
  schema: ISchemaEditorProperties[]
  settings: ISchemaSetting
  data: any
  onSubmit?: () => void
  // onChange?: (val?: any) => void
  onChange: (fields: FieldData[]) => void
  fields: FieldData[]
  formRef?: React.MutableRefObject<FormInstance<any> | undefined>
} & Omit<FormProps, 'onFinish' | 'onChange' | 'ref'>

const FormSchema: React.FC<FormSchemaProps> = (props) => {
  const {
    children,
    formRef: propsFormRef,
    schema,
    data: initData,
    onSubmit: superSubmit,
    onChange: superChange,
    fields,
    form,
    settings,
    itemId,
  } = props
  const [inlineForm] = Form.useForm(form)
  const formRef = React.useRef<FormInstance<any>>(inlineForm! || ({} as any))

  const data = React.useMemo(() => {
    //convert default value
    const _data = clone(initData)
    schema.forEach((s: ISchemaEditorProperties) => {
      if (_data[s.field] === undefined && s.default) {
        _data[s.field] = s.default
        inlineForm.setFieldsValue({ [s.field]: s.default })
      }
    })
    return _data
  }, [initData])

  const onFinishFailed = (errorInfo: any) => {
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: index.tsx ~ line 47 ~ FormSchema ~ errorInfo`,
        errorInfo
      )
    }
  }

  const onFinish = (values: any) => {
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: index.tsx ~ line 54 ~ FormSchema ~ onFinish ~ values`,
        values
      )
    }

    if (superSubmit) {
      superSubmit()
    }
  }

  const renderLayout = () => {
    const formLayoutProps = {
      schema,
      settings,
      data,
      itemId,
    }
    switch (settings?.layout) {
      case 'oneCol':
        return (
          <FormOneColumn {...formLayoutProps}>
            <Form.Item noStyle>
              <div style={{ display: 'inline-flex' }}>{children}</div>
            </Form.Item>
          </FormOneColumn>
        )
      case 'twoCol':
      default:
        return (
          <FormTwoColumn {...formLayoutProps}>
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <div style={{ display: 'inline-flex' }}>{children}</div>
            </Form.Item>
          </FormTwoColumn>
        )
    }
  }

  if (!schema) return <p>Chưa định nghĩa schema</p>

  return (
    <Form
      colon={settings.colon}
      autoComplete="off"
      form={inlineForm}
      layout={settings.formLayout}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      fields={fields}
      onFieldsChange={(_changedFields, _allFields) => {
        superChange(_allFields)
      }}
    >
      <Form.Item noStyle shouldUpdate>
        {(formInstance) => {
          if (propsFormRef)
            propsFormRef.current = {
              ...(formInstance as FormInstance),
            }
          formRef.current = formInstance as FormInstance
          return null
        }}
      </Form.Item>
      {renderLayout()}
    </Form>
  )
}

export default FormSchema
