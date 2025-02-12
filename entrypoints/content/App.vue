<script setup lang="ts">
import vueLogo from "~/assets/vue.svg"
import bxLogo from "~/assets/bx.svg"
import bxLogo2 from "~/assets/4-1024.webp"
import { onMounted } from 'vue'

const props = defineProps({
  wordToLookup: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  wordDefinition: {
    type: String,
    default: ''
  }
})
function clicked () {
  console.log("🚀 ~ clicked ~ clicked:")
  
}
onMounted(() =>{
  console.log("🚀 ~ onMounted ~ props.wordToLookup:", props.wordToLookup)
  console.log("🚀 ~ onMounted ~ props.wordDefinition:", props.wordDefinition)
})
</script>

<template>
  <div 
    class="word-search-result-container" 
    style="border:2px solid;border-radius:10px;background-color:#f9f9f9;"
  >
  <p style="margin-top:3px;margin-bottom:3px;margin-left:5px;margin-right:5px;">
      <img :src="bxLogo2" style="width:16px; height:16px;" />
      <!-- <a :href="`https://en.dict.naver.com/#/search?range=all&query=${wordToLookup}`" target="blank" @click="clicked">{{wordToLookup}}</a> -->
      {{wordToLookup}}: {{wordDefinition}}
    </p>
  </div>
</template>

<style scoped>
/* .word-search-result-container {
  position: fixed;
  right: 16px;
  top: 16px;
  width: 250px;
  height: 200px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: black;
}

img {
  width: 24px;
  height: 24px;
}

 */
</style>