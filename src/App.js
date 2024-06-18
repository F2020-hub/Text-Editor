import './App.css';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier, getDefaultKeyBinding } from 'draft-js';
import { useState, useEffect } from 'react';
import BlockStyleControls from './component/BlockStyleControls';
import InlineStyleControls from './component/InlineStyleControls';







function App() {
  const [editorState, setEditorState] = useState(() => {
    const savedState = localStorage.getItem('editorState');
    return savedState ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedState))) : EditorState.createEmpty();
  });

  useEffect(() => {
    const savedState = localStorage.getItem('editorState');
    if (savedState) {
      setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedState))));
    }
  }, []);

  const getBlockStyle = (block) => {
    switch (block.getType()) {
      case 'blockquote':
        return 'RichEditor-blockquote';
      default:
        return null;
    }
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9) {
      const newEditorState = RichUtils.onTab(e, editorState, 4);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();

    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(startKey);
    const blockText = currentBlock.getText();

    if (chars === ' ' && blockText.startsWith('#')) {
      const newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: startOffset,
        }),
        'backward'
      );

      const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
      setEditorState(RichUtils.toggleBlockType(newEditorState, 'header-one'));
      return 'handled';
    } else if (chars === ' ' && blockText.startsWith('*')) {
      const newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: startOffset,
        }),
        'backward'
      );

      let newEditorState = EditorState.push(editorState, newContentState, 'remove-range');

      // Clear current styles
      const currentStyle = editorState.getCurrentInlineStyle();
      currentStyle.forEach((style) => {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
      });

      const style = blockText.startsWith('***') ? 'UNDERLINE' : blockText.startsWith('**') ? 'REDLINE' : 'BOLD';
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, style));
      return 'handled';
    } else if (chars === ' ' && blockText.startsWith('```')) {
      const newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: startOffset,
        }),
        'backward'
      );

      let newEditorState = EditorState.push(editorState, newContentState, 'remove-range');

      // Clear current styles
      const currentStyle = editorState.getCurrentInlineStyle();
      currentStyle.forEach((style) => {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
      });

      setEditorState(RichUtils.toggleBlockType(newEditorState, 'code-block'));
      return 'handled';
    }

    return 'not-handled';
  };

  const handleReturn = (e) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = Modifier.splitBlock(contentState, selectionState);
    const newEditorState = EditorState.push(editorState, newContentState, 'split-block');

    // Move focus to the new block and reset styles
    const newEditorStateWithResetStyles = EditorState.setInlineStyleOverride(newEditorState, []);
    setEditorState(EditorState.moveFocusToEnd(newEditorStateWithResetStyles));
    return 'handled';
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorState', rawContent);
    alert('Content saved!');
  };

  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
    REDLINE: {
      color: 'red',
      textDecoration: 'line-through',
    },
  };

  return (
    <div className="App">
      <div className='top-heading'>
      <div></div>
      <h1 className='heading-name'>Demo editor by Mohammd Fakher Zaheri</h1>
      <button onClick={handleSave} className='save-button'>Save</button>
      </div>
      <div className='editor-style'>
      <BlockStyleControls editorState={editorState} onToggle={toggleBlockType} />
      <InlineStyleControls editorState={editorState} onToggle={toggleInlineStyle} />
      <Editor
        editorState={editorState}
        keyBindingFn={mapKeyToEditorCommand}
        onChange={setEditorState}
        blockStyleFn={getBlockStyle}
        customStyleMap={styleMap}
        handleKeyCommand={handleKeyCommand}
        handleBeforeInput={handleBeforeInput}
        handleReturn={handleReturn}
        placeholder='Write your text ...'
        spellCheck={true}
      />
      </div>
    </div>
  );
}

export default App;
