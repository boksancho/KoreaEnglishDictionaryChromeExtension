<script lang="ts" setup>
import { BForm, BButton, BFormCheckbox, BFormInput, BFormGroup } from 'bootstrap-vue-next'
import { ref, watch, computed, nextTick, onMounted, provide, readonly, toRef} from 'vue'
import { storage } from '@wxt-dev/storage'

defineProps({
  msg: String,
});

const count = ref(0);
const checked = ref<boolean>(false);
const geminiApiKey = ref<string>('');
watch(checked, async (newValue, oldValue) => {
  await storage.setItem<boolean>("local:isActive", checked.value);
})

// onMounted
onMounted(async () => {
  const isActive = await storage.getItem<boolean>("local:isActive")
  checked.value = !!isActive
  const caption = checked.value === true ? 'On' : 'Off'
  chrome.action.setBadgeText({"text":caption });

})

async function onSubmit () {
  await storage.setItem<string>("local:geminiApiKey", geminiApiKey.value)
}


</script>

<template>
  <div class="container mb-3">
    <img src="@/assets/32.png" class="logo mr-3" alt="My logo" />&nbsp;&nbsp;
    <h2 class="ml-3">Settings</h2> 
  </div>
  <div class="card">
    <!-- <BButton @click="clicked">Button</BButton> -->
    <BFormCheckbox v-model="checked" name="check-button" switch size="lg">
      Enable
    </BFormCheckbox>
    <BForm @submit="onSubmit">
      <!-- <label for="geminiApiKey">Enter your gemini api key</label> -->
      <BFormGroup>
        <BFormInput id="geminiApiKey" v-model="geminiApiKey" placeholder="Enter your gemini api key"></BFormInput>
        <BButton class="mt-1" type="submit" variant="primary">Submit</BButton>
      </BFormGroup>
    </BForm>
  </div>
  <!-- <h2>{{ msg }}</h2> 
  
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/SettingsUi.vue</code> to test HMR
    </p>
  </div>

  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the WXT and Vue logos to learn more</p> -->
</template>

<style scoped>
.container {
  display: flex;
}
.read-the-docs {
  color: #888;
}
</style>
