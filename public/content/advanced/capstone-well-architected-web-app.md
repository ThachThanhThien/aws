---
id: lesson-24
slug: capstone-well-architected-web-app
title: "Capstone: Architecting a Well-Architected Web Application"
level: advanced
order: 24
duration: 24
tags:
  - capstone
  - architecture
  - well-architected
  - high-availability
  - end-to-end
summary: "A synthesis of the whole course — designing a secure, highly available, scalable, and cost-effective three-tier web application on AWS, tracing a request end to end and mapping every design choice to the six Well-Architected pillars."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Assemble a **three-tier web application** from the services learned in this course.
- Trace a **request end to end** through DNS, CDN, load balancer, app, and data tiers.
- Map each design choice to a **Well-Architected pillar**.
- Explain how the design achieves **high availability, security, and elasticity**.
- Critique a naive design and improve it.

# Why It Matters

This is where it all comes together. Individually, EC2, S3, VPC, IAM, RDS, CloudWatch, and the rest are
just services; the skill is **combining** them into a system that is secure, stays up, scales with
demand, and doesn't waste money. This capstone builds that reference architecture and shows how each
earlier lesson is a piece of the whole — the mental model you'll reuse on real projects.

# Concept Explanation

### The reference architecture

A classic **three-tier** web app — web/CDN, application, and data — built for production:

```text
        Users
          │  (HTTPS)
          ▼
   Route 53  ── DNS, health-check failover
          │
          ▼
   CloudFront  ── CDN cache at the edge, TLS, AWS WAF/Shield
          │  (dynamic requests)
          ▼
   ┌──────────────────────── VPC (Region) ─────────────────────────┐
   │  Public subnets  (AZ-a, AZ-b):   Application Load Balancer     │
   │        │                                                        │
   │        ▼                                                        │
   │  Private subnets (AZ-a, AZ-b):   App tier — EC2 in an Auto      │
   │        │        Scaling group (or ECS/Fargate), stateless      │
   │        ▼                                                        │
   │  Private subnets (AZ-a, AZ-b):   Data tier — RDS (Multi-AZ)    │
   │                 and/or DynamoDB;  ElastiCache for sessions      │
   └────────────────────────────────────────────────────────────────┘
   S3 ── static assets + backups (served via CloudFront)
   Async ── SQS/SNS + Lambda for background jobs (email, image processing)
   Cross-cutting: IAM roles · KMS · Secrets Manager · CloudWatch · CloudTrail · GuardDuty · Budgets · CloudFormation
```

### Tracing a request

1. A user's browser resolves your domain via **Route 53**, which returns the **CloudFront**
   distribution (an alias record) and can fail over between Regions.
2. **CloudFront** serves cached static content from the nearest **edge**; dynamic requests go on, over
   **TLS**, filtered by **AWS WAF**.
3. The request reaches the **Application Load Balancer** in the **public subnets**, spread across AZs.
4. The ALB routes to a healthy **app server** in a **private subnet**, part of an **Auto Scaling
   group** across AZs; servers are **stateless**, so any can serve any request.
5. The app reads/writes the **data tier** in private subnets — **RDS Multi-AZ** for relational data,
   **DynamoDB** for key-based data, **ElastiCache** for sessions/cache — using an **IAM role** (no
   stored keys) and a database credential from **Secrets Manager**.
6. Background work (emails, thumbnails) is queued to **SQS**/**SNS** and processed by **Lambda**, so the
   request returns fast.
7. **CloudWatch** watches metrics/logs and **alarms**; **CloudTrail** records API calls; **GuardDuty**
   watches for threats; a **Budget** guards spend. The whole stack is defined in **CloudFormation**.

### Mapping to the six pillars

| Pillar | How this design satisfies it |
| ------ | ---------------------------- |
| **Operational Excellence** | Everything in **CloudFormation** (IaC); **CloudWatch** dashboards/alarms; repeatable deploys. |
| **Security** | Least-privilege **IAM roles**, **private subnets** + security groups, **KMS** at rest, **TLS** in transit, **Secrets Manager**, **WAF/GuardDuty**; and you still patch the EC2 OS (shared responsibility). |
| **Reliability** | **Multi-AZ** everywhere, **ELB + ASG** self-healing, **RDS Multi-AZ** failover, backups, defined **RTO/RPO**, a DR plan. |
| **Performance Efficiency** | **CloudFront** caching, **right-sized** instances, **ElastiCache**/DynamoDB, auto scaling, serverless for async. |
| **Cost Optimization** | **Savings Plans**/Spot, right-sizing, **S3 lifecycle**, **Budgets**, non-prod turned off. |
| **Sustainability** | High utilization via **auto scaling**, **managed/serverless** services, no idle waste. |

# Key Terminology

- **Three-tier architecture** — web/CDN, application, and data tiers, separated for scale and security.
- **Stateless app tier** — servers hold no session state, so any instance serves any request.
- **Reference architecture** — a proven blueprint you adapt to a specific workload.
- **End-to-end request flow** — the path from DNS through CDN, load balancer, app, to data.
- **Cross-cutting concerns** — security, monitoring, IaC, and cost that span every tier.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| App tier compute | EC2 + Auto Scaling | ECS/Fargate or Lambda | Match to the workload — VMs for control, containers/serverless for less ops. |
| Primary data store | RDS (relational) | DynamoDB (NoSQL) | Relational for related, query-rich data; DynamoDB for key-based scale (often both). |
| Session state | Sticky sessions on instances | ElastiCache / DynamoDB | Externalize state so the tier stays stateless and can scale/heal. |
| DR level | Backup & restore | Warm standby / active-active | Choose by RTO/RPO and the app's business criticality. |

# Worked Example

Designing for a launch-day traffic spike and an AZ failure, at once:

```text
Spike:      CloudFront absorbs static load at the edge; the Auto Scaling group adds app servers across
            AZs via target tracking; DynamoDB/ElastiCache handle read-heavy paths; SQS buffers async work.
AZ failure: The ALB routes only to healthy servers in the surviving AZ; RDS Multi-AZ fails over to its
            standby; the ASG launches replacements in the healthy AZ. Users barely notice.
Security:   All traffic is TLS; data is KMS-encrypted at rest; the DB password comes from Secrets Manager;
            IAM roles grant least privilege; WAF and GuardDuty are active.
Cost:       Steady baseline on a Savings Plan, bursts on On-Demand/Spot, S3 lifecycle on old assets,
            a Budget alarm guarding the month.
```

Every one of those behaviors comes from a specific earlier lesson — combined, they make the app
well-architected.

# Real World Analogy

Architecting this app is like **planning a well-run city**. Roads and traffic control move people
(VPC, load balancing, Route 53); power and water are the utilities (compute and storage); police,
locks, and permits keep it safe (IAM, security groups, KMS); hospitals and backup generators handle
emergencies (Multi-AZ, DR); the city budget prevents overspending (Budgets, right-sizing); and
efficient, green infrastructure avoids waste (auto scaling, serverless). No single system makes a
city — it's the **coordination** of many, planned deliberately, exactly like a well-architected system.

# Examples

## Example 1 — Basic: the request's journey

A page load resolves through Route 53, is served (mostly) from a CloudFront edge, and its dynamic parts
travel over TLS to the ALB, to a stateless app server, to the database — then background email is queued
to SQS so the response returns immediately.

**Why this works:** each tier does one job and hands off cleanly, which is what makes the system
scalable and observable.

## Example 2 — Real-world: surviving failure invisibly

During an AZ outage, health checks pull the failed AZ's servers from the ALB, RDS fails over to its
standby, and the Auto Scaling group rebuilds capacity in the healthy AZ. The app stays up because **no
single AZ was a point of failure**.

**Why this works:** multi-AZ redundancy plus self-healing (the reliability pillar) turns a data-center
failure into a non-event.

## Example 3 — Pitfall: the naive version

A first attempt runs one EC2 instance in one AZ, with the database on the same box, the DB password
hardcoded, the bucket public, no monitoring, and no IaC. It "works" — until the AZ blips (total
outage), the key leaks (breach), or the bill drifts (no budget). It fails every pillar.

**Why this bites:** "it runs" is not "well-architected"; without redundancy, security, observability,
and cost control, the design is one incident away from disaster.

# Common Mistakes

- **Single-AZ, single-instance designs.** No redundancy means any failure is an outage.
- **Stateful app servers.** They break scaling and self-healing — externalize session state.
- **Hardcoded secrets and public data.** Use Secrets Manager, KMS, and keep buckets private.
- **No monitoring, IaC, or budget.** You can't operate, rebuild, or control cost without them.

# Best Practices

- Build **three tiers across multiple AZs**, keep the app tier **stateless**, and put data tiers in
  **private subnets**.
- Apply **security everywhere**: IAM roles, KMS, TLS, Secrets Manager, WAF, GuardDuty — and patch the
  EC2 OS.
- Make it **elastic and observable**: ELB + Auto Scaling, CloudFront, CloudWatch/CloudTrail, and async
  decoupling with SQS/SNS/Lambda.
- Define it in **CloudFormation**, set **Budgets**, choose a **DR strategy** by RTO/RPO, and run a
  **Well-Architected review**.

# Summary

- A production web app on AWS is a **three-tier**, **multi-AZ** design: **Route 53 → CloudFront → ALB →
  stateless app tier (ASG/containers) → private data tier (RDS/DynamoDB/ElastiCache)**, with **S3** for
  assets and **SQS/SNS/Lambda** for async work.
- **Cross-cutting** concerns make it real: **IAM/KMS/Secrets Manager/WAF** (security),
  **CloudWatch/CloudTrail** (operations), **CloudFormation** (IaC), and **Budgets** (cost).
- Each choice maps to a **Well-Architected pillar**, giving **high availability, security, elasticity,
  and cost control**.
- The craft is **combining** the services deliberately — and reviewing the result against the pillars —
  not just making something that runs.

# Flash Cards

Q: What are the three tiers of the reference web application, and where does each run?
A: The web/CDN tier (Route 53 + CloudFront), the application tier (stateless EC2/containers in an Auto Scaling group in private subnets), and the data tier (RDS/DynamoDB/ElastiCache in private subnets) — spread across multiple AZs.

Q: Why must the application tier be stateless in this design?
A: So any instance can serve any request and the Auto Scaling group can add or replace instances freely; session state lives in ElastiCache/DynamoDB instead of on a server.

Q: How does the architecture survive an Availability Zone failure?
A: It runs across multiple AZs, so the load balancer routes to healthy servers, RDS Multi-AZ fails over to its standby, and the Auto Scaling group rebuilds capacity in the surviving AZ.

Q: Which services handle security across the tiers?
A: IAM roles (least privilege), private subnets and security groups, KMS (encryption at rest), TLS (in transit), Secrets Manager (credentials), and WAF/GuardDuty — while you still patch the EC2 OS.

Q: How is background work kept from slowing the request?
A: It's decoupled onto SQS/SNS and processed asynchronously by Lambda, so the user's request returns immediately.

Q: What makes this design "well-architected" rather than just working?
A: Every choice maps to a Well-Architected pillar — operational excellence, security, reliability, performance efficiency, cost optimization, and sustainability — giving deliberate, reviewed trade-offs, not an accidental setup.

# Exercises

### Easy
List the path a dynamic web request takes through this architecture, from the user's DNS lookup to the
database.

### Medium
For three of the six pillars, name one concrete design choice in this architecture that satisfies it,
and explain why.

### Challenging
Take the naive design from Example 3 (single EC2 in one AZ, database on the same box, hardcoded
password, public bucket, no monitoring). Redesign it into a well-architected system, listing the
changes tier by tier, and mapping at least four of your changes to specific pillars.

# Further Reading

- AWS — *AWS Well-Architected Framework*: <https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html>
- AWS — *Web application hosting reference architectures*: <https://docs.aws.amazon.com/architecture/>
- AWS — *Building a three-tier architecture (Reliability pillar)*: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html>
- AWS — *AWS Architecture Center*: <https://aws.amazon.com/architecture/>
