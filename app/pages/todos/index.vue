<script setup lang="ts">
import { toast } from "vue-sonner";
import TodosDataTable from "@/components/todos/TodosDataTable.vue";
import { mockTodoApiItems, mapTodoApiItemsToRows } from "@/lib/todos";
import type { TodoRow } from "@/types/todo";

definePageMeta({
  layout: "default",
  auth: "protected",
});

const todoRows = computed(() => mapTodoApiItemsToRows(mockTodoApiItems));

function announceAction(label: string, row: TodoRow) {
  toast(label, {
    description: `${row.customerName} • ${row.subject}`,
    position: "bottom-center",
  });
}

function announceBulkAction(label: string, rows: TodoRow[]) {
  const description =
    rows.length === 1
      ? rows[0]?.customerName ?? "1 todo selected"
      : `${rows.length} todos selected`;

  toast(label, {
    description,
    position: "bottom-center",
  });
}
</script>

<template>
  <section class="space-y-6 py-4">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold">Todos</h1>
      <p class="text-muted-foreground">
        TanStack Table powers the current prototype with client-side filters,
        sorting, selection, and pagination.
      </p>
    </div>

    <TodosDataTable
      :rows="todoRows"
      @view="announceAction('View todo', $event)"
      @edit="announceAction('Edit todo', $event)"
      @delete="announceAction('Delete todo', $event)"
      @add-selected="announceBulkAction('Add note for selection', $event)"
      @delete-selected="announceBulkAction('Delete selected todos', $event)"
    />
  </section>
</template>
