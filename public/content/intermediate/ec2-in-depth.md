---
id: lesson-10
slug: ec2-in-depth
title: "EC2 in Depth: Storage, Images, and Pricing"
level: intermediate
order: 10
duration: 21
tags:
  - ebs
  - instance-store
  - ami
  - spot
  - savings-plans
summary: "The parts of EC2 that decide durability and cost — EBS network volumes versus ephemeral instance store, snapshots and custom AMIs for repeatable images, instance metadata and roles, and the four purchasing models (On-Demand, Savings Plans/Reserved, Spot, Dedicated) and when each fits."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Contrast **EBS** volumes with **instance store** and know which data survives a stop.
- Use **snapshots** and **custom AMIs** to make images repeatable and portable.
- Explain the **instance metadata service** and how EC2 gets role credentials.
- Choose among **On-Demand, Savings Plans/Reserved, Spot, and Dedicated** pricing.
- Match each pricing model to a workload without over-committing or losing data.

# Why It Matters

Two EC2 decisions quietly control your durability and your bill: **which storage** you attach, and
**how you pay** for compute. Put important data on ephemeral storage and it vanishes on the next stop;
run steady workloads at On-Demand rates and you overpay by a lot; run the wrong workload on Spot and it
gets interrupted. Getting these right is where EC2 knowledge turns into real savings and reliability.

# Concept Explanation

### EBS vs instance store

- **Amazon EBS (Elastic Block Store)** is **network-attached block storage** — a virtual disk. It
  **persists independently** of the instance's life (so a **stop** keeps its data), lives in **one AZ**,
  can be **resized** and **encrypted**, and is usually the **root volume**. Volume types trade cost for
  performance: general-purpose SSD (**gp3**/gp2), provisioned-IOPS SSD (**io2**/io1) for demanding
  databases, and throughput HDD (**st1**/sc1) for big sequential data.
- **Instance store** is **ephemeral** storage physically attached to the host. It's fast, but its data
  is **lost when the instance stops or terminates**. Use it only for scratch/temporary data.
- **Amazon EFS** (a shared NFS filesystem) and **Amazon FSx** exist when many instances need the
  **same** files across AZs — but EBS attaches to one instance at a time.

```text
Stop the instance:
   EBS volume        → data SURVIVES (detached, still there, still billed a little)
   Instance store    → data is GONE
```

### Snapshots and custom AMIs

- An **EBS snapshot** is a point-in-time backup of a volume stored in S3 (incrementally — only changed
  blocks after the first). Snapshots are how you back up and move EBS data.
- A **custom AMI** captures a configured instance (its EBS snapshot plus settings) so new instances
  launch **pre-configured**. AMIs are **Region-scoped**; you **copy** them to other Regions to use them
  there. Baking configuration into an AMI (or using user data) makes launches repeatable — the basis of
  auto scaling.

### Instance metadata and roles

Every instance can query the **Instance Metadata Service (IMDS)** at `169.254.169.254` for facts about
itself (its ID, AZ, and the **temporary credentials** of any attached **IAM role**). This is how an app
on EC2 gets AWS permissions **without stored keys**. Use **IMDSv2** (session-based) for better security.

### The four pricing models

| Model | What it is | Best for |
| ----- | ---------- | -------- |
| **On-Demand** | Pay per second/hour, no commitment | Short, spiky, or unpredictable workloads; testing |
| **Savings Plans / Reserved** | Commit to 1 or 3 years for a large discount | Steady, always-on baseline load |
| **Spot** | Spare capacity at a deep discount, interruptible with a **2-minute** warning | Fault-tolerant, flexible, stateless work (batch, CI, rendering) |
| **Dedicated Hosts/Instances** | Physically isolated hardware | Licensing or compliance that requires isolation |

**Savings Plans** are usually more flexible than classic Reserved Instances: you commit to an amount of
compute spend per hour and the discount applies across instance families/Regions (as of writing).

# Key Terminology

- **EBS** — network block storage that persists independently; lives in one AZ.
- **Instance store** — ephemeral local disk, lost on stop/terminate.
- **Snapshot** — an incremental point-in-time backup of an EBS volume, in S3.
- **Custom AMI** — a reusable image of a configured instance; Region-scoped.
- **IMDS** — the instance metadata service, source of instance info and role credentials.
- **On-Demand / Savings Plan / Spot / Dedicated** — the four EC2 purchasing models.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Storage for a database | Instance store | EBS (io2/gp3) | EBS — the data must survive stops and be snapshot-able; instance store would lose it. |
| Steady 24/7 server | On-Demand | Savings Plan / Reserved | Commit for a big discount when usage is predictable and constant. |
| Batch/CI jobs | On-Demand | Spot | Spot for large savings when the work tolerates interruption and can retry. |

# Worked Example

Choosing storage and pricing for two workloads:

```text
Workload A — a production database:
   Storage: EBS (gp3 or io2) so data persists and can be snapshotted nightly.
   Pricing: On-Demand now; move the steady baseline to a Savings Plan once usage is predictable.

Workload B — a nightly batch job that can restart:
   Storage: instance store or a small EBS volume — the job is stateless and re-runnable.
   Pricing: Spot instances — up to a deep discount, and if interrupted the job simply retries.
```

The database prioritizes **durability and commitment savings**; the batch job trades interruption risk
for **Spot's** low price.

# Real World Analogy

EC2 pricing is like **booking hotel rooms**. **On-Demand** is the walk-in nightly rate — flexible but
priciest. A **Savings Plan / Reserved Instance** is booking a year ahead for a discount — cheaper, but
you've committed. **Spot** is the standby rate for empty rooms — very cheap, but if a full-price guest
shows up, you're bumped (the two-minute warning). A **Dedicated Host** is renting a whole floor for
privacy or house rules. And storage is like luggage: **EBS** is a suitcase you keep and can move
(snapshot); **instance store** is the room's scratch pad, cleared at checkout.

# Examples

## Example 1 — Basic: what survives a stop

An instance has an EBS root volume and an instance-store scratch disk. You stop it overnight. In the
morning the EBS data is intact; the instance-store data is gone.

**Why this works:** EBS is decoupled network storage that persists; instance store is tied to the
running host and cleared when the instance stops.

## Example 2 — Real-world: Spot for a rendering farm

A studio renders frames on hundreds of **Spot** instances at a fraction of On-Demand cost. Each frame
is an independent, re-runnable task, so an occasional two-minute interruption just sends that frame to
another instance.

**Why this works:** Spot rewards workloads that are fault-tolerant and stateless with big savings; the
interruption risk is harmless when work can retry.

## Example 3 — Pitfall: Spot for a stateful database

A team runs their primary database on Spot to save money. When capacity is reclaimed, the instance is
interrupted and the database goes down mid-transaction.

**Why this bites:** Spot can be interrupted at any time; stateful, must-stay-up services need On-Demand
or committed capacity, not Spot.

# Common Mistakes

- **Storing important data on instance store.** It's ephemeral — use EBS for anything that must
  survive.
- **Running steady workloads at On-Demand forever.** Commit with a Savings Plan for predictable load.
- **Putting stateful services on Spot.** Reserve Spot for interruptible, retry-able work.
- **Forgetting AMIs are Region-scoped.** Copy an AMI to another Region before launching there.

# Best Practices

- Put persistent data on **EBS**, **snapshot** it on a schedule, and enable **encryption**.
- Bake configuration into **custom AMIs** (or user data) for repeatable, fast launches.
- Let EC2 get permissions from an **IAM role via IMDSv2**, not stored keys.
- Blend pricing: **Savings Plans** for the steady baseline, **Spot** for interruptible bursts,
  **On-Demand** for the unpredictable middle.

# Summary

- **EBS** is persistent network block storage (survives a stop, one AZ, snapshot-able); **instance
  store** is ephemeral and lost on stop/terminate.
- **Snapshots** back up EBS; **custom AMIs** make configured images reusable and are **Region-scoped**.
- Instances read facts and **IAM role credentials** from the **metadata service** (use IMDSv2).
- Pricing: **On-Demand** (flexible), **Savings Plans/Reserved** (commit for discount), **Spot**
  (cheap, interruptible), **Dedicated** (isolation) — match the model to the workload.

# Flash Cards

Q: What is the key difference between EBS and instance store?
A: EBS is network-attached block storage that persists independently of the instance (survives a stop) and lives in one AZ; instance store is ephemeral local disk whose data is lost when the instance stops or terminates.

Q: What is an EBS snapshot?
A: An incremental point-in-time backup of an EBS volume stored in S3; the first is full and later ones capture only changed blocks.

Q: Why is a custom AMI useful, and what is its scope?
A: It captures a configured instance so new instances launch pre-configured; AMIs are Region-scoped, so you copy them to other Regions to use them there.

Q: When should you use Spot instances?
A: For fault-tolerant, flexible, stateless workloads (batch, CI, rendering) that tolerate interruption — Spot offers deep discounts but can be reclaimed with a two-minute warning.

Q: Which pricing model suits a steady, always-on workload?
A: A Savings Plan or Reserved Instance — committing to 1 or 3 years yields a large discount versus On-Demand for predictable, constant load.

Q: How does an app on EC2 get AWS permissions without stored keys?
A: Through an attached IAM role, whose temporary credentials the instance retrieves from the instance metadata service (preferably IMDSv2).

# Exercises

### Easy
List which of these survive stopping an instance: (a) data on an EBS root volume, (b) data on an
instance-store disk, (c) an EBS snapshot in S3.

### Medium
Match each workload to a pricing model and justify it: (a) a 24/7 production API, (b) a nightly,
re-runnable data-processing job, (c) a one-week experiment.

### Challenging
You're designing storage and purchasing for a small production database plus a fleet of interruptible
workers. Describe the storage type and pricing model for each, how you'd back up the database, and one
risk you're deliberately avoiding.

# Further Reading

- AWS — *Amazon EBS*: <https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html>
- AWS — *Amazon EC2 instance store*: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html>
- AWS — *Instance purchasing options*: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html>
- AWS — *Instance metadata and user data (IMDSv2)*: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html>
