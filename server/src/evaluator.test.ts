import { describe, expect, it } from "vitest";
import { RuleBasedEvaluator } from "./evaluator.js";

const problem = {
  title: "Parking Lot",
  requirements: ["vehicle", "spot", "ticket"],
  constraints: ["extensible"],
  concepts: ["Strategy", "SOLID"]
};

describe("RuleBasedEvaluator", () => {
  it("detects an empty class list", async () => {
    const result = await new RuleBasedEvaluator().evaluate(problem, {
      requirementsUnderstanding: "I need to manage vehicles.",
      classes: [],
      relationships: [],
      explanation: "I want separate domain responsibilities."
    });

    expect(result.criteria.some((c) => c.status === "MISSING")).toBe(true);
  });

  it("accepts a basic structured design", async () => {
    const result = await new RuleBasedEvaluator().evaluate(problem, {
      requirementsUnderstanding: "Parking lot accepts vehicles and creates tickets.",
      classes: [
        {
          name: "ParkingLot",
          responsibilities: ["manage floors"],
          methods: ["parkVehicle"]
        },
        {
          name: "Vehicle",
          responsibilities: ["represent vehicle"],
          methods: []
        }
      ],
      relationships: [
        {
          from: "ParkingLot",
          type: "composition",
          to: "Vehicle"
        }
      ],
      explanation: "Pricing is separated because pricing rules can change."
    });

    expect(result.summary).toContain("Parking Lot");
    expect(result.criteria.length).toBeGreaterThan(0);
  });
});
