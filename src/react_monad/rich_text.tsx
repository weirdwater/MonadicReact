import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Immutable from 'immutable';
import {Editor, Entity, EditorState, RichUtils, AtomicBlockUtils, EditorBlock, ContentBlock, ContentState, Modifier} from 'draft-js';
import * as Draft from 'draft-js';
import {C, Cont, CmdCommon, Mode, make_C, unit, bind} from './core'
import * as katex from "katex";

type DraftEditorCommand =
    "undo" |
    "redo" |
    "delete" |
    "delete-word" |
    "backspace" |
    "backspace-word" |
    "backspace-to-start-of-line" |
    "bold" |
    "italic" |
    "underline" |
    "code" |
    "split-block" |
    "transpose-characters" |
    "move-selection-to-start-of-block" |
    "move-selection-to-end-of-block" |
    "secondary-cut" |
    "secondary-paste"

type DraftBlockType =
    "unstyled" |
    "paragraph" |
    "header-one" |
    "header-two" |
    "header-three" |
    "header-four" |
    "header-five" |
    "header-six" |
    "unordered-list-item" |
    "ordered-list-item" |
    "blockquote" |
    "code-block" |
    "atomic"

type DraftState = {
  editor_state: EditorState
}

type DraftProps = {
    initial_state: EditorState,
    set_state: (s:EditorState, on_success?: () => void) => void,
    editable: boolean }

class DraftEditor extends React.Component<DraftProps, DraftState> {
  constructor(props:DraftProps, context) {
    super(props, context)

    this.state = { editor_state: this.props.initial_state }
  }

  static serialize_state(editor_state:EditorState) : string {
    return JSON.stringify(Draft.convertToRaw(editor_state.getCurrentContent()))
  }

  static deserialize_state(raw_content:any) : EditorState {
    try {
      return EditorState.createWithContent(Draft.convertFromRaw(JSON.parse(raw_content)))
    } catch (e) {
      return DraftEditor.empty_state()
    }
  }

  static empty_state() : EditorState {
    return EditorState.createEmpty()
  }

  onChange(new_editor_state:EditorState, on_success?: () => void) {
    if (this.props.editable) {
      this.setState({...this.state, editor_state: new_editor_state}, () => {
        if (on_success) on_success()
        this.props.set_state(new_editor_state)
      })
    }
  }

  toggle_block_type(block_type:DraftBlockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editor_state,
        block_type
      ), () => this.editor.focus()
    )
  }

  toggle_style(command:DraftEditorCommand) {
    this.handleKeyCommand(command)
  }

  handleKeyCommand(command:DraftEditorCommand) {
    let new_state = RichUtils.handleKeyCommand(this.state.editor_state, command);
    if (new_state) {
      this.onChange(new_state, () => {
        this.editor.focus()
      })
      return "handled"
    }
    return "not-handled"
  }

  insert_media(contentState: Draft.ContentState, url:string, url_type:MediaType) {
    let selectionState = this.state.editor_state.getSelection()
    let new_content_state = contentState.createEntity(url_type, 'IMMUTABLE', {src: url})
    let entity_key = new_content_state.getLastCreatedEntityKey()
    let new_editor_state = AtomicBlockUtils.insertAtomicBlock(this.state.editor_state, entity_key, ' ')

    // new_content_state = new_editor_state.getCurrentContent()
    // var anchorKey = selectionState.getAnchorKey();
    // var currentContentBlock = new_content_state.getBlockForKey(anchorKey)
    // let blockMap = new_content_state.getBlockMap()

    // let newBlockMap = currentContentBlock.getText() == "" ? blockMap.remove(currentContentBlock.getKey()) : blockMap
    // const newContentState = contentState.set('blockMap', newBlockMap) as ContentState;

    // let newEditorState = EditorState.createWithContent(newContentState)

    let newEditorState = new_editor_state

    this.setState({...this.state, editor_state: newEditorState}, () => {
      this.props.set_state(new_editor_state)
    })
  }

  editor: Editor = null
  render() {
    return (
      <div className="editor__inner">
          {this.props.editable ?
          <SlideEditorButtonsBar toggle_style={(s:DraftEditorCommand) => this.toggle_style(s)}
                                 toggle_block_type={(s:DraftBlockType) => this.toggle_block_type(s)}
                                 insert_media={(url:string, url_type:MediaType) =>
                                   this.insert_media(this.state.editor_state.getCurrentContent() ,url, url_type)}
                                  />
           :
          null}
        <div className="slide__text__editor">
          <Editor editorState={this.state.editor_state}
                  onBlur={() => {}}
                  onChange={es => this.onChange(es)}
                  handleKeyCommand={(c:DraftEditorCommand) => this.handleKeyCommand(c)}
                  readOnly={!this.props.editable}
                  blockRendererFn={mediaBlockRenderer(this.state.editor_state.getCurrentContent(), this.props.editable)}
                  ref={(editor) => this.editor = editor }
                  spellCheck={true} />
        </div>
      </div>
    )
  }
}

function mediaBlockRenderer(contentState: Draft.ContentState ,editable:boolean) {
  return (block:ContentBlock) => {
    if (block.getType() === 'atomic') {
      return {
        component: Media(editable),
        editable: false,
      };
    }

    return null;
  }
}

type MathProps = { src: string, editable: boolean, contentState: ContentState, block: ContentBlock }
class Math extends React.Component<MathProps, {}> {
  constructor(props) {
    super(props)
  }

  onClick() {
    if (!this.props.editable) { return }

    let block = this.props.block
    let contentState = this.props.contentState

    let newTex = prompt("Enter your tex here", this.props.src) || this.props.src
    let entityKey = block.getEntityAt(0)

    contentState.mergeEntityData(entityKey, { src: newTex })
  }

  render() {
    return <div>
        <MathOutput content={this.props.src} onClick={() => this.onClick()} />
      </div>
  }
}

type  MathOutputProps = { content: string, onClick: () => void }
class MathOutput extends React.Component<MathOutputProps, {}> {
  constructor(props) {
    super(props)
  }

  _timer = null;
  _container: HTMLElement = null;

  _update() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      katex.render(
        this.props.content,
        this._container,
        { displayMode: false }
      )
    }, 0);
  }

  componentDidMount() {
    this._update()
  }

  componentWillReceiveProps(props) {
    if (props.src !== this.props.content) {
      this._update();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer)
    this._timer = null
  }

  render() {
    return <span ref={(c) => this._container = c} onClick={this.props.onClick}/>
  }
}

const Image = (props:{src:string}) => {
  return <img src={props.src} />;
};

const Video = (props:{src:string}) => {
  return <video controls src={props.src} />;
};

const YouTube = (props:{src:string}) => {
  return (<iframe width="420" height="315"
            src={props.src}>
          </iframe>)
};

export type MediaType = 'image' | 'video' | 'youtube' | 'mathblock'

type MediaProps = { contentState: Draft.ContentState, block:ContentBlock }
let Media = (editable:boolean) => (props:MediaProps) => {
  let entity = props.contentState.getEntity(props.block.getEntityAt(0))
  let {src} = entity.getData()
  let type = entity.getType()

  if (type === 'image') {
    return <Image src={src} />
  } else if (type === 'video') {
    return <Video src={src} />;
  } else if (type === 'youtube') {
    return <YouTube src={src} />
  } else if (type === 'mathblock') {
    return <Math src={src} editable={editable} contentState={props.contentState} block={props.block}/>
  }

  return null
}

type SlideEditorButtonsBarProps = {
  toggle_style: (c:DraftEditorCommand) => void,
  toggle_block_type: (c:DraftBlockType) => void,
  insert_media: (url:string, media_type:MediaType) => void }
class SlideEditorButtonsBar extends React.Component<
  SlideEditorButtonsBarProps,
  {} > {
  constructor(props:SlideEditorButtonsBarProps, context) {
    super(props, context)
  }

  render() {
    return (
        <div style={{display:"inline-block"}} className="text-editor__menu-bar">
          <div className="text-editor__menu-group">
            <button className="text-editor__menu-button text-editor__menu-button--bold"
                    onClick={() => this.props.toggle_style('bold')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--italic`}
                    onClick={() => this.props.toggle_style('italic')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--underline`}
                    onClick={() => this.props.toggle_style('underline')}>
            </button>
          </div>

          <div className="text-editor__menu-group">
            <button className={`text-editor__menu-button text-editor__menu-button--h1`}
                    onClick={() => this.props.toggle_block_type('header-one')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--h2`}
                    onClick={() => this.props.toggle_block_type('header-two')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--h3`}
                    onClick={() => this.props.toggle_block_type('header-three')}>
            </button>
          </div>

          <div className="text-editor__menu-group">
            <button className={`text-editor__menu-button text-editor__menu-button--ul`}
                    onClick={() => this.props.toggle_block_type('unordered-list-item')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--ol`}
                    onClick={() => this.props.toggle_block_type('ordered-list-item')}>
            </button>
          </div>

          <div className="text-editor__menu-group">
            <button className={`text-editor__menu-button text-editor__menu-button--code`}
                    onClick={() => this.props.toggle_block_type('code-block')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--blockquote`}
                    onClick={() => this.props.toggle_block_type('blockquote')}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--latex`}
                    onClick={() => this.props.insert_media(prompt("Insert your latex code here"), "mathblock")}>
            </button>
            <button className={`text-editor__menu-button text-editor__menu-button--image`}
                    onClick={() => this.file_input.click()}>
            </button>
          </div>
          <input type="file" onChange={(e:React.FormEvent<HTMLInputElement>) => {
              let file = (e.target as any).files[0]
              if (!file) return
              let reader = new FileReader()
              reader.onload = (e:Event) => {
                let contents = (e.target as any).result
                this.props.insert_media(contents, "image")
              }
              reader.readAsDataURL(file)
          } } ref={(file_input) => this.file_input = file_input} style={{display: "none"}}/>
        </div>
    )
  }
  file_input:HTMLInputElement
}


type RichTextProps = { kind:"rich text", mode:Mode, json_state:string } & CmdCommon<string>
type RichTextState = { current_state:string }
class RichText extends React.Component<RichTextProps,RichTextState> {
  constructor(props:RichTextProps,context:any) {
    super()
    this.state = { current_state:props.json_state }
  }
  componentWillReceiveProps(new_props:RichTextProps) {
    let new_state = new_props.json_state
    if (this.state.current_state != new_state) {
      this.setState({...this.state, current_state:new_state}, () =>
        this.props.cont(() => {})(this.state.current_state)
      )
    }
  }
  componentDidMount() {
    this.props.cont(() => {})(this.state.current_state)
  }
  render() {
    return <DraftEditor
              initial_state={this.state.current_state ?
                        DraftEditor.deserialize_state(this.state.current_state) :
                        DraftEditor.empty_state() }
              set_state={(s:Draft.EditorState, on_success?: () => void) => {
                let new_state = DraftEditor.serialize_state(s) as string
                if (this.state.current_state != new_state) {
                  this.setState({...this.state, current_state:new_state}, () =>
                    this.props.cont(() => {})(this.state.current_state)
                  )
                }
              }}
              editable={this.props.mode == "edit"} />
  }
}

export function rich_text(mode:Mode, key?:string, dbg?:() => string) : (_:string) => C<string> {
  return json_state => make_C<string>(ctxt => cont =>
    (React.createElement<RichTextProps>(RichText,
    { kind:"rich text", debug_info:dbg, json_state:json_state, mode:mode, context:ctxt, cont:cont, key:key })))
}
