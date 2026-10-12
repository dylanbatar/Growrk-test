<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import CompleteTaskSheet from '../components/CompleteTaskSheet.vue';
import CreateTaskSheet from '../components/CreateTaskSheet.vue';
import TaskList from '../components/TaskList.vue';
import { useTasksStore } from '../stores/tasks';
import type { Task } from '../task';

const store = useTasksStore();
const { tasks, creating, createError } = storeToRefs(store);

const createOpen = ref(false);
const selectedId = ref<string | null>(null);
const selected = computed(() => tasks.value.find((task) => task.id === selectedId.value) ?? null);

function openCreate() {
  selectedId.value = null;
  createOpen.value = true;
}

function closeCreate() {
  createOpen.value = false;
  createError.value = null;
}

async function addTask(title: string) {
  const count = tasks.value.length;
  await store.create(title);
  if (tasks.value.length === count + 1) {
    createOpen.value = false;
  }
}

function clearCreateError() {
  createError.value = null;
}

function openComplete(task: Task) {
  closeCreate();
  selectedId.value = task.id;
}

function closeComplete() {
  selectedId.value = null;
}

function completeSelected() {
  const id = selectedId.value;
  if (!id) {
    return;
  }

  store.completeLocally(id);
  selectedId.value = null;
}
</script>

<template>
  <div class="h-dvh overflow-hidden bg-slate-200">
    <main class="relative mx-auto flex h-dvh w-full max-w-sm flex-col overflow-hidden">
      <h1 class="shrink-0 px-5 pt-6 pb-6 text-5xl leading-none font-bold tracking-tight text-neutral-950">
        Hello
      </h1>

      <TaskList :tasks="tasks" @select="openComplete" />

      <button
        v-if="!createOpen && !selected"
        type="button"
        aria-label="Create todo"
        class="absolute right-0 bottom-0 flex size-28 translate-x-6 translate-y-6 items-start justify-start rounded-full bg-blue-600 pt-7 pl-7 text-white"
        @click="openCreate"
      >
        <span class="text-4xl leading-none font-light" aria-hidden="true">+</span>
      </button>

      <CreateTaskSheet
        v-if="createOpen"
        :open="true"
        :error="createError?.message ?? null"
        :submitting="creating"
        @submit="addTask"
        @close="closeCreate"
        @input="clearCreateError"
      />
      <CompleteTaskSheet
        v-if="selected?.status === 'pending'"
        :title="selected.title"
        @confirm="completeSelected"
        @close="closeComplete"
      />
    </main>
  </div>
</template>
