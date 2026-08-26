---
id: lesson-19
slug: high-availability-and-dr
title: "High Availability, Fault Tolerance, and DR"
level: advanced
order: 19
duration: 21
tags:
  - high-availability
  - disaster-recovery
  - rto-rpo
  - multi-az
  - resilience
summary: "Designing systems that survive failure — high availability across Availability Zones by removing single points of failure, the meaning of RTO and RPO, and the four disaster-recovery strategies (backup and restore, pilot light, warm standby, multi-site) that trade cost against recovery speed."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define **high availability**, **fault tolerance**, and **redundancy**.
- Explain how **multi-AZ** design removes single points of failure.
- Define **RTO** and **RPO** and why they drive DR decisions.
- Compare the **four DR strategies** by cost and recovery speed.
- Choose a resilience approach that matches a workload's requirements.

# Why It Matters

Failure isn't an if — it's a when. Hardware dies, AZs have outages, and rarely, whole Regions are
impaired. **High availability** keeps your app running through everyday failures, and **disaster
recovery** is your plan for the big ones. Choosing the right level (and knowing your RTO/RPO) means you
neither suffer avoidable downtime nor overspend on protection you don't need.

# Concept Explanation

### Availability, fault tolerance, redundancy

- **Availability** is the share of time a system is operational (often stated as "nines" — 99.9%,
  99.99%, …).
- **Redundancy** means having **more than one** of a component so the loss of one doesn't stop the
  system.
- **High availability (HA)** designs **remove single points of failure** so the system keeps working
  through failures, usually with brief automated recovery.
- **Fault tolerance** is a higher bar: continuing with **no interruption at all** when a component
  fails.

### HA through multiple AZs

The core AWS HA pattern is **spreading across Availability Zones**, because AZs fail independently:

- Run instances in **multiple AZs** behind an **Elastic Load Balancer**, managed by an **Auto Scaling
  group** that replaces failures.
- Use **Multi-AZ** databases (like RDS Multi-AZ) for automatic failover.
- Let **health checks** route traffic away from unhealthy targets.

That removes any single server or single AZ as a point of failure — HA lives **within a Region, across
its AZs**.

### RTO and RPO

Disaster recovery is measured by two objectives:

- **RTO (Recovery Time Objective)** — the **maximum acceptable downtime**: how long recovery may take.
- **RPO (Recovery Point Objective)** — the **maximum acceptable data loss**, measured as time: how far
  back the last usable copy may be.

```text
        last backup/replication            disaster            recovered
   ──────────┼───────────────────────────────┼──────────────────┼─────►
             │◄──────────  RPO  ─────────────►│◄─────  RTO  ─────►│
             (data you might lose)            (downtime you accept)
```

Tighter RTO/RPO cost more. You set them from business need, then choose a strategy that meets them.

### The four DR strategies

AWS describes four approaches, from cheapest/slowest to costliest/fastest:

| Strategy | What runs in the DR Region | RTO/RPO | Cost |
| -------- | -------------------------- | ------- | ---- |
| **Backup & Restore** | Nothing until needed; restore from backups | Highest (hours+) | Lowest |
| **Pilot Light** | Core data replicated, minimal services idle | Lower | Low–moderate |
| **Warm Standby** | A scaled-down but working copy always on | Low | Moderate–high |
| **Multi-Site Active/Active** | Full production in multiple Regions at once | Near zero | Highest |

Underlying techniques include **cross-Region replication** (S3 CRR, RDS cross-Region snapshots/read
replicas, **DynamoDB global tables**), **backups**, and **Route 53 failover** to redirect traffic.

# Key Terminology

- **High availability** — staying operational through failures by removing single points of failure.
- **Fault tolerance** — continuing with no interruption when a component fails (a higher bar).
- **Redundancy** — having multiple copies of a component.
- **RTO** — maximum acceptable downtime during recovery.
- **RPO** — maximum acceptable data loss, in time.
- **DR strategies** — backup & restore, pilot light, warm standby, multi-site active/active.

# Options and Trade-offs

| Requirement | Fits | Why |
| ----------- | ---- | --- |
| Survive an AZ outage | Multi-AZ HA (ELB + ASG + Multi-AZ DB) | Removes single-AZ failure within a Region. |
| Cheap DR, can tolerate hours of downtime | Backup & Restore | Lowest cost; restore when needed. |
| Fast DR without full duplicate cost | Pilot Light / Warm Standby | Core (or scaled-down) always ready; scale up on failover. |
| Near-zero downtime across Regions | Multi-Site Active/Active | Full redundancy, highest cost/complexity. |

# Worked Example

Matching resilience to two different apps:

```text
App A — an internal tool; a few hours of downtime is acceptable, minor data loss tolerable:
   HA: run across two AZs behind an ALB + ASG.
   DR: Backup & Restore — nightly backups (and IaC templates) to restore in another Region if needed.
   RTO ~ hours, RPO ~ a day. Low cost.

App B — a revenue-critical service; minutes of downtime and seconds of data loss are the limit:
   HA: multi-AZ everything, Multi-AZ database.
   DR: Warm Standby or Active/Active in a second Region, with continuous replication and Route 53 failover.
   RTO ~ minutes, RPO ~ seconds. Higher cost, justified by the stakes.
```

The requirements (RTO/RPO and budget) pick the strategy — not the other way around.

# Real World Analogy

**High availability** is a plane with **multiple engines**: if one fails mid-flight, the others keep it
flying — no single engine is a point of failure. **Disaster recovery** is your plan for a much bigger
event, like your home airport becoming unusable. **RTO** is how quickly you can be flying again; **RPO**
is how much cargo you're willing to lose. The four strategies are how ready your backup airport is:
blueprints locked in a safe (backup & restore), a skeleton crew on standby (pilot light), a small but
running airport (warm standby), or two fully operational airports at once (active/active).

# Examples

## Example 1 — Basic: no single point of failure

A web tier runs one instance per AZ across two AZs behind a load balancer. When one AZ has an outage,
the load balancer serves users from the other AZ. There's no single server or AZ whose loss stops the
app.

**Why this works:** redundancy across independent AZs is exactly what removes the single point of
failure that HA targets.

## Example 2 — Real-world: choosing DR by RTO/RPO

A team must recover within 15 minutes with under a minute of data loss. Backup & Restore (hours) can't
meet it, so they choose **Warm Standby** with continuous cross-Region replication and Route 53 failover.

**Why this works:** the RTO/RPO targets rule out the cheaper, slower strategies and point to a
continuously-ready one.

## Example 3 — Pitfall: confusing HA with DR

A team runs Multi-AZ within one Region and assumes they're protected from a Region-wide problem. They
aren't — HA across AZs doesn't cover a whole-Region event; that needs a **cross-Region DR** plan.

**Why this bites:** HA (across AZs) and DR (across Regions) address different blast radii; one doesn't
substitute for the other.

# Common Mistakes

- **Single-AZ production.** One AZ is a single point of failure — spread across AZs.
- **Confusing HA with DR.** Multi-AZ HA doesn't protect against a Region-wide disaster.
- **Not defining RTO/RPO.** Without targets you can't choose (or justify) a DR strategy.
- **Over- or under-investing.** Match the strategy to the stakes; active/active is overkill for a
  low-criticality tool.

# Best Practices

- Build HA by **removing single points of failure**: multi-AZ, load balancing, auto scaling, Multi-AZ
  databases, health checks.
- **Define RTO and RPO** from business need before choosing a DR strategy.
- Pick the **cheapest DR strategy that meets** your RTO/RPO; use replication and Route 53 failover.
- **Test recovery** regularly — an untested DR plan is a guess.

# Summary

- **High availability** removes single points of failure, typically by spreading across **multiple AZs**
  with load balancing, auto scaling, and Multi-AZ databases; **fault tolerance** is the stricter
  no-interruption bar.
- **RTO** (acceptable downtime) and **RPO** (acceptable data loss) quantify your recovery needs.
- The four DR strategies — **backup & restore, pilot light, warm standby, multi-site active/active** —
  trade **cost** against **recovery speed**.
- **HA is within a Region (across AZs); DR spans Regions** — they solve different problems, so pick by
  requirements and **test** the plan.

# Flash Cards

Q: What is high availability, and how is it usually achieved on AWS?
A: Keeping a system operational through failures by removing single points of failure — typically by spreading across multiple Availability Zones with load balancing, auto scaling, Multi-AZ databases, and health checks.

Q: What is the difference between RTO and RPO?
A: RTO is the maximum acceptable downtime during recovery; RPO is the maximum acceptable data loss measured as time (how far back the last usable copy may be).

Q: Name the four DR strategies from cheapest/slowest to costliest/fastest.
A: Backup & Restore, Pilot Light, Warm Standby, and Multi-Site Active/Active.

Q: How does high availability differ from disaster recovery?
A: HA keeps you running through everyday failures within a Region (across AZs); DR is the plan for larger disasters such as a Region-wide failure, usually spanning Regions.

Q: Why isn't Multi-AZ enough to protect against a Region-wide outage?
A: Multi-AZ HA covers failures within one Region; a whole-Region event requires a cross-Region DR strategy with replication and failover.

Q: What is fault tolerance, compared with high availability?
A: Fault tolerance is continuing with no interruption at all when a component fails — a stricter bar than high availability, which allows brief automated recovery.

# Exercises

### Easy
Define RTO and RPO in one sentence each, and say which one is about downtime and which is about data
loss.

### Medium
Explain why running a production app in a single Availability Zone is risky, and describe the minimal
changes to make it highly available.

### Challenging
For a revenue-critical service that can tolerate only minutes of downtime and seconds of data loss,
choose a DR strategy, justify it against the four options, and name the AWS techniques (replication,
DNS failover) you'd use — plus how you'd verify it works.

# Further Reading

- AWS Well-Architected — *Reliability pillar*: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html>
- AWS — *Disaster recovery options in the cloud*: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
- AWS — *RDS Multi-AZ deployments*: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
- AWS — *Amazon Route 53 health checks and failover*: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html>
