---
id: lesson-15
slug: monitoring-with-cloudwatch
title: "Monitoring with CloudWatch and CloudTrail"
level: intermediate
order: 15
duration: 19
tags:
  - cloudwatch
  - cloudtrail
  - metrics
  - alarms
  - observability
summary: "How you see what's happening on AWS — CloudWatch collecting metrics, logs, and alarms that react to thresholds, versus CloudTrail recording who called which API and when for audit — and why the two answer different questions."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **CloudWatch** does: metrics, alarms, logs, and dashboards.
- Describe how a **CloudWatch alarm** watches a metric and triggers actions.
- Explain what **CloudTrail** records and why it's for **audit**.
- State the key difference: **CloudWatch (what's happening)** vs **CloudTrail (who did what)**.
- Set up basic observability for a workload.

# Why It Matters

Once things are running, you need to answer two questions: **"Is it healthy?"** and **"Who changed
this?"** CloudWatch answers the first with metrics and alarms; CloudTrail answers the second with a
record of every API call. Without them, failures go unnoticed and security incidents are invisible.
Observability is what turns "it's running" into "I know it's running, and I'll be told the moment it
isn't."

# Concept Explanation

### Amazon CloudWatch

**Amazon CloudWatch** is AWS's monitoring and observability service. Its main pieces:

- **Metrics** — time-series numbers about your resources (EC2 CPU utilization, network traffic, Lambda
  invocations and errors, and many more). Most AWS services publish metrics automatically, and you can
  publish **custom metrics**.
- **Alarms** — watch a metric against a **threshold** and change state to **`ALARM`**, **`OK`**, or
  **`INSUFFICIENT_DATA`**. An alarm can trigger actions: send an **SNS** notification, drive **Auto
  Scaling**, or stop/reboot an instance.
- **Logs (CloudWatch Logs)** — collect and store log data (Lambda writes here automatically; EC2/app
  logs via the CloudWatch agent), organized into **log groups** and **streams**, and queryable with
  **Logs Insights**.
- **Dashboards** — visualize metrics and alarms on shared, at-a-glance views.

```text
Metric (EC2 CPUUtilization) ──► Alarm: "> 80% for 5 minutes" ──► actions:
     ├─ notify an SNS topic (email/Slack/pager)
     ├─ trigger Auto Scaling to add instances
     └─ (or) stop/reboot the instance
```

The **billing alarm** you met earlier is just a CloudWatch alarm on the estimated-charges metric.

### AWS CloudTrail

**AWS CloudTrail** records **API activity** in your account: **who** (which identity) made **what** call
(which API), **when**, and from where. It's built for **governance, audit, and compliance** — the
paper trail of actions. It captures **management events** (control-plane actions like launching an
instance or changing a policy) by default, and optionally **data events** (high-volume object-level
actions, like individual S3 `GetObject` calls). Trails deliver these records to an **S3** bucket for
retention and analysis.

### CloudWatch vs CloudTrail

This is the distinction people most often blur:

| | CloudWatch | CloudTrail |
| --- | --- | --- |
| Question it answers | **What is happening?** (performance/health) | **Who did what?** (audit) |
| Data | Metrics, logs, alarms | A record of API calls |
| Typical use | Dashboards, alerting, auto-scaling | Security investigation, compliance |

They complement each other: CloudWatch tells you CPU spiked; CloudTrail tells you who changed the
security group that caused it. **AWS Config** is a third, related service that tracks **resource
configuration and compliance** over time.

# Key Terminology

- **Metric** — a time-series measurement of a resource (e.g., CPU utilization).
- **Alarm** — a rule that watches a metric threshold and triggers actions.
- **CloudWatch Logs** — collected log data in groups/streams, queryable with Logs Insights.
- **Dashboard** — a visual panel of metrics and alarms.
- **CloudTrail** — a record of who called which AWS API, when, for audit.
- **Management vs data events** — control-plane actions vs high-volume object-level actions.

# Options and Trade-offs

| Question | Use | Why |
| -------- | --- | --- |
| Is CPU/latency healthy? | CloudWatch metrics + alarms | Performance data with alerting and auto-scaling. |
| Who deleted that bucket? | CloudTrail | Audit record of the API call and the identity. |
| What did my app log? | CloudWatch Logs (+ Logs Insights) | Central log storage and querying. |
| Is this resource compliant over time? | AWS Config | Tracks configuration changes and compliance rules. |

# Worked Example

Setting up basic observability for a web service:

```text
1. CloudWatch metrics: watch the ALB/EC2 latency, error rate, and CPU utilization.
2. Alarm: "5xx error rate > 1% for 5 minutes" → notify an SNS topic (email/pager). 
   Another: "CPU > 70% for 10 minutes" → trigger Auto Scaling.
3. Logs: send app and access logs to CloudWatch Logs; use Logs Insights to investigate errors.
4. CloudTrail: enabled so that if a config changes unexpectedly, you can see who did it and when.
Result: you're alerted to problems automatically, and you can audit any change after the fact.
```

CloudWatch keeps the service healthy in real time; CloudTrail preserves the record for investigations.

# Real World Analogy

CloudWatch is your car's **dashboard**: gauges for speed, fuel, and engine temperature, plus a warning
light and chime when something crosses a limit (the alarm). **CloudTrail** is the car's **black box and
security-camera log**: it doesn't tell you the current speed — it records **who unlocked the car, who
started it, and when**. You want the dashboard to drive safely now, and the black box to find out what
happened later.

# Examples

## Example 1 — Basic: an alarm that pages you

A CloudWatch alarm watches a queue's age-of-oldest-message metric. When messages back up past a
threshold for a few minutes, the alarm enters `ALARM` and notifies an SNS topic that pages the on-call
engineer.

**Why this works:** alarms turn a metric crossing a line into an automatic, timely notification instead
of a problem someone stumbles on later.

## Example 2 — Real-world: investigating a change

A security group suddenly allows traffic it shouldn't. The team opens **CloudTrail** and finds the
exact `AuthorizeSecurityGroupIngress` call, the IAM identity that made it, and the timestamp — turning
a mystery into a specific accountable action.

**Why this works:** CloudTrail's API record answers "who did what, when," which metrics alone can't.

## Example 3 — Pitfall: expecting CloudWatch to say who did it

An engineer looks in CloudWatch for who deleted a resource and finds only metrics and logs, not the
actor. The "who changed it" answer lives in **CloudTrail**, not CloudWatch.

**Why this bites:** the two services answer different questions; reaching for the wrong one wastes time
during an incident.

# Common Mistakes

- **Confusing CloudWatch and CloudTrail.** Performance/health vs who-did-what audit.
- **No alarms.** Metrics without alarms mean problems are noticed late, if at all.
- **Not centralizing logs.** Scattered logs are hard to search during an incident.
- **Leaving CloudTrail off.** Without it, you can't investigate security or config changes after the
  fact.

# Best Practices

- Define **alarms** on the few metrics that signal real user impact (errors, latency, saturation) and
  route them to **SNS**.
- Send application and access **logs to CloudWatch Logs** and learn **Logs Insights** queries.
- Keep **CloudTrail enabled** (delivering to a secured S3 bucket) for a durable audit trail.
- Build a **dashboard** for the service's key signals so health is visible at a glance.

# Summary

- **CloudWatch** provides **metrics, alarms, logs, and dashboards** — it answers **"what is
  happening?"** and can trigger notifications and auto-scaling.
- A **CloudWatch alarm** watches a metric threshold and moves between `OK`/`ALARM`/`INSUFFICIENT_DATA`,
  firing actions like SNS notifications.
- **CloudTrail** records **who called which API, when** — it answers **"who did what?"** for audit and
  compliance, delivering to S3.
- Use **both**: CloudWatch for health and alerting, CloudTrail for accountability and investigation.

# Flash Cards

Q: What are the main components of Amazon CloudWatch?
A: Metrics (time-series measurements), alarms (threshold rules that trigger actions), logs (collected log data), and dashboards (visualizations).

Q: What does a CloudWatch alarm do?
A: It watches a metric against a threshold, changing between OK, ALARM, and INSUFFICIENT_DATA, and can trigger actions like sending an SNS notification or driving Auto Scaling.

Q: What does AWS CloudTrail record, and what is it for?
A: It records who made which API call, when, and from where — a governance/audit/compliance trail delivered to S3.

Q: What is the key difference between CloudWatch and CloudTrail?
A: CloudWatch tells you what is happening (performance, health, logs); CloudTrail tells you who did what (an audit record of API calls).

Q: Where would you look to find who deleted an AWS resource?
A: CloudTrail — it records the API call, the identity that made it, and the timestamp; CloudWatch shows metrics and logs, not the actor.

Q: What is the billing alarm from earlier lessons, technically?
A: A CloudWatch alarm set on the estimated-charges metric that notifies you when spending crosses a threshold.

# Exercises

### Easy
For each question, name CloudWatch or CloudTrail: (a) "Is CPU too high right now?" (b) "Who changed
this security group yesterday?"

### Medium
Design one CloudWatch alarm for a web service: which metric, what threshold and duration, and what
action it triggers — and justify each choice.

### Challenging
An unexpected charge and a config change happened overnight. Describe how you'd use CloudWatch and
CloudTrail together to (a) confirm the impact and (b) identify who made the change, and note what you'd
set up in advance so this is easy next time.

# Further Reading

- AWS — *What is Amazon CloudWatch?*: <https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html>
- AWS — *Using CloudWatch alarms*: <https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html>
- AWS — *What is AWS CloudTrail?*: <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html>
- AWS — *CloudWatch Logs*: <https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html>
