<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    error?: string | null;
    submitting?: boolean;
  }>(),
  {
    error: null,
    submitting: false,
  },
);

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();

function confirm() {
  if (props.submitting) {
    return;
  }

  emit('confirm');
}
</script>

<template>
  <div class="fixed inset-0 z-10 flex flex-col justify-end">
    <button
      type="button"
      class="absolute inset-0 bg-slate-400/40"
      aria-label="Close"
      @click="emit('close')"
    />
    <div
      class="relative z-10 mx-auto w-full max-w-sm rounded-t-4xl bg-white px-5 pt-7 pb-6 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-task-title"
    >
      <h2 id="complete-task-title" class="text-2xl font-bold tracking-tight text-neutral-950">
        {{ title }}
      </h2>
      <p v-if="error" role="alert" class="mt-3 text-sm text-red-700">{{ error }}</p>
      <button
        data-action="complete"
        type="button"
        class="mt-8 h-14 w-full rounded-2xl bg-blue-600 text-base font-semibold text-white disabled:opacity-40"
        :disabled="submitting"
        @click="confirm"
      >
        Mark completed
      </button>
    </div>
  </div>
</template>
