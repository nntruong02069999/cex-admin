import React, { useState, useEffect } from 'react'
import * as request from '@src/util/request'
import { Editor } from '@tinymce/tinymce-react'
// import { TinyMCE as TinyMCEGlobal } from 'tinymce/';
import tinymce from 'tinymce/tinymce'

// Default icons are required for TinyMCE 5.3 or above
import 'tinymce/icons/default'
// A theme is also required
import 'tinymce/themes/silver'
// Any plugins you want to use has to be imported
import 'tinymce/plugins/textcolor'
import 'tinymce/plugins/code'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/print'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/imagetools'
import 'tinymce/plugins/wordcount'
;(window as any).tinymce = tinymce

const RichTextWidget: React.FC<{
  value?: any
  onChange?: (val: any) => void
  style?: Record<string, any>
}> = ({ value, onChange }) => {
  const [text, setText] = useState(value || '')

  useEffect(() => {
    setText(value || '')
  }, [value])

  const handleEditorChange = React.useCallback((e) => {
    setText(e)
    if (onChange) {
      onChange(e)
    }
  }, [])

  return (
    <>
      <Editor
        apiKey="cswezi492a2ax6zazo549bldqfazwrgrslsurvl1caolgntp"
        value={text}
        init={{
          height: 300,
          plugins: [
            'code advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen textcolor',
            'insertdatetime media table contextmenu paste imagetools wordcount',
          ],
          toolbar:
            'insertfile undo redo | styleselect forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
          extended_valid_elements: 'span[id|style|class]',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          convert_urls: false,
          noneditable_noneditable_class: 'mceNonEditable',
          file_picker_types: 'image',
          images_upload_handler: async function (blobInfo, success) {
            const imageFile = new FormData()
            imageFile.append('files', blobInfo.blob())
            try {
              const rs = await request.upload(
                `/api/file/upload-file`,
                imageFile
              )
              success(rs.created[0].url)
            } catch (error) {
              return
            }
          },
          save_onsavecallback: function () {},
        }}
        onEditorChange={handleEditorChange}
      />
    </>
  )
}

export default RichTextWidget
