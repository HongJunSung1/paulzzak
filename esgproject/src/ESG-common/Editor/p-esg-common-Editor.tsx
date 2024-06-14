import React, { useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import '@toast-ui/editor/dist/i18n/ko-kr';
import { Editor } from '@toast-ui/react-editor';

const ToastEditor = () => {
  const editorRef = useRef(null);

  return (
    <div>
        <Editor
        ref={editorRef}
        initialValue="혹중선"
        previewStyle="vertical"
        initialEditType="wysiwyg" // WYSIWYG 모드 설정
        hideModeSwitch= {true}
        useCommandShortcut={true}
        language="ko-KR" 
        plugins={[colorSyntax]}
        />
    </div>
  );
};

export default ToastEditor;