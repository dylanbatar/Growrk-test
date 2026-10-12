<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    error?: string | null;
    submitting?: boolean;
  }>(),
  {
    error: null,
    submitting: false,
  },
);

const emit = defineEmits<{
  submit: [title: string];
  close: [];
  input: [];
}>();

const title = ref('');
const canSubmit = computed(() => title.value.trim().length > 0 && !props.submitting);

function submit() {
  const nextTitle = title.value.trim();
  if (!nextTitle || props.submitting) {
    return;
  }

  emit('submit', nextTitle);
}

function onTitleInput() {
  emit('input');
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-10 flex flex-col justify-end">
    <button
      type="button"
      class="absolute inset-0 bg-slate-400/40"
      aria-label="Close"
      @click="emit('close')"
    />
    <form
      class="relative z-10 mx-auto w-full max-w-sm rounded-t-4xl bg-white px-5 pt-7 pb-6 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-todo-title"
      @submit.prevent="submit"
    >
      <h2 id="create-todo-title" class="text-3xl font-bold tracking-tight text-neutral-950">
        Create Todo
      </h2>
      <label class="mt-6 block">
        <span class="sr-only">Task name</span>
        <input
          v-model="title"
          name="title"
          type="text"
          placeholder="Task name"
          class="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-neutral-950 outline-none placeholder:text-slate-400"
          @input="onTitleInput"
        />
      </label>
      <p v-if="error" role="alert" class="mt-3 text-sm text-red-700">{{ error }}</p>
      <button
        data-action="create"
        type="button"
        class="mt-8 h-14 w-full rounded-2xl bg-blue-600 text-base font-semibold text-white disabled:opacity-40"
        :disabled="!canSubmit"
        @click="submit"
      >
        Create
      </button>
    </form>
  </div>
</template>
