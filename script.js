/* global Torus jdom css */
/* global Hydra */
/* global CodeMirror */

class IframeApp extends Torus.StyledComponent {
  init() {
    this.iframe = document.createElement("IFRAME");
    this.iframe.width = 512;
    this.iframe.height = 512;
    this.iframe.src = "https://hydra.ojack.xyz/?code=JTIw";
  }
  styles() {
    return css`
      width: 512px;
      height: 512px;
      position: relative;
    `;
  }
  compose() {
    return jdom`<div>${this.iframe}</div>`;
  }
}

const iframeApp = new IframeApp();

class CodeApp extends Torus.StyledComponent {
  init(originalCode) {
    this.placeholder = document.createElement("div");
    this.placeholder.className = "placeholder"
    
    var observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          setTimeout(() => {
            // this.cmApp.commands.evalAll();
            let newurl = `https://hydra.ojack.xyz/?code=${btoa(
              encodeURIComponent("\n" + this.getLastCode())
            )}`;
            iframeApp.iframe.contentWindow.location.replace(newurl);
          }, 60);
          this.placeholder.appendChild(iframeApp.node);
        }
      },
      { threshold: [0.5] }
    );

    observer.observe(this.placeholder);
    this.code = originalCode;
  }
  getLastCode() {
    return this.code;
  }
  notSupportedInEmbeddedEditor() {
    this.showNotSupportedInEmbeddedEditor = true;
    this.render();
  }
  styles() {
    return css`
      position: relative;
      box-sizing: border-box;
      margin: 50px 0;
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      .placeholder {
        width: 100%;
        height: 512px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .not-supported-message {
        background-color: black;
        color: white;
        font-size: 1.25em;
        width: 100%;
        max-width: 512px;
      }
    `;
  }
  compose() {
    let placeholder = this.placeholder;
    return jdom`
    <div>
      ${ placeholder }
    </div>
    `;
  }
}

window.$docsify = {
  auto2top: true,
  loadSidebar: true,
  // relativePath: true,
  subMaxLevel: 3,
  homepage: 'README.md',
  name: "Hydra",
  repo: "ojack/hydra",
  plugins: [
    // https://github.com/baku89/glisp/blob/master/docs/index.html
    function(hook, vm) {
      hook.afterEach((html, next) => {
        html = html.replace(
          /data-lang="javascript"/gi,
          'data-lang="javascript" class="hydra-code"'
        );
        next(html);
      });

      hook.doneEach(() => {
        const codeBlocks = document.querySelectorAll("pre.hydra-code");

        codeBlocks.forEach(preEl => {
          const codeEl = preEl.firstChild;
          const originalCode = codeEl.textContent;

          let codeApp = new CodeApp(originalCode);
          preEl.insertAdjacentElement("afterend", codeApp.node);
          preEl.style.display = "none";
        });
      });

      hook.mounted(() => {
        // Called after initial completion. Only trigger once, no arguments.
      });
    }
  ]
};
