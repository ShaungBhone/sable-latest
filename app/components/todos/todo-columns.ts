import type { ColumnDef } from "@tanstack/vue-table";
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import { h } from "vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TodoRow } from "@/types/todo";

interface TodoColumnActions {
  onView: (row: TodoRow) => void;
  onEdit: (row: TodoRow) => void;
  onDelete: (row: TodoRow) => void;
}

function renderSelectionCheckbox(
  checked: boolean | "indeterminate",
  onChange: () => void,
) {
  return h(Checkbox, {
    modelValue: checked,
    "aria-label": "Select row",
    "onUpdate:modelValue": onChange,
  });
}

function renderSortableHeader(label: string, column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc"; }) {
  return h(
    Button,
    {
      variant: "ghost",
      size: "sm",
      class: "-ml-3 h-8 px-3 text-xs font-semibold tracking-wide uppercase",
      onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    },
    {
      default: () => [
        h("span", label),
        h(ArrowUpDown, { class: "size-3.5" }),
      ],
    },
  );
}

export function createTodoColumns(
  actions: TodoColumnActions,
): ColumnDef<TodoRow>[] {
  return [
    {
      id: "select",
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      header: ({ table }) =>
        renderSelectionCheckbox(
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false,
          () => table.toggleAllPageRowsSelected(),
        ),
      cell: ({ row }) =>
        renderSelectionCheckbox(row.getIsSelected(), () =>
          row.toggleSelected(),
        ),
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => renderSortableHeader("Customer", column),
    },
    {
      accessorKey: "company",
      header: ({ column }) => renderSortableHeader("Company", column),
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "priority",
      header: ({ column }) => renderSortableHeader("Priority", column),
    },
    {
      accessorKey: "nextStep",
      header: "Next Step",
    },
    {
      accessorKey: "dueAt",
      header: ({ column }) => renderSortableHeader("Due", column),
      sortingFn: "datetime",
      cell: ({ row }) => row.original.dueDateLabel,
    },
    {
      accessorKey: "assignee",
      header: "Owner",
    },
    {
      accessorKey: "noteCount",
      header: ({ column }) => renderSortableHeader("Notes", column),
    },
    {
      accessorKey: "bucket",
      header: "Bucket",
      enableHiding: true,
    },
    {
      id: "actions",
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      cell: ({ row }) =>
        h(
          "div",
          { class: "flex items-center justify-end" },
          h(
            DropdownMenu,
            {},
            {
              default: () => [
                h(
                  DropdownMenuTrigger,
                  { asChild: true },
                  {
                    default: () =>
                      h(
                        Button,
                        {
                          variant: "ghost",
                          size: "icon-sm",
                          class: "size-8",
                        },
                        {
                          default: () => [
                            h(MoreHorizontal, { class: "size-4" }),
                            h("span", { class: "sr-only" }, "Open actions"),
                          ],
                        },
                      ),
                  },
                ),
                h(
                  DropdownMenuContent,
                  { align: "end", class: "w-36" },
                  {
                    default: () => [
                      h(
                        DropdownMenuItem,
                        { onSelect: () => actions.onView(row.original) },
                        {
                          default: () => [
                            h(Eye, { class: "size-4" }),
                            "View note",
                          ],
                        },
                      ),
                      h(
                        DropdownMenuItem,
                        { onSelect: () => actions.onEdit(row.original) },
                        {
                          default: () => [
                            h(Pencil, { class: "size-4" }),
                            "Edit",
                          ],
                        },
                      ),
                      h(DropdownMenuSeparator),
                      h(
                        DropdownMenuItem,
                        {
                          variant: "destructive",
                          onSelect: () => actions.onDelete(row.original),
                        },
                        {
                          default: () => [
                            h(Trash2, { class: "size-4" }),
                            "Delete",
                          ],
                        },
                      ),
                    ],
                  },
                ),
              ],
            },
          ),
        ),
    },
  ];
}
