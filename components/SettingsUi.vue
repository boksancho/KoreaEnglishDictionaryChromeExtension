<script lang="ts" setup>
import { BForm, BButton, BFormCheckbox, BFormInput, BFormGroup } from 'bootstrap-vue-next'
import { ref, watch, computed, nextTick, onMounted, provide, readonly, toRef} from 'vue'
import { storage } from '@wxt-dev/storage'

defineProps({
  msg: String,
});

const count = ref(0);
const checked = ref<boolean>(false);
const googleApiKey = ref<string>('');
watch(checked, async (newValue, oldValue) => {
  await storage.setItem<boolean>("local:isActive", checked.value);
})

// onMounted
onMounted(async () => {
  const isActive = await storage.getItem<boolean>("local:isActive")
  checked.value = !!isActive
})

async function onSubmit () {
  await storage.setItem<string>("local:googleApiKey", googleApiKey.value)
}


</script>

<template>
  <h2>Settings</h2> 
  <div class="card">
    <!-- <BButton @click="clicked">Button</BButton> -->
    <BFormCheckbox v-model="checked" name="check-button" switch size="lg">
      Enable
    </BFormCheckbox>
    <BForm @submit="onSubmit">
      <label for="googleApiKey">Enter your google api key</label>
      <BFormGroup>
        <BFormInput id="googleApiKey" v-model="googleApiKey" placeholder="Enter your google api key"></BFormInput>
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
.read-the-docs {
  color: #888;
}
</style>
