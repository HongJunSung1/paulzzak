import React, { useRef, forwardRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import '@toast-ui/editor/dist/i18n/ko-kr';
import { Editor } from '@toast-ui/react-editor';
import styles from './p-esg-common-Editor.module.css';

type CustomEditProps = {
  editId : string
  onChange: (editId: string, changes: editAr) => void;
};

type editAr = {
  DataSet    : string;
  grid       : any[];
};

const ToastEditor = forwardRef(({editId, onChange}: CustomEditProps, ref) => {

  const EditRef = useRef<Editor | null>(null);

  const changeHandle = () => {
    const changeData = EditRef.current?.getInstance().getHTML();

    const editArChange : editAr = ({
      DataSet : editId,
      grid    : [{text : changeData}]
  })

    onChange(editId, editArChange);
  }


  return (
    <div className={styles.EditorWrap}>
        <Editor
        ref={EditRef}
        initialValue=" "
        previewStyle="vertical"
        initialEditType="wysiwyg" // WYSIWYG 모드 설정
        hideModeSwitch= {true}
        useCommandShortcut={true}
        language="ko-KR" 
        plugins={[colorSyntax]}
        onChange={changeHandle}
        placeholder= '텍스트를 입력해주세요.'
        toolbarItems={[    ['bold', 'italic', 'strike'],
          ['hr'],
          ['image', 'link'],
          ['ul', 'ol'],
        ]}
        />
    </div>
  );
});



export default ToastEditor;