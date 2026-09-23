# Design Note

## 1. User journey

Choose problem → understand requirements → create classes → define responsibilities → define relationships → explain decisions → save draft → submit → evaluate → review feedback → retry.

## 2. Domain model

Problem
- owns problem statement, requirements, constraints and rubric.

Attempt
- owns the learner's work lifecycle and status.

Submission
- owns the actual design evidence submitted by the learner.

Evaluation
- owns evaluator status and structured feedback.

Evaluator
- abstraction for evaluation implementations.

RuleBasedEvaluator
- handles deterministic structural checks.

AIEvaluator
- handles judgment-heavy feedback when an AI provider is configured.

## 3. Why Submission is separate from Attempt

The current MVP accepts structured text/design evidence. A future diagram or code submission can be added without changing the attempt lifecycle.

This is the first change test.

## 4. Why Evaluator is an abstraction

The practice flow depends on the concept of an evaluator rather than one specific implementation. A future human evaluator or another rule-based evaluator can be added without rewriting the practice flow.

This is the second change test.

## 5. Deterministic vs AI

Deterministic:
- required fields
- duplicate classes
- invalid relationship references
- empty design sections
- submission state transitions

AI:
- responsibility quality
- coupling/cohesion
- abstraction
- trade-offs
- extensibility
- explanation quality

## 6. Submission lifecycle

DRAFT → SUBMITTED → EVALUATING → COMPLETED

If evaluation fails:

EVALUATING → FAILED → EVALUATING

The submission is stored before evaluation starts so evaluator failure cannot lose learner work.

## 7. Duplicate evaluation

An attempt already in EVALUATING state is not started again. A COMPLETED attempt reuses its existing evaluation. A FAILED attempt can be explicitly retried.

## 8. Trade-offs

SQLite was selected because the assignment is a small monolith and does not require operational database infrastructure.

A full UML editor was intentionally excluded because structured class and relationship input is enough evidence for the MVP.

Authentication was excluded because it does not improve the core learning loop for this assignment.

## 9. Limitations

- AI quality depends on the configured provider.
- The current MVP uses a lightweight structured design editor rather than a full drag-and-drop UML canvas.
- User authentication is not implemented.
- The local evaluator is intentionally small.

## 10. Future extensions

- Diagram submission adapter
- Code submission adapter
- Human review evaluator
- More problems
- Per-learner analytics
