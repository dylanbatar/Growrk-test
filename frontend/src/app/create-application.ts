import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Root from './App.vue';

export function createApplication() {
  const application = createApp(Root);
  application.use(createPinia());
  return application;
}
