# AI Usage

## 1. Scope

AI tools were used during development for brainstorming, implementation assistance, code review and prompt design. Final architectural decisions were reviewed against the assignment requirements.

## 2. Submission model

AI suggested supporting text, code and diagrams in the first version. I rejected implementing all formats because the assignment rewards a focused MVP. The MVP uses structured design text/classes/relationships while keeping the domain model extensible.

## 3. Evaluation architecture

AI suggested calling the model directly inside the HTTP submission handler. I rejected that coupling and introduced an Evaluator abstraction. This keeps the practice flow independent of the evaluation implementation.

## 4. Scoring

AI suggested a single overall score. I rejected score-first feedback because LLD can have multiple valid solutions. The MVP returns criterion-level evidence, concern and suggestion instead.

## 5. Failure handling

AI suggested waiting for evaluation before treating a submission as persisted. I rejected this. The submission is saved first and evaluation happens afterward so an evaluator failure cannot lose learner work.

## 6. Product scope

AI suggested additional features such as authentication, leaderboards, larger problem libraries and a full UML canvas. I rejected them for the two-day MVP because they do not materially improve the first practice → feedback → retry loop.

## 7. AI limitations

The AI evaluator is advisory. Deterministic validation remains responsible for structural checks. AI feedback is not treated as an objective truth or a single correct LLD solution.
