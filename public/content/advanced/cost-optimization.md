---
id: lesson-22
slug: cost-optimization
title: "Cost Optimization on AWS"
level: advanced
order: 22
duration: 20
tags:
  - cost-optimization
  - savings-plans
  - right-sizing
  - data-transfer
  - finops
summary: "Getting the most value per dollar on AWS — how pricing works, the big levers (right-sizing, Savings Plans and Spot, turning off idle resources, storage classes, and data-transfer awareness), and the tools that measure and attribute spend so optimization is continuous."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain the **pricing fundamentals** and what you actually pay for.
- Apply the main **cost levers**: right-sizing, purchasing options, and elasticity.
- Avoid common **cost surprises**, especially **data transfer** and idle resources.
- Use **cost tools**: Cost Explorer, Budgets, Compute Optimizer, and tags.
- Adopt a **continuous** optimization mindset (measure, attribute, improve).

# Why It Matters

Pay-as-you-go is powerful but unforgiving: idle and oversized resources quietly bleed money, and
surprises like data-transfer charges catch teams off guard. Cost optimization isn't a one-time cleanup
— it's an ongoing discipline of matching spend to value. Done well, it frees budget for real work;
ignored, it turns the cloud's flexibility into waste.

# Concept Explanation

### How AWS pricing works

The broad principles (AWS's own framing):

- **Pay as you go** — pay for what you use, no large upfront cost by default.
- **Pay less when you commit** — Savings Plans / Reserved Instances discount steady usage for a 1- or
  3-year commitment.
- **Pay less as you use more** — volume-based tiering for some services (e.g., S3).
- **Prices decrease over time** as AWS realizes economies of scale.

You generally pay for **compute** (per second/hour), **storage** (per GB), **requests**, and **data
transfer** — and crucially, **inbound data transfer is generally free while outbound to the internet
and cross-Region transfer cost money**.

### The cost levers

- **Right-sizing** — match instance/resource size to **actual** usage (use CloudWatch metrics and
  **AWS Compute Optimizer** for recommendations). Oversized resources are the most common waste.
- **Purchasing options** — **Savings Plans / Reserved Instances** for steady baseline load; **Spot**
  for interruptible work; **On-Demand** for the unpredictable remainder.
- **Elasticity** — scale down and **turn off idle resources** (e.g., stop dev/test environments nights
  and weekends). You can't pay-as-you-go your way to savings if everything runs 24/7.
- **Storage optimization** — use **S3 storage classes + lifecycle rules**, delete **unused EBS
  volumes/snapshots**, and release **unattached Elastic IPs** (which are billed when idle).
- **Data-transfer awareness** — serve via **CloudFront** (cheaper egress + caching), keep chatty
  traffic within an AZ/Region where sensible, and use **VPC endpoints** to avoid NAT gateway data
  charges.
- **Managed/serverless** — pay only for use and cut operational cost, often lowering total spend.

### The cost tools

- **AWS Cost Explorer** — visualize and **forecast** spend, break it down by service/tag.
- **AWS Budgets** — set thresholds and get **alerts** (cost, usage, or Savings Plans coverage).
- **AWS Cost and Usage Report (CUR)** — the most detailed line-item data for deep analysis.
- **AWS Compute Optimizer** — right-sizing recommendations from actual utilization.
- **Cost allocation tags** — label resources (`team`, `env`, `project`) so spend can be **attributed**.
- **AWS Organizations** — **consolidated billing** pools usage for volume discounts across accounts.

# Key Terminology

- **Pay-as-you-go** — paying only for resources you use, no default upfront cost.
- **Right-sizing** — matching resource size to actual usage to cut waste.
- **Savings Plans / Reserved Instances** — commitments that discount steady usage.
- **Data transfer costs** — charges for outbound/cross-Region traffic (inbound is generally free).
- **Cost allocation tags** — labels that attribute spend to teams/projects.
- **Cost Explorer / Budgets / Compute Optimizer** — analyze / alert / right-size tools.

# Options and Trade-offs

| Lever | Option A | Option B | How to choose |
| ----- | -------- | -------- | ------------- |
| Steady compute | On-Demand | Savings Plan / Reserved | Commit for a discount when usage is predictable and constant. |
| Bursty/flexible compute | On-Demand | Spot | Spot for interruptible work; big savings with retry-tolerant jobs. |
| Cold data | Keep in S3 Standard | Lifecycle to IA/Glacier | Move rarely accessed data to cheaper classes automatically. |
| Egress-heavy app | Serve from origin | Serve via CloudFront | CloudFront reduces egress cost and origin load for global delivery. |

# Worked Example

A monthly cost review that finds real savings:

```text
1. Open Cost Explorer, group by service and by tag → spot the biggest and most surprising line items.
2. Compute: Compute Optimizer flags several oversized instances → right-size them.
3. Steady baseline of always-on servers → cover with a Savings Plan; move batch jobs to Spot.
4. Dev/test environments running 24/7 → schedule them off nights and weekends.
5. Storage: add S3 lifecycle rules; delete old snapshots and unattached EBS volumes; release idle EIPs.
6. Data transfer: a chatty cross-AZ pattern and NAT egress → add a VPC endpoint and front assets with CloudFront.
7. Set a Budget alert so next month's spend can't drift unseen.
```

None of these change what the app does — they remove waste and match spend to value.

# Real World Analogy

Cost optimization is like managing your **household utility bills**. You **turn off lights in empty
rooms** (stop idle instances), buy **appliances sized to your needs** (right-size), switch to a
**cheaper fixed-rate plan** if your usage is steady (Savings Plans), run flexible chores at **off-peak
rates** (Spot), **insulate** to stop waste (storage lifecycle and cleanup), and actually **read the
meter and the statement** each month to catch a leak (Cost Explorer and Budgets). The house works the
same either way — you just stop paying for waste.

# Examples

## Example 1 — Basic: the idle instance

A `large` instance sits at 5% CPU all month. Compute Optimizer recommends a much smaller size (or it can
be turned off outside business hours). Right-sizing it cuts its cost substantially with no impact on the
workload.

**Why this works:** oversized, under-utilized resources are the most common and easily fixed waste.

## Example 2 — Real-world: the data-transfer surprise

An app's bill spikes not from compute but from **outbound data transfer** to the internet. Serving
static content through **CloudFront** (cheaper egress, cached at the edge) and adding a **VPC endpoint**
to avoid NAT data charges brings it down.

**Why this works:** data transfer is a real, often-overlooked cost; routing it more cheaply targets the
actual driver.

## Example 3 — Pitfall: committing before understanding usage

A team buys a large 3-year Reserved commitment before their usage stabilizes, then their architecture
changes and the commitment no longer fits — locking in spend they can't fully use.

**Why this bites:** commitments save money **only** for stable, predictable usage; commit after you
understand the baseline, and size it conservatively.

# Common Mistakes

- **Leaving resources idle or oversized.** Right-size and turn off what's not in use.
- **Ignoring data-transfer costs.** Outbound/cross-Region transfer adds up; design for it.
- **Forgetting cleanup.** Unattached EBS volumes, old snapshots, and idle Elastic IPs still bill.
- **Committing too early.** Buy Savings Plans/RIs once usage is understood and stable.

# Best Practices

- **Right-size** with Compute Optimizer and CloudWatch; **turn off** idle (especially non-prod)
  resources.
- Cover steady load with **Savings Plans**, use **Spot** for interruptible work, keep **On-Demand** for
  the unpredictable.
- Optimize **storage** (classes, lifecycle, cleanup) and **data transfer** (CloudFront, VPC endpoints).
- **Tag** resources, watch **Cost Explorer**, and set **Budgets** so optimization is continuous, not a
  one-off.

# Summary

- AWS pricing is **pay-as-you-go**, with discounts for **commitment** and **volume**; you pay for
  compute, storage, requests, and **data transfer** (inbound generally free, **outbound/cross-Region
  costs**).
- The big levers are **right-sizing**, **purchasing options** (Savings Plans/Spot), **turning off idle**
  resources, **storage optimization**, and **data-transfer awareness**.
- Tools — **Cost Explorer, Budgets, Compute Optimizer, tags, and consolidated billing** — let you
  **measure, attribute, and improve** spend.
- Optimization is **continuous**: review regularly and commit only once usage is stable.

# Flash Cards

Q: What are AWS's broad pricing principles?
A: Pay as you go, pay less when you commit (Savings Plans/RIs), pay less as you use more (volume tiers), and prices decrease over time as AWS scales.

Q: Which direction of data transfer usually costs money?
A: Outbound data transfer to the internet and cross-Region (and some cross-AZ) transfer cost money; inbound data transfer is generally free.

Q: What is right-sizing, and how do you do it?
A: Matching a resource's size to its actual usage to cut waste, guided by CloudWatch metrics and AWS Compute Optimizer recommendations.

Q: Name three quick cost-cleanup actions people often miss.
A: Delete unattached EBS volumes and old snapshots, release idle (unassociated) Elastic IPs, and turn off non-production environments outside business hours.

Q: Which tool visualizes and forecasts your spend, and which one alerts you?
A: Cost Explorer visualizes and forecasts spend; AWS Budgets sends alerts when cost or usage crosses a threshold.

Q: Why commit to Savings Plans only after understanding usage?
A: Commitments save money only for stable, predictable usage; committing before the baseline is clear risks locking in spend you can't fully use if the architecture changes.

# Exercises

### Easy
List three things that still cost money even when you think a resource is "off" (hint: storage and
addresses).

### Medium
Explain how right-sizing and turning off idle resources both cut cost, and how you'd identify
candidates for each.

### Challenging
You're given a bill dominated by compute and data transfer. Describe a step-by-step optimization plan:
which tools you'd use to investigate, which levers you'd pull for each cost driver, and how you'd
prevent the spend from drifting back up.

# Further Reading

- AWS Well-Architected — *Cost Optimization pillar*: <https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html>
- AWS — *AWS Pricing*: <https://aws.amazon.com/pricing/>
- AWS — *AWS Cost Explorer*: <https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html>
- AWS — *AWS Compute Optimizer*: <https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html>
