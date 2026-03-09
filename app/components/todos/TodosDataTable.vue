<script setup lang="ts">
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/vue-table";
import type { TodoRow, TodoTab } from "@/types/todo";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { ChevronDown } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import type { Ref } from "vue";
import Button from "@/components/ui/button/Button.vue";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Input from "@/components/ui/input/Input.vue";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createTodoColumns } from "@/components/todos/todo-columns";

const props = defineProps<{
  rows: TodoRow[];
}>();

const emit = defineEmits<{
  (e: "view", row: TodoRow): void;
  (e: "edit", row: TodoRow): void;
  (e: "delete", row: TodoRow): void;
  (e: "add-selected", rows: TodoRow[]): void;
  (e: "delete-selected", rows: TodoRow[]): void;
}>();

function updateValue<T>(updaterOrValue: Updater<T>, target: Ref<T>) {
  target.value =
    typeof updaterOrValue === "function"
      ? updaterOrValue(target.value)
      : updaterOrValue;
}

const activeTab = ref<TodoTab>("all");
const globalFilter = ref("");
const sorting = ref<SortingState>([{ id: "dueAt", desc: false }]);
const columnFilters = ref<ColumnFiltersState>([]);
const rowSelection = ref<RowSelectionState>({});
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 });
const columnVisibility = ref<VisibilityState>({
  bucket: false,
});

const columns = computed(() =>
  createTodoColumns({
    onView: (row) => emit("view", row),
    onEdit: (row) => emit("edit", row),
    onDelete: (row) => emit("delete", row),
  }),
);

const table = useVueTable({
  get data() {
    return props.rows;
  },
  get columns() {
    return columns.value;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get globalFilter() {
      return globalFilter.value;
    },
    get pagination() {
      return pagination.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
  },
  getRowId: (row) => row.id,
  enableRowSelection: true,
  onSortingChange: (updaterOrValue) => updateValue(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => updateValue(updaterOrValue, columnFilters),
  onRowSelectionChange: (updaterOrValue) => updateValue(updaterOrValue, rowSelection),
  onGlobalFilterChange: (updaterOrValue) => updateValue(updaterOrValue, globalFilter),
  onPaginationChange: (updaterOrValue) => updateValue(updaterOrValue, pagination),
  onColumnVisibilityChange: (updaterOrValue) => updateValue(updaterOrValue, columnVisibility),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

const tabOptions = computed(() => [
  {
    value: "all" as TodoTab,
    label: "All",
    count: props.rows.length,
  },
  {
    value: "today" as TodoTab,
    label: "Today",
    count: props.rows.filter((row) => row.bucket === "today").length,
  },
  {
    value: "overdue" as TodoTab,
    label: "Overdue",
    count: props.rows.filter((row) => row.bucket === "overdue").length,
  },
  {
    value: "upcoming" as TodoTab,
    label: "Upcoming",
    count: props.rows.filter((row) => row.bucket === "upcoming").length,
  },
]);

const priorityOptions = computed(() =>
  Array.from(new Set(props.rows.map((row) => row.priority))),
);

const nextStepOptions = computed(() =>
  Array.from(new Set(props.rows.map((row) => row.nextStep))),
);

const companyOptions = computed(() =>
  Array.from(new Set(props.rows.map((row) => row.company))),
);

const selectedRows = computed(() =>
  table.getFilteredSelectedRowModel().rows.map((row) => row.original),
);

const selectedCount = computed(() => selectedRows.value.length);
const canPreviousPage = computed(() => table.getCanPreviousPage());
const canNextPage = computed(() => table.getCanNextPage());
const totalRows = computed(() => table.getFilteredRowModel().rows.length);
const totalPages = computed(() => table.getPageCount());
const pageIndex = computed(() => table.getState().pagination.pageIndex);
const filteredSelectedCount = computed(
  () => table.getFilteredSelectedRowModel().rows.length,
);
const filteredRowCount = computed(() => table.getFilteredRowModel().rows.length);
const visibleColumns = computed(() =>
  table
    .getAllColumns()
    .filter((column) => column.getCanHide() && !["bucket"].includes(column.id)),
);

const paginationItems = computed(() => {
  const page = pageIndex.value + 1;
  const total = totalPages.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis-right", total] as const;
  }

  if (page >= total - 2) {
    return [1, "ellipsis-left", total - 3, total - 2, total - 1, total] as const;
  }

  return [1, "ellipsis-left", page - 1, page, page + 1, "ellipsis-right", total] as const;
});

function setColumnFilter(columnId: string, value: string) {
  table.getColumn(columnId)?.setFilterValue(value || undefined);
  table.setPageIndex(0);
}

function onSelectFilterChange(columnId: string, event: Event) {
  setColumnFilter(columnId, (event.target as HTMLSelectElement).value);
}

function setActiveTab(tab: TodoTab) {
  activeTab.value = tab;
  table
    .getColumn("bucket")
    ?.setFilterValue(tab === "all" ? undefined : tab);
  table.setPageIndex(0);
}

function goToPage(page: number) {
  table.setPageIndex(page - 1);
}

watch(
  globalFilter,
  (value) => {
    table.setGlobalFilter(value);
    table.setPageIndex(0);
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="tab in tabOptions"
          :key="tab.value"
          :variant="activeTab === tab.value ? 'default' : 'outline'"
          size="sm"
          @click="setActiveTab(tab.value)"
        >
          {{ tab.label }} ({{ tab.count }})
        </Button>
      </div>
      <div class="flex items-center gap-2">
        <div class="text-muted-foreground text-sm">
          {{ totalRows }} todo{{ totalRows === 1 ? "" : "s" }}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="ml-auto">
              Columns
              <ChevronDown class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuCheckboxItem
              v-for="column in visibleColumns"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:modelValue="column.toggleVisibility(!!$event)"
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))]">
      <Input
        v-model="globalFilter"
        placeholder="Search customer, company, subject, owner"
      />
      <select
        class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
        @change="onSelectFilterChange('priority', $event)"
      >
        <option value="">All priorities</option>
        <option v-for="priority in priorityOptions" :key="priority" :value="priority">
          {{ priority }}
        </option>
      </select>
      <select
        class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
        @change="onSelectFilterChange('nextStep', $event)"
      >
        <option value="">All next steps</option>
        <option v-for="nextStep in nextStepOptions" :key="nextStep" :value="nextStep">
          {{ nextStep }}
        </option>
      </select>
      <select
        class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
        @change="onSelectFilterChange('company', $event)"
      >
        <option value="">All companies</option>
        <option v-for="company in companyOptions" :key="company" :value="company">
          {{ company }}
        </option>
      </select>
    </div>

    <div
      v-if="selectedCount"
      class="bg-muted/50 flex flex-col gap-3 rounded-lg border p-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <p class="text-sm">
        {{ selectedCount }} selected
      </p>
      <div class="flex gap-2">
        <Button size="sm" variant="outline" @click="emit('add-selected', selectedRows)">
          Add selected
        </Button>
        <Button
          size="sm"
          variant="destructive"
          @click="emit('delete-selected', selectedRows)"
        >
          Delete selected
        </Button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border">
      <Table class="min-w-240 text-left">
        <TableHeader class="bg-muted/50">
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="
                cn(
                  'px-4 py-3',
                  cell.column.id === 'actions' && 'text-right',
                )
              "
            >
              <FlexRender
                :render="cell.column.columnDef.cell ?? cell.column.columnDef.header"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
          <TableRow v-if="!table.getRowModel().rows.length">
            <TableCell
              colspan="10"
              class="text-muted-foreground px-4 py-10 text-center"
            >
              No todos match the current filters.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <p class="text-muted-foreground text-sm">
        {{ filteredSelectedCount }} of {{ filteredRowCount }} row(s) selected.
      </p>
      <Pagination class="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              :disabled="!canPreviousPage"
              :class="!canPreviousPage && 'pointer-events-none opacity-50'"
              @click="table.previousPage()"
            />
          </PaginationItem>
          <PaginationItem
            v-for="item in paginationItems"
            :key="String(item)"
          >
            <PaginationEllipsis
              v-if="typeof item === 'string'"
            />
            <PaginationLink
              v-else
              :is-active="pageIndex + 1 === item"
              @click="goToPage(item)"
            >
              {{ item }}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              :disabled="!canNextPage"
              :class="!canNextPage && 'pointer-events-none opacity-50'"
              @click="table.nextPage()"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>
