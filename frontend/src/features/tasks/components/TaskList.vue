<script setup lang="ts">
import type { Task } from '../task';

defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  select: [task: Task];
}>();

function selectPending(task: Task) {
  if (task.status === 'pending') {
    emit('select', task);
  }
}
</script>

<template>
  <div class="min-h-0 flex-1 overflow-y-auto">
    <p v-if="tasks.length === 0" class="px-5 text-sm text-slate-500">No tasks yet.</p>
    <ul v-else class="flex flex-col gap-4 px-5 pb-28" role="list">
      <li
        v-for="task in tasks"
        :key="task.id"
        role="listitem"
        class="rounded-3xl bg-white px-4 py-4 shadow-lg"
        :data-status="task.status"
        :data-task-id="task.id"
      >
        <button
          v-if="task.status === 'pending'"
          type="button"
          class="flex w-full min-w-0 items-center gap-3 text-left"
          :data-task-id="task.id"
          @click="selectPending(task)"
        >
          <span
            class="size-7 shrink-0 rounded-full border-2 border-blue-600"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1 truncate text-base font-semibold text-neutral-950">{{ task.title }}</span>
        </button>
        <div v-else class="flex min-w-0 items-center gap-3">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" class="size-4 stroke-2" fill="none" stroke="currentColor">
              <path d="M4.5 10.5 8 14l7.5-8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="min-w-0 flex-1 truncate text-base font-semibold text-neutral-950">{{ task.title }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
