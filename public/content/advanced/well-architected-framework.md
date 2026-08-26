---
id: lesson-21
slug: well-architected-framework
title: "The AWS Well-Architected Framework"
level: advanced
order: 21
duration: 20
tags:
  - well-architected
  - pillars
  - best-practices
  - architecture
  - trade-offs
summary: "AWS's framework of best practices for building good cloud systems — its six pillars (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability), the general design principles behind them, and how to weigh trade-offs between pillars."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what the **Well-Architected Framework** is and how it's used.
- Name and summarize the **six pillars**.
- State the **general design principles** the framework promotes.
- Recognize **trade-offs** between pillars and how business priorities resolve them.
- Use the **Well-Architected Tool** idea to review a workload.

# Why It Matters

"It works" is not the same as "it's well built." A system can run today and still be insecure, fragile,
wasteful, or expensive. The **Well-Architected Framework** distills AWS's accumulated best practices
into a checklist you can review any workload against, catching weaknesses before they become outages or
bills. This lesson also ties together everything the course has covered — each pillar draws on earlier
services.

# Concept Explanation

### What the framework is

The **AWS Well-Architected Framework** is a set of **best practices and design principles** for building
secure, reliable, efficient, cost-effective, and sustainable systems on AWS. It's organized into
**pillars**, each with **questions** you answer about a workload to find gaps. It's guidance, not a
product — though the **AWS Well-Architected Tool** helps you run reviews.

### The six pillars

There are **six** pillars (Sustainability was added in 2021; the framework previously had five):

1. **Operational Excellence** — run and monitor systems to deliver value, and **continuously improve**.
   Practices: infrastructure as code, small frequent reversible changes, observability, and learning
   from failures.
2. **Security** — protect data, systems, and assets. Practices: strong **identity** (least privilege),
   traceability, **encryption** at rest and in transit, and prepared incident response.
3. **Reliability** — a workload performs its function **correctly and consistently** and **recovers**
   from failure. Practices: manage service quotas, automatic recovery, **horizontal scaling**, and
   testing recovery.
4. **Performance Efficiency** — use computing resources **efficiently** and keep doing so as demand and
   technology change. Practices: pick the right resource types/sizes, use serverless where it fits, and
   **experiment**.
5. **Cost Optimization** — avoid unnecessary cost and **get the most value** per dollar. Practices:
   **right-size**, use pay-as-you-go and managed services, and **measure and attribute** spend.
6. **Sustainability** — minimize the **environmental impact** of running workloads. Practices: maximize
   utilization, choose efficient options (including managed/serverless), and reduce waste.

```text
   Operational Excellence · Security · Reliability
   Performance Efficiency · Cost Optimization · Sustainability
   ── six lenses to review any workload; each has best-practice questions ──
```

### General design principles

Across the pillars, the framework encourages you to:

- **Stop guessing capacity** — scale with demand instead of over-provisioning.
- **Test at production scale**, then tear the test environment down.
- **Automate** to make architectural experimentation easier and changes safer.
- Allow **evolutionary architectures** — designs that can change over time.
- **Drive decisions with data**, and run **game days** to practice failure.

### Trade-offs between pillars

The pillars sometimes pull against each other: more **reliability** (extra redundancy) can raise
**cost**; stronger **performance** might increase spend. Well-architected doesn't mean maxing every
pillar — it means making **deliberate trade-offs** aligned to **business priorities**, and knowing
which you chose and why.

# Key Terminology

- **Well-Architected Framework** — AWS's best-practice guidance organized into pillars.
- **Pillar** — one dimension of a good architecture (six in total).
- **Well-Architected Tool** — an AWS tool to review workloads against the pillars.
- **Design principle** — a cross-cutting practice (automate, stop guessing capacity, …).
- **Trade-off** — a deliberate balance between pillars driven by business priorities.

# Options and Trade-offs

| Tension | Pillar A | Pillar B | How to resolve |
| ------- | -------- | -------- | -------------- |
| Redundancy vs spend | Reliability | Cost Optimization | Add redundancy to the level the business's RTO/RPO justifies — no more. |
| Speed vs spend | Performance Efficiency | Cost Optimization | Right-size and use managed/serverless to get performance without waste. |
| Fast delivery vs safety | Operational Excellence | Security | Automate guardrails so speed doesn't sacrifice security. |
| Utilization vs headroom | Sustainability | Reliability | Maximize utilization while keeping enough headroom for failover. |

# Worked Example

Reviewing a web app against the pillars (a mini Well-Architected review):

```text
Operational Excellence: Is it deployed via IaC with monitoring and alarms?         → CloudFormation + CloudWatch
Security:               Least-privilege IAM? Encryption at rest and in transit?     → IAM roles, KMS, TLS
Reliability:            Multi-AZ, auto scaling, tested recovery, defined RTO/RPO?    → ELB + ASG + Multi-AZ RDS
Performance Efficiency: Right-sized instances? Serverless where it fits? CDN?        → CloudFront, right-sizing
Cost Optimization:      Right-sized, Savings Plans/Spot, budgets, tagging?           → Budgets + Savings Plans
Sustainability:         High utilization? Managed/serverless to reduce waste?        → serverless where possible
```

Each unanswered or weak item is a concrete improvement — and you decide which to prioritize based on
the business.

# Real World Analogy

The Well-Architected Framework is like a **building inspection checklist**. A house can be lived in and
still fail inspection: the inspector separately checks the **structure** (reliability), **safety/locks**
(security), **wiring and insulation efficiency** (performance and cost), **maintainability**
(operational excellence), and **environmental footprint** (sustainability). Passing means it's sound
across **all** dimensions — and where two goals conflict (a bigger boiler vs the energy bill), you make
a **deliberate** choice, not an accidental one.

# Examples

## Example 1 — Basic: naming the pillars

Asked to list the pillars, you give all six: Operational Excellence, Security, Reliability, Performance
Efficiency, Cost Optimization, and Sustainability — not five (Sustainability is the one people forget).

**Why this works:** knowing there are six, and that Sustainability was added, is a common
point of confusion the framework expects you to get right.

## Example 2 — Real-world: a review finds a gap

A team runs a Well-Architected review and discovers their app has no defined RTO/RPO and runs in a
single AZ — a **Reliability** gap. They add multi-AZ and a DR plan, closing a real risk before it
caused an outage.

**Why this works:** the pillar's questions surface weaknesses that "it works today" hides.

## Example 3 — Pitfall: maximizing one pillar blindly

A team gold-plates **Reliability** with full active/active multi-Region for a low-criticality internal
tool, blowing the budget. Well-architected means **balancing** pillars to business need, not maxing one.

**Why this bites:** ignoring trade-offs turns a virtue (reliability) into waste (cost); the framework is
about deliberate balance.

# Common Mistakes

- **Miscounting the pillars.** There are **six** — don't forget **Sustainability**.
- **Treating "it works" as "well-architected."** Working says nothing about security, cost, or
  resilience.
- **Maxing one pillar.** Balance them against business priorities; every pillar has trade-offs.
- **Reviewing once and forgetting.** Re-review as the workload and requirements evolve.

# Best Practices

- Run **Well-Architected reviews** periodically, using the pillar questions to find gaps.
- Apply the **design principles**: automate, stop guessing capacity, test at scale, drive with data.
- Make **trade-offs explicit** and tie them to business priorities (RTO/RPO, budget, latency).
- Use earlier course skills as the toolkit: **IaC, IAM/KMS, multi-AZ, CloudWatch, budgets, serverless**.

# Summary

- The **Well-Architected Framework** is AWS's best-practice guidance, organized into pillars with
  review questions.
- There are **six pillars**: **Operational Excellence, Security, Reliability, Performance Efficiency,
  Cost Optimization, and Sustainability** (the last added in 2021).
- **Design principles** include stop guessing capacity, automate, test at production scale, and drive
  with data.
- Being well-architected means making **deliberate trade-offs** between pillars aligned to **business
  priorities** — not maximizing any single one.

# Flash Cards

Q: What is the AWS Well-Architected Framework?
A: A set of AWS best practices and design principles, organized into pillars with review questions, for building secure, reliable, efficient, cost-effective, and sustainable systems.

Q: How many pillars are there, and what are they?
A: Six — Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability (Sustainability was added in 2021).

Q: Which pillar is most often forgotten, and when was it added?
A: Sustainability — it was added in 2021, bringing the framework from five pillars to six.

Q: Give one general design principle the framework promotes.
A: Stop guessing capacity (scale with demand instead of over-provisioning); others include automate, test at production scale, and drive decisions with data.

Q: Does being well-architected mean maximizing every pillar?
A: No — it means making deliberate trade-offs between pillars aligned to business priorities (for example, balancing reliability against cost).

Q: Which pillar covers least-privilege IAM and encryption?
A: The Security pillar — protecting data, systems, and assets through identity, traceability, and data protection.

# Exercises

### Easy
List all six pillars of the Well-Architected Framework from memory.

### Medium
Pick any app you know and write one review question for three different pillars, then answer whether
the app would pass.

### Challenging
For a modest internal tool, describe how you'd balance the Reliability and Cost Optimization pillars:
what level of redundancy you'd choose, why, and how business priorities (its criticality) drive the
trade-off.

# Further Reading

- AWS — *AWS Well-Architected Framework*: <https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html>
- AWS — *The pillars of the framework*: <https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html>
- AWS — *Sustainability pillar*: <https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html>
- AWS — *AWS Well-Architected Tool*: <https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html>
