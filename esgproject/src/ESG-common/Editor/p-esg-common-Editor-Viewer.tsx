import React from 'react';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import styles from './p-esg-common-Editor.module.css';

function EditorViewer({ contents }) {
  return (
    <div className={styles.ViewerWrap}>
      <Viewer key={contents} initialValue={contents || ''} />
    </div>
  )
}

export default EditorViewer;