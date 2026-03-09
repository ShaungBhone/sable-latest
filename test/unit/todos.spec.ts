import { describe, expect, it } from "vitest";
import { mapTodoApiItemToRow } from "@/lib/todos";

describe("todo mapping", () => {
  it("maps API items into table rows with a formatted due label", () => {
    const row = mapTodoApiItemToRow({
      id: "todo-100",
      customerId: "cus-100",
      customerName: "Acme Holdings",
      company: "Acme Holdings",
      subject: "Review loyalty campaign copy",
      priority: "High",
      nextStep: "Follow Up",
      dueAt: "2026-03-09T09:30:00.000Z",
      bucket: "today",
      noteCount: 3,
      assignee: "Nina",
    });

    expect(row.customerName).toBe("Acme Holdings");
    expect(row.dueDateLabel).toContain("Mar");
    expect(row.bucket).toBe("today");
    expect(row.noteCount).toBe(3);
  });
});
