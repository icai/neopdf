<template>
  <div class="about"  >
    <img id='logo' src='../../assets/logo.png' />
    <div id='info'>
        <div id='label'>NeoPDF</div>
        <div id='description'>A simple PDF viewer</div>
        <div id='stats'>
            <div>Version: {{version}}</div>
            <div>Author: Terry Cai</div>
        </div>
    </div>
    <a id='close' href="javascript:;">&times;</a>

  </div>
</template>

<script>
const version = __version;
export default {
    data() {
        return {
            version: version
        }
    },
    mounted() {
        const remote = require('electron').remote
        document.getElementById('close').addEventListener('click', event => {
            let window = remote.getCurrentWindow()
            window.close()
        })
    }

}
</script>

<style lang="css" scoped>
body {
    overflow: hidden;
    user-select: none;
}

.about {
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    /* movable */
    -webkit-user-select: none;
    -webkit-app-region: drag;
}

#logo {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 75px;
    width: 75px;
    left: 25px;
}

#info {
    position: absolute;
    top: 50%;
    left: 125px;
    transform: translateY(-50%);
}

#label {
    font-size: 18px;
}

#description {
    font-size: 14px
}

#stats {
    margin-top: 10px;
    font-size: 12px;
}

#close {
    position: absolute;
    right: 0;
    top: 0;
    margin-right: 10px;
    font-size: 34px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1;
}
</style>