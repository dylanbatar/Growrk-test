<script setup lang="ts">
defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();
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
      <button
        data-action="complete"
        type="button"
        class="mt-8 h-14 w-full rounded-2xl bg-blue-600 text-base font-semibold text-white"
        @click="emit('confirm')"
      >
        Mark completed
      </button>
    </div>
  </div>
</template>
