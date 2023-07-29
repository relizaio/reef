<template>
    <div id="app">
        <div class="topNavBar">
            <div><router-link to="/"><img id="relizaLogo" src="/logo_svg_no_tag_3.svg" /></router-link></div>
            <div class="publicSupport">
                <span class="publicSupport"><a href="https://docs.relizahub.com">Documentation.</a> Support:
                <a href="https://discord.gg/UTxjBf9juQ">DevOps Discord</a></span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { NDropdown } from 'naive-ui'
import { CaretDownFilled } from '@vicons/antd'
import { Icon } from '@vicons/utils'

export default {
    name: 'TopNavBar',
    components: {
        NDropdown, CaretDownFilled, Icon
    },
    props: {},
    async setup(/*props : any, { emit } : any*/) {

        return {
 
        }
    },
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

body {
    overflow: scroll;
}
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

#relizaLogo {
    width: 160px;
    margin-left: -74px;
}
.topNavBar {
    border-bottom: solid;
    border-bottom-width: thin;
    border-bottom-color: #dfe4e5;
    display: grid;
    grid-template-columns: 0.1fr 1fr 0.5fr 80px;
    a {
        font-weight: bold;
        color: rgb(25, 25, 25);
        &.router-link-exact-active {
          color: rgb(255, 148, 130);
        }
    }
    div.publicSupport {
        padding-top: 15px;
        color: red;
        font-style: italic;
        font-weight: bold;
        text-align: center;
    }
    span.version {
        color: rgb(25, 25, 25);
        text-align: center;
        font-style: italic;
        padding-top: 15px;
        font-weight: lighter;
        margin-right: 20px;
    }
}
.horizontalNavElement{
    padding-top: 15px;
}
.horizontalNavIcons{
    padding-top: 15px;
}

</style>