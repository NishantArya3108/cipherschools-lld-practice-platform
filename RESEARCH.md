# Research Note

## Learner problem

LLD practice is different from algorithmic practice because there can be multiple reasonable designs. A learner therefore needs feedback on responsibilities, coupling, abstraction, relationships, trade-offs and reasoning rather than only a binary correctness result.

## Existing approaches researched

### Hello Interview
Provides structured system/LLD practice and feedback-oriented interview preparation.

### LLD Arena
Explores a combination of LLD problems, UML/design representation, code execution and AI-assisted grading.

### LLDCanvas
Explores visual class/design modelling and LLD practice.

### Refactoring.Guru
Provides reference material for common design patterns such as Strategy and State.

## Product observations

Existing tools can become broad: large problem libraries, coding environments, UML editors and extensive interview preparation. For a two-day engineering assignment, reproducing those feature sets would reduce the time available for the core learner loop.

## Product direction

LLD Forge focuses on:

1. A small set of problems.
2. A structured design submission.
3. Deterministic validation for facts and structure.
4. AI-assisted reasoning feedback for judgment-heavy criteria.
5. Persistent attempts and retry history.

## Key gap addressed

The MVP makes feedback actionable. Instead of only displaying a score, every concern points to evidence in the submission and a concrete next step.

## Sources

- https://www.hellointerview.com/practice/low-level-design
- https://github.com/mightbeanshuu/lld-arena
- https://www.lldcanvas.in/
- https://refactoring.guru/
