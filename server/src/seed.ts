import { db, now } from "./db.js";

const problems = [
  {
    id: "parking-lot", title: "Parking Lot", slug: "parking-lot", difficulty: "Medium",
    description: "Design a parking lot system that supports multiple vehicle types, parking spots, tickets and configurable pricing.",
    requirements: ["Support multiple vehicle types.","Support different parking spot types.","Assign a suitable available spot.","Generate a parking ticket.","Release a spot when a vehicle exits.","Calculate parking fees.","Allow pricing behaviour to change independently."],
    constraints: ["Keep responsibilities focused.","Avoid putting all business behaviour in ParkingLot.","Design for changing pricing rules."],
    concepts: ["OOP","SOLID","Strategy","Composition"]
  },
  {
    id: "elevator-system", title: "Elevator System", slug: "elevator-system", difficulty: "Medium",
    description: "Design an elevator system that handles requests from multiple floors and manages elevator movement and state.",
    requirements: ["Support multiple elevators.","Accept requests from floors.","Move elevators between floors.","Track elevator state.","Assign requests to elevators."],
    constraints: ["Keep elevator responsibilities focused.","Allow request scheduling logic to evolve."],
    concepts: ["State","Strategy","Abstraction","Object Collaboration"]
  },
  {
    id: "vending-machine", title: "Vending Machine", slug: "vending-machine", difficulty: "Easy",
    description: "Design a vending machine that supports product selection, payment, change and out-of-stock handling.",
    requirements: ["Display products.","Select a product.","Accept money.","Validate payment.","Return change.","Handle out-of-stock products."],
    constraints: ["Keep state transitions explicit.","Avoid putting every behaviour into one class."],
    concepts: ["State","Encapsulation","Interfaces"]
  }
];

const upsert = db.prepare(\`
INSERT INTO problems (id,title,slug,difficulty,description,requirements,constraints,concepts,created_at)
VALUES (?,?,?,?,?,?,?,?,?)
ON CONFLICT(slug) DO UPDATE SET
  id=excluded.id,title=excluded.title,difficulty=excluded.difficulty,description=excluded.description,
  requirements=excluded.requirements,constraints=excluded.constraints,concepts=excluded.concepts
\`);

for (const p of problems) {
  upsert.run(p.id,p.title,p.slug,p.difficulty,p.description,JSON.stringify(p.requirements),JSON.stringify(p.constraints),JSON.stringify(p.concepts),now());
}
console.log("Seed complete.");
