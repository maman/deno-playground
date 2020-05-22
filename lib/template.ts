const template = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deno Playground</title>
  <meta name="description" content="Run code on deno typescript runtime">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-normalize@0.6.0/modern-normalize.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/lib/codemirror.min.css">
  <style>
    @font-face {
      font-family: 'Iosevka';
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      src: url('/font/iosevka-term-ss08-regular.woff2?v=3.0.0') format('woff2'),
          url('/font/iosevka-term-ss08-regular.woff?v=3.0.0') format('woff');
    }

    @font-face {
      font-family: 'Iosevka';
      font-weight: normal;
      font-stretch: normal;
      font-style: italic;
      src: url('/font/iosevka-term-ss08-italic.woff2?v=3.0.0') format('woff2'),
          url('/font/iosevka-term-ss08-italic.woff?v=3.0.0') format('woff');
    }

    @font-face {
      font-family: 'Iosevka';
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      src: url('/font/iosevka-term-ss08-semibold.woff2?v=3.0.0') format('woff2'),
          url('/font/iosevka-term-ss08-semibold.woff?v=3.0.0') format('woff');
    }

    @font-face {
      font-family: 'Iosevka';
      font-weight: bold;
      font-stretch: normal;
      font-style: italic;
      src: url('/font/iosevka-term-ss08-semibolditalic.woff2?v=3.0.0') format('woff2'),
          url('/font/iosevka-term-ss08-semibolditalic.woff?v=3.0.0') format('woff');
    }

    html,
    body,
    .wrapper {
      height: 100%;
    }

    .wrapper {
      display: flex;
      flex-direction: column;
    }

    .header {
      background-color: #AEEEEF;
    }

    .header h1 {
      padding: 0 5px;
      font-weight: bold;
      font-size: 18px;
    }

    .menu-list {
      margin: 0;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      column-gap: 5px;
      row-gap: 5px;
      align-items: center;
      padding: 5px;
      background-color: #EAFFFF;
      border-top: 1px solid #000;
      border-bottom: 1px solid #A6A6D4;
    }

    .menu-list>li {
      height: 100%;
      list-style: none;
      text-align: center;
      position: relative;
    }

    .menu-list>li:first-child {
      margin-left: 0;
    }

    .menu-list>li:last-child {
      margin-left: auto;
      display: none;
    }

    .menu-list>li a {
      text-decoration: none;
    }

    .menu-list>li a:hover,
    .menu-list>li a:active,
    .menu-list>li a:focus {
      text-decoration: underline;
    }

    .menu-list>li label {
      display: flex;
      flex-direction: row;
      height: 100%;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .menu-list>li label>* {
      margin: 0 3px;
    }

    .menu-list>li>button {
      background-color: rgba(137, 136, 204, 1);
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      padding: 5px;
      width: 100%;
    }

    .menu-list>li>button:hover,
    .menu-list>li>button:active,
    .menu-list>li>button:focus {
      background-color: rgb(92, 91, 168);
    }

    .menu-list #share-text {
      display: none;
      width: 100%;
      border: 1px solid #0A0A0A
    }

    .menu-list #share-text.show {
      display: inline-block;
    }

    .menu-list>li label span {
      font-size: .7rem;
      text-align: left;
    }

    .menu-list>li.run {
      grid-column-start: 1;
      grid-column-end: 3;
    }

    .menu-list>li.format {
      grid-column-start: 3;
      grid-column-end: 5;
    }

    .menu-list>li.share {
      grid-column-start: 5;
      grid-column-end: 7;
    }

    .menu-list>li.shareText {
      grid-column-start: 1;
      grid-column-end: 7;
    }

    .menu-list>li.unstable {
      grid-column-start: 1;
      grid-column-end: 4;
    }

    .menu-list>li.typescript {
      grid-column-start: 4;
      grid-column-end: 7;
    }

    .menu-list>li.github {
      display: none;
    }

    .main {
      flex: 2;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 78px);
    }

    .main>.code {
      flex: 1;
      display: flex;
      max-height: 50%;
      flex-direction: row;
      margin: 0;
      border-right: none;
      border-bottom: 1px solid rgba(0, 0, 0, .3);
    }

    .main>.code:last-of-type {
      border: none;
    }

    .code-area,
    .code-ln {
      font-family: 'Iosevka', monospace;
      background-color: #FCFDCE;
      height: 100%;
      border: none;
      padding: 5px 10px;
      line-height: 1.5;
      resize: none;
      overflow-wrap: normal;
      overflow-x: auto;
      word-wrap: normal;
      white-space: pre;
      font-size: 0.9rem;
    }

    .code-ln {
      color: #CCCC7D;
      text-align: right;
      overflow: hidden;
    }

    .code-area:focus {
      outline: none;
    }

    .code-area#source-input {
      background-color: #FFFFEA;
      width: 100%;
    }

    .code-area#script-output {
      width: 100%;
    }

    .CodeMirror {
      width: 100%;
      height: auto;
    }

    /** Responsive config **/

    @media screen and (min-width: 1023px) {
      .menu-list {
        display: flex;
      }

      .menu-list>li {
        margin-right: 5px;
      }

      .menu-list>li>button {
        border-radius: 4px;
        padding: 1px 7px 2px;
      }

      .menu-list>li label span {
        font-size: 1rem;
      }

      .menu-list>li.github {
        display: block;
      }

      .main {
        flex-direction: row;
      }

      .main>.code {
        border-right: 1px solid rgba(0, 0, 0, .3);
        border-bottom: none;
        max-height: 100%;
        max-width: 50%;
      }
    }

    /** Plan9's Acme Editor theme for CodeMirror **/

    .cm-s-plan9.CodeMirror {
      background-color: #ffffea;
      color: #202020;
      font-family: 'Iosevka', monospace;
      line-height: 1.5 !important;
      font-size: .9rem !important;
    }
    
    .cm-s-plan9.CodeMirror .CodeMirror-gutters {
      background-color: #EAEAEA;
    }
    
    .cm-s-plan9.CodeMirror .CodeMirror-linenumber {
      color: #505050;
    }
    
    .cm-s-plan9 div.CodeMirror-selected,
    .cm-s-plan9 .CodeMirror-line::selection,
    .cm-s-plan9 .CodeMirror-line > span::selection,
    .cm-s-plan9 .CodeMirror-line > span > span::selection,
    .cm-s-plan9 .CodeMirror-line::-moz-selection,
    .cm-s-plan9 .CodeMirror-line > span::-moz-selection,
    .cm-s-plan9 .CodeMirror-line > span > span::-moz-selection {
      background: rgba(175, 238, 238, 0.33);
    }
    
    .cm-s-plan9 .CodeMirror-activeline:before,
    .cm-s-plan9 .CodeMirror-activeline:after {
      content: '';
      position: absolute;
      background-color: rgba(0, 0, 0, .15);
      width: 100%;
      height: 1px;
      left: 0;
      z-index: 1;
    }
    
    .cm-s-plan9 .CodeMirror-activeline:before {
      top: 0;
    }
    
    .cm-s-plan9 .CodeMirror-activeline:after {
      bottom: 0;
    }
    
    .cm-s-plan9 .CodeMirror-activeline-background {
      background-color: #EEECCC;
    }
    
    .cm-s-plan9 .CodeMirror-matchingbracket {
      font-weight: bold;
      color: #9967CF !important;
    }

    .cm-s-plan9 .cm-string {
      color: #005500;
    }

    .cm-s-plan9 .cm-type {
      color: #004488;
    }
    
    .cm-s-plan9 .cm-comment {
      color: #663311;
    }
    
    .cm-s-plan9 .cm-comment,
    .cm-s-plan9 .cm-keyword {
      font-style: italic;
    }
    
    .cm-s-plan9 .cm-comment,
    .cm-s-plan9 .cm-variable,
    .cm-s-plan9 .cm-variable-2,
    .cm-s-plan9 .cm-def {
      font-weight: bold;
    }
  </style>
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-166959783-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'UA-166959783-1');
  </script>

</head>

<body>
  <div class="wrapper">
    <div class="header">
      <h1>Deno Playground</h1>
      <ul class="menu-list">
        <li class="run">
          <button id="eval">Run</button>
        </li>
        <li class="format">
          <button id="format">Format</button>
        </li>
        <li class="share">
          <button id="share">Share</button>
        </li>
        <li class="shareText">
          <input type="text" id="share-text" value="">
        </li>
        <li class="unstable">
          <label for="enable-unstable">
            <input type="checkbox" id="enable-unstable" name="enableUnstable" {{isUnstableTemplateMark}}>
            <span>Use unstable features</span>
          </label>
        </li>
        <li class="typescript">
          <label for="enable-typescript">
            <input type="checkbox" id="enable-typescript" name="enableTypescript" {{isTypescriptTemplateMark}}>
            <span>Use typescript</span>
          </label>
        </li>
        <li class="github">
          <a href="https://github.com/maman/deno-playground" target="_blank">GitHub</a>
        </li>
      </ul>
    </div>
    <div class="main">
      <div class="code">
        <textarea id="source-input" class="code-area">{{source}}</textarea>
      </div>
      <div class="code output">
        <textarea id="script-output" class="code-area" readonly></textarea>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/lib/codemirror.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/mode/javascript/javascript.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/addon/edit/matchbrackets.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/addon/edit/closebrackets.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/addon/comment/comment.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.53.2/addon/selection/active-line.min.js"></script>
  <script>
    let editor;
    let prevNumLines;
    const API_URL = '/api';
    const lineNumberDiv = document.querySelector('.code-ln');
    const source = document.getElementById('source-input');
    const target = document.getElementById('script-output');
    const shareTarget = document.getElementById('share-text');
    const evalBtn = document.getElementById('eval');
    const formatBtn = document.getElementById('format');
    const shareBtn = document.getElementById('share');

    function performInterpreterRequest(command, body) {
      target.value = 'Waiting for Remote server ...';
      const headers = new Headers();
      headers.append('Content-Type', 'application/javascript');
      const requestOptions = {
        headers,
        body,
        method: 'POST',
        redirect: 'follow',
      }
      return fetch(API_URL + '/' + command, requestOptions)
        .then(response => {
          target.value = '';
          return response.text();
        });
    }

    function getExistingCode(id) {
      return fetch(API_URL + '/share?id=' + id)
        .then(response => {
          if (!response.ok) throw new Error('Error' + response.status + ': ' + response.statusText);
          return response.text();
        })
    }

    function getShareId(code) {
      return fetch(API_URL + '/share', {
        method: 'POST',
        body: code,
      }).then(response => {
        if (!response.ok) throw new Error('Error' + response.status + ': ' + response.statusText);
        return response.text();
      })
    }

    function format(text) {
      performInterpreterRequest('fmt', text)
        .then(result => {
          editor && editor.setValue(result);
        })
        .catch(err => {
          target.value = 'Cannot format code:\\n' + err.message;
        });
    }

    function eval(text) {
      const queries = new URLSearchParams();
      const shouldEnableUnstable = !!document.querySelector('#enable-unstable:checked');
      const shouldEnableTypescript = !!document.querySelector('#enable-typescript:checked');
      if (shouldEnableUnstable) queries.append('unstable', 1);
      if (shouldEnableTypescript) queries.append('ts', 1);
      performInterpreterRequest(queries.toString() !== '' ? 'eval?' + queries.toString() : 'eval', text)
        .then(result => {
          target.value = result;
        })
        .catch(err => {
          target.value = 'Cannot run code:\\n' + err.message;
        });
    }

    function share(text) {
      if (!text.trim().length) return;
      getShareId(text)
        .then(result => {
          if (!shareTarget.classList.contains('show')) {
            shareTarget.classList.add('show');
          }
          const urlParams = new URLSearchParams();
          const isUnstable = !!document.querySelector('#enable-unstable:checked');
          const isTypescript = !!document.querySelector('#enable-typescript:checked');
          if (isUnstable) urlParams.append('unstable', 1);
          if (!isTypescript) urlParams.append('ts', 0);
          urlParams.append('id', result);
          shareTarget.value = document.location.origin + '?' + urlParams.toString();
          shareTarget.select();
        })
        .catch(err => {
          alert('Cannot share code: ' + err.message);
          shareTarget.value = '';
        })
    }

    editor = CodeMirror.fromTextArea(source, {
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      mode: 'text/typescript',
      inputStyle: 'contenteditable',
      theme: 'plan9',
      tabSize: 2,
      extraKeys: {
        'Ctrl-/': cm => { cm.toggleComment(); },
        'Cmd-/': cm => { cm.toggleComment(); },
      }
    });
    evalBtn.addEventListener('click', () => { eval(editor.getValue()) });
    formatBtn.addEventListener('click', () => { format(editor.getValue()) });
    shareBtn.addEventListener('click', () => { share(editor.getValue()) });

    document.addEventListener('beforeunload', () => {
      evalBtn.removeEventListener('click', () => { eval(editor.getValue()) });
      formatBtn.removeEventListener('click', () => { format(editor.getValue()) });
      shareBtn.removeEventListener('click', () => { share(editor.getValue()) });
    });
  </script>
</body>
</html>
`;

export default template;
