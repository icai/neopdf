<template>
  <div>
    <div id='backgroundInfo'  :class="{
      'is-dragover': dragover
    }"   @drop.prevent="onDrop"
    @dragover.prevent="onDragover"
    @dragleave.prevent="dragover = false" >
        <img id='backgroundLogo' src="../../assets/grayscale.png" />
        <div id='backgroundText'>
            Drag & drog, <a href="javascript:;" @click="selectFile">select a file</a>  or by pressing Ctrl + O
        </div>
    </div>
  </div>
</template>
<script>
const { ipcRenderer, app } = require("electron");
export default {
  mounted() {
    ipcRenderer.on("file-open", (event, args) => {
      this.$router.push({path: '/viewer', query: { file: args } })
    });
  },
  data() {
    return {
      dragover: false
    }
  },
  methods:{
    selectFile(event) {
      event.preventDefault()
      ipcRenderer.send('onselect')
    },
    onDragover() {
      this.dragover = true;
    },
    onDrop(event) {
      event.preventDefault();
      this.dragover = false;
      const filePaths = [].slice.call(event.dataTransfer.files).filter(item => item.type == "application/pdf").map(item => item.path);
      filePaths.forEach(item => {
        ipcRenderer.send('ondragstart', item)
      })
    }
  }

}
</script>

<style lang="scss">
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
    padding: 20px;
    border: 2px dashed transparent;
    border-radius: 10px;
  &.is-dragover {
    border: 2px dashed #409eff;
  }
}

#backgroundLogo {
    position: relative;
    height: 150px;
    width: 150px;
    margin: auto;
}

.text-underline {
  text-decoration: underline!important;
}
</style>