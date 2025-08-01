// import React, { useState, useEffect } from 'react'
// import { Editor } from '@tinymce/tinymce-react'
// import * as request from '@src/util/request'
// // import { TinyMCE as TinyMCEGlobal } from 'tinymce/';
// import tinymce from 'tinymce/tinymce'

// // Default icons are required for TinyMCE 5.3 or above
// import 'tinymce/icons/default'
// // A theme is also required
// import 'tinymce/themes/silver'
// // Any plugins you want to use has to be imported
// import 'tinymce/plugins/textcolor'
// import 'tinymce/plugins/code'
// import 'tinymce/plugins/advlist'
// import 'tinymce/plugins/autolink'
// import 'tinymce/plugins/lists'
// import 'tinymce/plugins/link'
// import 'tinymce/plugins/image'
// import 'tinymce/plugins/charmap'
// import 'tinymce/plugins/print'
// import 'tinymce/plugins/preview'
// import 'tinymce/plugins/anchor'
// import 'tinymce/plugins/searchreplace'
// import 'tinymce/plugins/visualblocks'
// import 'tinymce/plugins/code'
// import 'tinymce/plugins/fullscreen'
// import 'tinymce/plugins/insertdatetime'
// import 'tinymce/plugins/media'
// import 'tinymce/plugins/table'
// import 'tinymce/plugins/contextmenu'
// import 'tinymce/plugins/paste'
// import 'tinymce/plugins/imagetools'
// import 'tinymce/plugins/wordcount'
// ;(window as any).tinymce = tinymce

// const RichText: React.FC<{
//   value?: any
//   onChange?: (val: any) => void
//   style?: Record<string, any>
// }> = ({ value, onChange }) => {
//   const [text, setText] = useState(value || '')

//   useEffect(() => {
//     setText(value || '')
//   }, [value])

//   const handleEditorChange = React.useCallback((e) => {
//     setText(e)
//     if (onChange) {
//       onChange(e)
//     }
//   }, [])

//   return (
//     <>
//       <Editor
//         apiKey="cswezi492a2ax6zazo549bldqfazwrgrslsurvl1caolgntp"
//         value={text}
//         init={{
//           height: 300,
//           plugins: [
//             'code advlist autolink lists link image charmap print preview anchor',
//             'searchreplace visualblocks code fullscreen textcolor',
//             'insertdatetime media table contextmenu paste imagetools wordcount',
//           ],
//           toolbar:
//             'insertfile undo redo | styleselect forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
//           extended_valid_elements: 'span[id|style|class]',
//           content_style:
//             'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
//           convert_urls: false,
//           noneditable_noneditable_class: 'mceNonEditable',
//           file_picker_types: 'image',
//           // file_picker_callback: function (callback, value, meta) {
//           //   console.log('RichTextEditor file_picker_callback-> meta', meta)
//           //   console.log('RichTextEditor file_picker_callback-> value', value)
//           // },
//           images_upload_handler: async function (blobInfo, success) {
//             const imageFile = new FormData()
//             imageFile.append('files', blobInfo.blob())
//             try {
//               const rs = await request.upload(
//                 `/api/file/upload-file`,
//                 imageFile
//               )
//               success(rs.created[0].url)
//             } catch (error) {
//               return
//             }
//           },
//           save_onsavecallback: function () {
//             const content = tinymce.activeEditor.getContent()
//             console.log(content)
//           },
//         }}
//         onEditorChange={handleEditorChange}
//       />
//     </>
//   )
// }

// export default RichText
import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { Editor } from '@tinymce/tinymce-react'
import cloneDeep from 'lodash/cloneDeep'
import concat from 'lodash/concat'
import tinymce from 'tinymce/tinymce'
import FileManager from './ImageRichText'
import { IS_DEBUG } from '@src/constants/constants'

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

const RichText: React.FC<{
  value?: any
  onChange?: (val: any) => void
  style?: Record<string, any>
  [x: string]: any
}> = ({ value, onChange, mode = 'simple' }) => {
  const [text, setText] = useState(value || '')
  const [fmVisible, setFmVisible] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setIsVal] = useState(false)
  const [images, setImages] = useState([])

  useEffect(() => {
    setText(value || '')
  }, [value])

  const showFileManager = (cb: any) => {
    setFmVisible(true)
    window.tinycmeCallback = cb
  }

  const hideFileManager = () => {
    setFmVisible(false)
  }

  const handleChange = (val: any) => {
    let arrImg: any = cloneDeep(images)
    if (mode === 'multiple') {
      arrImg = concat(arrImg, val)
    } else {
      arrImg = concat([], (val || [])[0] || [])
    }
    setImages(arrImg)
    setIsVal(false)
    if (window.tinycmeCallback) {
      window.tinycmeCallback(`${val}`)
    }
  }
  // const memoChange = useMemo((val) => handleChange(val), [fmVisible]);

  const handleOk = () => {
    setFmVisible(false)
    setIsVal(true)
  }

  /* const onEditorChange = (e: any) => {
    console.log(`🚀 ~ file: RichText.tsx ~ line 76 ~ e`, e)
    const val = e.target.getContent()
    console.log('RichTextEditor -> val', val)
    setText(val)
    if (onChange) {
      onChange(val)
    }
  } */

  const onEditorChange = React.useCallback((e: any) => {
    const val = e
    setText(val)
    if (onChange) {
      onChange(val)
    }
  }, [])

  return (
    <>
      <Editor
        // tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js"
        apiKey="cswezi492a2ax6zazo549bldqfazwrgrslsurvl1caolgntp"
        /* style={{
          height: '250px',
          minHeight: '250px',
          marginBottom: '50px',
          ...style,
        }} */
        // initialValue={text}
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
          // automatic_uploads: false,
          convert_urls: false,
          noneditable_noneditable_class: 'mceNonEditable',
          file_picker_types: 'image',
          file_picker_callback: function (callback, value, meta) {
            if (IS_DEBUG) {
              console.log('RichTextEditor file_picker_callback-> meta', meta)
              console.log('RichTextEditor file_picker_callback-> value', value)
            }
            showFileManager(callback)
            // Provide file and text for the link dialog
            // if (meta.filetype == 'file') {
            // 	callback(images[0].path, { text: images[0].name });
            // 	console.log('RichTextEditor -> file_picker_callback images', images);
            // }

            // // Provide image and alt text for the image dialog
            // if (meta.filetype == 'image') {
            // 	callback(images[0].path, { text: images[0].name });
            // 	console.log('RichTextEditor -> file_picker_callback images', images);
            // }

            // // Provide alternative source and posted for the media dialog
            // if (meta.filetype == 'media') {
            // 	// callback('movie.mp4', { source2: 'alt.ogg', poster: 'image.jpg' });
            // }
          },
        }}
        onEditorChange={onEditorChange}
      />
      <Modal
        zIndex={1310}
        style={{ top: '50px' }}
        width={500}
        title="Quản lý file"
        visible={fmVisible}
        onOk={handleOk}
        onCancel={hideFileManager}
        destroyOnClose={true}
      >
        <FileManager onChange={handleChange} />
      </Modal>
    </>
  )
}

export default RichText
