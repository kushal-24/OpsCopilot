## ANALYTICS FILE:
Consists of all the functionalities provided by the dashboard

1. getCasesByPriority: this fn will give us smth like:
[
  { "priority": "High", "count": 120 },
  { "priority": "Medium", "count": 280 },
  { "priority": "Low", "count": 100 }
]

2. getAverageCaseDuration: On average, how long does it take to complete a case?

3. getActivityPerformance:
All Events
   ↓
Group by caseId
   ↓
CASE-001 → [events...]
CASE-002 → [events...]
CASE-003 → [events...]
   ↓
For each Case:
   sort events by timestamp
   ↓
   Event 1 → Event 2 → Event 3 → ...
   ↓
calculate durations
   ↓
group durations by activity

4. getCasesByStatus: gives us such a data
[
  { "status": "Closed", "count": 300 },
  { "status": "Resolved", "count": 120 },
  { "status": "Open", "count": 80 }
]