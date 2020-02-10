<template>
  <div class>
    <el-tabs
      class="pdf-tab"
      type="card"
      v-model="tabsValue"
      @tab-click="handleClick"
      addable
      closable
      @tab-remove="removeTab"
      @tab-add="addTab"
    >
      <el-tab-pane
        style="height: 100%"
        :key="item.name"
        v-for="(item, index) in tabs"
        :label="item.title"
        :name="item.name"
      >
        <div class="viewContainer" :id="'viewContainer' + index">
          <iframe :id="'view' + index" allowfullscreen="true" :src="item.src"></iframe>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Tabs, TabPane } from "element-ui";
const path = require("path");
const { ipcRenderer, remote } = require("electron");
const config = { isWin: false, isOsX: false, isNix: false };

const appVer = navigator.appVersion;
if (appVer.indexOf("Win") != -1) config.isWin = true;
else if (appVer.indexOf("Mac") != -1) config.isOsX = true;
else if (appVer.indexOf("X11") != -1) config.isNix = true;
else if (appVer.indexOf("Linux") != -1) config.isNix = true;

function getPathSeparator() {
  if (config.isWin) {
    return "\\";
  } else if (config.isOsx || config.isNix) {
    return "/";
  }
  // default to *nix system.
  return "/";
}
export default {
  components: {
    [Tabs.name]: Tabs,
    [TabPane.name]: TabPane
  },
  data() {
    return {
      tabsValue: "",
      tabs: [
        // {
        //   title: "Tab 1",
        //   name: "1",
        //   src: "" // filepath
        // }
      ],
      tabIndex: -1,
      _viewerElement: null,
    };
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
        // just use `this`
        if(to.query.file) {
            vm._addTab(to.query.file)
        }
    })
  },
  mounted() {
    // Number of tabs in one bucket
    this._computeStepTabs();
    this.run();
  },
  methods: {
    addTab() {
      ipcRenderer.send('onselect')
    },  
    handleClick(tab, args) {
      this._swtichTab(tab.name);        
    },
    /**
     * @desc Switches to tabElement
     * @param {*} tabElement
     */
    _swtichTab(name) {
        this.$nextTick(()=> {
            this._viewerElement = this.$el.querySelector('#view' + this.tabsValue);
            if(this._viewerElement) {
                this._viewerElement.onload = this._setViewerEvents.bind(this);
            }
            this._updateTitle((this.tabs.filter(item => item.name === name) || [])[0].title);
        })
    },
    /**
     * @desc Propagates iframe events to window
     */
    _setViewerEvents() {
      try {
        // env development catch error, due to cross domain
        this._viewerElement.contentDocument.addEventListener('click',
            this._propagateClick);
        this._viewerElement.contentDocument.addEventListener('mousedown',
            this._propagateClick);  
      } catch (error) {
        console.log(error);
      }
    },

    /**
     * @desc Adds a new tab
     * @param {*} pathName
     */
    _addTab(pathName) {
      let newTabName = ++this.tabIndex + "";
      const filename = pathName.substring(
        pathName.lastIndexOf(getPathSeparator()) + 1
      );
      if(process.env.NODE_ENV === 'development') {
        this.tabs.push({
          title: filename,
          name: newTabName,
          src: 'file://' + __static + `/lib/pdfjs/web/viewer.html?file=${encodeURIComponent(
                'file://' + pathName
              )}`
        });
      } else {
        this.tabs.push({
          title: filename,
          name: newTabName,
          src: __static + `/lib/pdfjs/web/viewer.html?file=${encodeURIComponent(
            pathName
          )}`
        });
      }

      this.tabsValue = newTabName;

      this._toggleMenuItems(true);
      this._swtichTab(newTabName);
    },
    removeTab(targetName) {
      let tabs = this.tabs;
      let activeName = this.tabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      this.tabsValue = activeName;
      this.tabs = tabs.filter(tab => tab.name !== targetName);
      if (this.tabs.length <= 0) {
        this._toggleMenuItems(false);
        this._updateTitle();
        // if empty, switch to bootstrap
        this.$router.push({ path: "/bootstrap" });
        
      } else {
        this._swtichTab(activeName);
      }

    },

    _computeStepTabs() {
      this.stepTabs = Math.floor(window.innerWidth / 100);
    },

    /**
     * @desc Dispatches click event to window
     */
    _propagateClick() {
      window.dispatchEvent(new Event("mousedown"));
    },

    /**
     * @desc Sends enable/disable flag for toggle-menu-items
     * @param {*} flag
     */
    _toggleMenuItems(flag) {
      ipcRenderer.send("toggle-menu-items", flag);
    },



    /**
     * @desc Updates title
     * @param {*} pathName
     */
    _updateTitle(pathName) {
      if (pathName) {
        document.title =
          pathName.substring(pathName.lastIndexOf(getPathSeparator()) + 1) +
          " - NeoPDF";
      } else {
        document.title = "NeoPDF";
      }
    },

    /**
     * @desc Opens a file
     * @param {*} pathName
     */
    _openFile(pathName) {
      this._updateTitle(pathName);
      this._addTab(pathName);
    },
    /**
     * @desc Sets menu item events
     *       'click' needs to be propagated (custom-electron-titlebar issue)
     */
    _setMenuItemEvents() {
      ipcRenderer.on("file-open", (event, args) => {
        this._propagateClick();
        this._openFile(args);
      });

      ipcRenderer.on("file-print", (event, args) => {
        this._propagateClick();
        if (this._viewerElement.src) {
          this._viewerElement.contentDocument
            .getElementById("print")
            .dispatchEvent(new Event("click"));
        }
      });

      ipcRenderer.on("file-properties", (event, args) => {
        this._propagateClick();
        if (this._viewerElement.src) {
          this._viewerElement.contentDocument
            .getElementById("documentProperties")
            .dispatchEvent(new Event("click"));
        }
      });

      ipcRenderer.on("file-close", (event, args) => {
        this._propagateClick();
        // if (this._currentTab) {
        //   this._currentTab
        //     .getElementsByClassName("file-tab-close")[0]
        //     .dispatchEvent(new Event("click"));
        // }
      });

      ipcRenderer.on("view-fullscreen", (event, args) => {
        this._propagateClick();
        if (this._viewerElement.src) {
          this._viewerElement.contentDocument
            .getElementById("presentationMode")
            .dispatchEvent(new Event("click"));
        }
      });
    },
    _adjustTabs() {},
    /**
     * @desc Sets window events
     */
    _setWindowEvents() {
      let that = this;
      // Adjust tabs on resize
      window.addEventListener("resize", event => {
        that._computeStepTabs();
        if (that.tabs.length > 0) {
          that._adjustTabs();
        }
      });
    },

    /**
     * @desc Extracts path name from the arguments and opens the file.
     * @param {*} args
     */
    _processArguments(args) {
      const argsLength = args.length;
      if (argsLength > 1 && args[argsLength - 1].endsWith(".pdf")) {
        this._openFile(args[argsLength - 1]);
      }
    },

    /**
     * @desc Sets external application events
     */
    _setExternalEvents() {
      let that = this;
      ipcRenderer.on("external-file-open", (event, args) => {
        that._processArguments(args);
      });
    },

    /**
     * @desc Process initial arguments to the application
     */
    _processRemoteArguments() {
      this._processArguments(remote.process.argv);
    },

    /**
     * @desc Runs the application
     */
    run() {
      this._setMenuItemEvents();
      this._setWindowEvents();
      this._setExternalEvents();
      this._processRemoteArguments();
    }
  }
};
</script>
<style lang="scss" >
.viewContainer {
  position: absolute;
  width: 100%;
  top: 0px;
  left: 0;
  bottom: 0;
  right: 0;
}

#backgroundInfo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  margin: auto;
  display: block;
  font-size: 16px;
  font-weight: lighter;
  text-align: center;
  color: #cccccc;
}

#backgroundLogo {
  position: relative;
  height: 150px;
  width: 150px;
  margin: auto;
}
.pdf-tab {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  .el-tabs__header {
    padding-right: 20px;
    margin-bottom: 0px;
    .el-tabs__nav {
      border-radius: 0px 0px 0 0;
    }

    .el-tabs__item:first-child {
      border-top-left-radius: 0;
    }

  }
  .el-tabs__content {
    position: relative;
    flex: 1 1 auto;
  }
  .el-tabs__item {
    background-color: #E8EAED;
    color: #1A1818;
    // dark
    // background-color: #202124;
    // color: #9ca1a7;

    
    padding-left: 10px!important;
    padding-right: 10px!important;
    // border-radius: 10px 10px 0 0;
    &.is-active {
      background-color: #FFFFFF; 
      // dark
      // background-color: #323639;
      // color: #fff;
    }
  }
}

.pdf-tab iframe {
  position: absolute;
  border: none;
  width: 100%;
  height: 100%;
}
</style>