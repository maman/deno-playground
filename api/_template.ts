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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap">
  <style>
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
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px;
      background-color: #EAFFFF;
      border-top: 1px solid #000;
      border-bottom: 1px solid #A6A6D4;
    }

    .menu-list>li {
      margin-right: 5px;
      list-style: none;
      text-align: center;
      position: relative;
    }

    .menu-list>li:first-child {
      margin-left: 0;
    }

    .menu-list>li:last-child {
      margin-left: auto;
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
      cursor: pointer;
    }

    .menu-list>li label>* {
      margin: 0 3px;
    }

    .menu-list>li>button {
      border-radius: 4px;
      background-color: rgba(137, 136, 204, 1);
      border: none;
      color: #FFFFFF;
      cursor: pointer;
    }

    .menu-list>li>button:hover,
    .menu-list>li>button:active,
    .menu-list>li>button:focus {
      background-color: rgb(92, 91, 168);
    }

    .menu-list #share-text {
      display: none;
    }

    .menu-list #share-text.show {
      display: inline-block;
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

    @media screen and (min-width: 1023px) {
      .main {
        flex-direction: row;
      }

      .main>.code {
        border-right: 1px solid rgba(0, 0, 0, .3);
        border-bottom: none;
      }
    }

    .code-area,
    .code-ln {
      font-family: 'Inconsolata', monospace;
      background-color: #FCFDCE;
      height: 100%;
      border: none;
      padding: 10px;
      line-height: 1.5;
      resize: none;
      overflow-wrap: normal;
      overflow-x: auto;
      word-wrap: normal;
      white-space: pre;
      font-size: 16px;
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
        <li>
          <button id="eval">Run</button>
        </li>
        <li>
          <button id="format">Format</button>
        </li>
        <li>
          <button id="share">Share</button>
          <input type="text" id="share-text" value="">
        </li>
        <li>
          <label for="enable-unstable">
            <input type="checkbox" id="enable-unstable" name="enableUnstable" {{isUnstableTemplateMark}}>
            <span>Use unstable features</span>
          </label>
        </li>
        <li>
          <label for="enable-typescript">
            <input type="checkbox" id="enable-typescript" name="enableTypescript" {{isTypescriptTemplateMark}}>
            <span>Use typescript</span>
          </label>
        </li>
        <li>
          <a href="https://github.com/maman/deno-playground">GitHub</a>
        </li>
      </ul>
    </div>
    <div class="main">
      <div class="code">
        <div class="code-ln"><span>1</span></div>
        <textarea id="source-input" class="code-area">{{source}}</textarea>
      </div>
      <div class="code output">
        <textarea id="script-output" class="code-area" readonly></textarea>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/behave-js@1.5.0/behave.min.js"></script>
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
    const urlParams = new URLSearchParams(window.location.search);
    const isTypescript = urlParams.has('ts');
    const isUnstable = urlParams.has('unstable');
    const isLoadMode = urlParams.has('id');

    BehaveHooks.add(['keydown'], data => {
      const numLines = data.lines.total;
      if (prevNumLines !== numLines) {
        prevNumLines = numLines
        let html = '';
        for (let i = 0; i < numLines; i++) {
          html += '<div>' + (i + 1) + '</div>';
        }
        lineNumberDiv.innerHTML = html;
      }
    });

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

    function format() {
      performInterpreterRequest('fmt', source.value)
        .then(result => {
          source.value = result;
        })
        .catch(err => {
          target.value = 'Cannot format code:\\n' + err.message;
        });
    }

    function eval() {
      const queries = new URLSearchParams();
      const shouldEnableUnstable = !!document.querySelector('#enable-unstable:checked');
      const shouldEnableTypescript = !!document.querySelector('#enable-typescript:checked');
      if (shouldEnableUnstable) queries.append('unstable', 1);
      if (shouldEnableTypescript) queries.append('ts', 1);
      performInterpreterRequest(queries.toString() !== '' ? 'eval?' + queries.toString() : 'eval', source.value)
        .then(result => {
          target.value = result;
        })
        .catch(err => {
          target.value = 'Cannot run code:\\n' + err.message;
        });
    }

    function share() {
      if (!source.value.trim().length) return;
      getShareId(source.value)
        .then(result => {
          if (!shareTarget.classList.contains('show')) {
            shareTarget.classList.add('show');
          }
          const urlParams = new URLSearchParams();
          const isUnstable = !!document.querySelector('#enable-unstable:checked');
          const isTypescript = !!document.querySelector('#enable-typescript:checked');
          if (isUnstable) urlParams.append('unstable', 1);
          if (isTypescript) urlParams.append('ts', 1);
          urlParams.append('id', result);
          shareTarget.value = document.location.origin + '?' + urlParams.toString();
          shareTarget.select();
        })
        .catch(err => {
          alert('Cannot share code: ' + err.message);
          shareTarget.value = '';
        })
    }

    function syncScroll(evt, target) {
      requestAnimationFrame(() => {
        target.scrollTop = evt.target.scrollTop;
      });
    }

    if (isUnstable) document.getElementById('enable-unstable').checked = true;
    if (isTypescript) document.getElementById('enable-typescript').checked = true;

    document.addEventListener('DOMContentLoaded', () => {
      editor = new Behave({
        textarea: document.getElementById('source-input'),
        replaceTab: true,
        softTabs: false,
        tabSize: 2,
        autoOpen: true,
        overwrite: true,
        autoStrip: true,
        autoIndent: true,
      });
      source.addEventListener('scroll', evt => { syncScroll(evt, lineNumberDiv) });
      evalBtn.addEventListener('click', () => { eval() });
      formatBtn.addEventListener('click', () => { format() });
      shareBtn.addEventListener('click', () => { share() });
    });

    document.addEventListener('beforeunload', () => {
      editor && editor.close();
      source.removeEventListener('scroll', evt => { syncScroll(evt, lineNumberDiv) });
      evalBtn.removeEventListener('click', () => { eval() });
      formatBtn.removeEventListener('click', () => { format() });
      shareBtn.removeEventListener('click', () => { share() });
    });
  </script>
</body>
</html>
`;

export default template;