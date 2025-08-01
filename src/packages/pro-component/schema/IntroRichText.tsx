import React, { useRef, useCallback, useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';

// Default icons are required for TinyMCE 5.3 or above
import 'tinymce/icons/default';
// A theme is also required
import 'tinymce/themes/silver';
// Essential plugins for intro editing
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/code';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/wordcount';

(window as any).tinymce = tinymce;

const IntroRichText: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  height?: number;
}> = ({ value, onChange, placeholder = 'Nhập nội dung HTML...', height = 200 }) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange = useCallback((content: string) => {
    // Call onChange immediately without comparison
    if (onChange) {
      onChange(content);
    }
  }, [onChange]);

  return (
    <Editor
      apiKey="cswezi492a2ax6zazo549bldqfazwrgrslsurvl1caolgntp"
      value={value || ''}
      onInit={(evt, editor) => editorRef.current = editor}
      init={{
        height: height,
        placeholder: placeholder,
        menubar: false,
        plugins: [
          'code lists link paste wordcount textcolor'
        ],
        toolbar: 
          'undo redo | bold italic underline | forecolor backcolor | ' +
          'bullist numlist | link | code | removeformat',
        content_style: 
          'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; line-height: 1.5; }',
        convert_urls: false,
        paste_as_text: false,
        paste_retain_style_properties: 'color font-weight font-style text-decoration',
        valid_elements: 'p,br,strong,em,u,a[href],ul,ol,li,code,span[style]',
        forced_root_block: 'p',
        force_br_newlines: false,
        force_p_newlines: true,
        element_format: 'html',
        branding: false,
        statusbar: false,
        resize: false,
        setup: (editor) => {
          editor.on('init', () => {
            editor.getContainer().style.border = '1px solid #d9d9d9';
            editor.getContainer().style.borderRadius = '6px';
          });
        }
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default React.memo(IntroRichText, (prevProps, nextProps) => {
  // Only re-render if value prop actually changed
  return prevProps.value === nextProps.value && 
         prevProps.placeholder === nextProps.placeholder &&
         prevProps.height === nextProps.height;
}); 