import StyleButton from "./StyleButton";

const BlockStyleControls = (props) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const start = selection.getStartOffset();
    const end = selection.getEndOffset();
    const selectedText = currentContentBlock ? currentContentBlock.getText().slice(start, end) : '';
  
    console.log('selectedText', selectedText);
    const blockType = currentContentBlock ? currentContentBlock.getType() : '';
  
    const BLOCK_TYPES = [
      { label: 'H1', style: 'header-one' },
      { label: 'H2', style: 'header-two' },
      { label: 'H3', style: 'header-three' },
      { label: 'H4', style: 'header-four' },
      { label: 'H5', style: 'header-five' },
      { label: 'H6', style: 'header-six' },
      { label: 'Blockquote', style: 'blockquote' },
      { label: 'UL', style: 'unordered-list-item' },
      { label: 'OL', style: 'ordered-list-item' },
      { label: 'Code Block', style: 'code-block' },
    ];
  
    return (
      <div className='RichEditor-controls'>
        {BLOCK_TYPES.map((type) => (
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        ))}
      </div>
    );
  };

  export default BlockStyleControls