import React,{ useRef, useEffect} from 'react';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import styles from './p-esg-common-Editor.module.css';

function EditorViewer({ contents }) {

  const ViewRef = useRef<Viewer>(null);
  
  return (
    <div className={styles.ViewerWrap}>
        <Viewer ref={ViewRef} key={contents} initialValue={contents || ''}/>
    </div>
  )
}

export default EditorViewer;