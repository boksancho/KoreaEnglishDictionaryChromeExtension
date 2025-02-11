<script lang="ts" setup>
// import HelloWorld from '@/components/HelloWorld.vue';
import SettingsUi from '@/components/SettingsUi.vue';

</script>

<template>
  <!-- <div>
    <a href="https://wxt.dev" target="_blank">
      <img src="/wxt.svg" class="logo" alt="WXT logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div> -->
  <img src="@/assets/logo1.png" class="logo" alt="My logo" />
  <SettingsUi msg="settings" />
</template>

<style scoped>
.logo {
  height: 10em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
