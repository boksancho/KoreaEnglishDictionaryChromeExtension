<script setup lang="ts">
import dictionaryLogo from "~/assets/4-1024.webp"
const props = defineProps({
  wordToLookup: {
    type: String,
    default: ''
  },
  source: {
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

</script>

<template>
  <div 
    class="word-search-result-container" 
    style="border:2px solid;border-radius:10px;background-color:#f9f9f9;"
  >
  <p style="margin-top:3px;margin-bottom:3px;margin-left:5px;margin-right:5px;">
      <img v-if="source === 'azure'" src="@/assets/dictionary.png" style="width:16px; height:16px;" />
      <img v-else :src="dictionaryLogo" style="width:16px; height:16px;" />
      {{wordToLookup}}: {{wordDefinition}}
    </p>
  </div>
</template>

<style scoped>

</style>