---
id: lesson-04
slug: shared-responsibility-model
title: "The Shared Responsibility Model"
level: beginner
order: 4
duration: 17
tags:
  - security
  - shared-responsibility
  - compliance
  - iaas
  - managed-services
summary: "How security duties split between AWS and you — AWS secures the cloud itself (hardware and global infrastructure), while you secure what you put in it (your data, access, and configuration) — and how that line shifts as you move from EC2 to managed and serverless services."
---

# Learning Objectives

By the end of this lesson you will be able to:

- State the **shared responsibility model** in one sentence.
- List what **AWS** secures versus what the **customer** secures.
- Explain how the responsibility line **shifts** from IaaS to managed to serverless services.
- Identify **shared controls** that both parties handle.
- Recognize why most cloud incidents come from **customer misconfiguration**, not AWS.

# Why It Matters

The single most common cause of cloud data leaks is not AWS being hacked — it's customers
misconfiguring their own resources (a public storage bucket, an over-permissive access policy). The
**shared responsibility model** is AWS's clear statement of who secures what, and misreading it is how
teams end up thinking "AWS has security covered" when the exposed part was always theirs. Every
security lesson later in this course builds on this split.

# Concept Explanation

### Security "of" the cloud vs "in" the cloud

The model has two halves:

- **AWS is responsible for security _of_ the cloud** — the infrastructure that runs all the services:
  the physical data centers, hardware, networking, and the software of the **managed** services.
- **You are responsible for security _in_ the cloud** — everything you put on that infrastructure:
  your **data**, your **identity and access (IAM) configuration**, your **operating-system and
  firewall settings** (where applicable), and your **encryption choices**.

```text
        SECURITY  IN  THE CLOUD   →   YOUR JOB
   ┌──────────────────────────────────────────────┐
   │ Your data · IAM users/roles/policies · guest  │
   │ OS & patches · security-group rules · app code │
   │ client/server-side encryption choices          │
   ├──────────────────────────────────────────────┤
   │ SECURITY  OF  THE CLOUD   →   AWS'S JOB        │
   │ Regions, AZs, edge · physical data centers ·   │
   │ hardware · networking · hypervisor · managed    │
   │ service software                                │
   └──────────────────────────────────────────────┘
```

### The line shifts by service type

How much *you* must do depends on how managed the service is:

- **IaaS — e.g., Amazon EC2.** You get a virtual server, so **you** patch the guest operating system,
  install and secure your applications, and set the firewall (security group) rules. AWS secures the
  physical host and hypervisor underneath. This is the **most** customer responsibility.
- **Managed — e.g., Amazon RDS.** AWS patches the database engine and the OS it runs on and handles
  backups; **you** still control access, network placement, and your data. Less on your plate than
  EC2.
- **Serverless / fully managed — e.g., Amazon S3, AWS Lambda, DynamoDB.** AWS runs and patches all the
  infrastructure and OS; **you** are responsible for your data, who can access it (policies), and your
  encryption settings. The **least** infrastructure work for you — but the data and access are still
  yours to secure.

Across all of them, **your data and your access configuration are always your responsibility.**

### Shared controls

Some controls are **shared** — both sides do part:

- **Patch management** — AWS patches the infrastructure; you patch your guest OS and apps.
- **Configuration management** — AWS configures the infrastructure; you configure your resources.
- **Awareness and training** — each party trains its own people.

AWS also provides **inherited controls** (like physical and environmental security) that you benefit
from without doing anything, and you handle **customer-specific** controls (like classifying your
data).

# Key Terminology

- **Shared responsibility model** — AWS's framework splitting security between AWS and the customer.
- **Security of the cloud** — AWS's duty: infrastructure, hardware, and managed-service software.
- **Security in the cloud** — the customer's duty: data, access, config, and (for IaaS) the OS.
- **Managed service** — one where AWS operates more of the stack (e.g., RDS, S3, Lambda).
- **Shared control** — a duty both parties handle at different layers (e.g., patching).
- **Misconfiguration** — a customer-side setting mistake, the leading cause of cloud exposure.

# Options and Trade-offs

| Service type | AWS handles | You handle | Effect on you |
| ------------ | ----------- | ---------- | ------------- |
| IaaS (EC2) | Physical host, hypervisor, network fabric | Guest OS patches, apps, security groups, data | Most control, most responsibility |
| Managed (RDS) | DB engine + OS patching, backups, host | Access, network placement, your data | Middle ground |
| Serverless (S3, Lambda) | All infra + OS patching, scaling | Data, access policies, encryption settings | Least infra work; data/access still yours |

# Worked Example

Two questions, answered with the model:

```text
Q: A critical OS security patch is released. Who applies it to your EC2 instance's operating system?
A: You do — the guest OS on an EC2 instance is the customer's responsibility (IaaS).

Q: Who patches the operating system underneath Amazon S3?
A: AWS does — S3 is fully managed, so AWS owns all of its infrastructure and OS.

Q: An S3 bucket is accidentally made public and data leaks. Whose responsibility?
A: Yours — the bucket's access configuration and data are the customer's responsibility, even though
   AWS runs the storage service securely.
```

The pattern: **infrastructure and managed-service software → AWS; your data, access, and (for IaaS)
the OS → you.**

# Real World Analogy

Think of AWS like a **secure apartment building**. The landlord (AWS) secures the structure: the
foundation, exterior walls, locks on the main entrance, cameras in the lobby. But **your apartment
door** is yours to lock, and **you** decide who gets a key and what valuables you keep inside. If you
leave your own door wide open, the building's excellent lobby security doesn't help. A public S3
bucket is exactly that: an unlocked apartment door in a very secure building.

# Examples

## Example 1 — Basic: sorting duties

Sort these: *physical data center security*, *choosing an IAM policy*, *patching the EC2 guest OS*,
*replacing failed disks in the data center*. AWS owns the first and last (infrastructure); you own the
middle two (your access config and your guest OS).

**Why this works:** each item falls cleanly on one side once you ask "is this the infrastructure, or
is this my data/access/OS?"

## Example 2 — Real-world: a managed database

You run a PostgreSQL database on **Amazon RDS**. AWS applies the database engine's security patches
and manages the underlying host, so you don't SSH in to patch it. But **you** still set who can
connect, place it in a private subnet, and protect the data. Responsibility is shared, split by layer.

**Why this works:** RDS moves the OS/engine patching to AWS while leaving access and data with you —
the classic managed-service split.

## Example 3 — Pitfall: "AWS handles security"

A team assumes that because AWS is highly secure, their setup is automatically safe. They leave an
over-permissive policy that lets anyone read a bucket. AWS's infrastructure was never breached — the
**customer's configuration** exposed the data.

**Why this bites:** AWS securing the cloud says nothing about how *you* configured your access; that
half is always yours.

# Common Mistakes

- **Thinking AWS secures your data.** AWS secures the infrastructure; your data and access are yours.
- **Forgetting to patch the EC2 OS.** On IaaS, guest-OS patching is the customer's job.
- **Blaming the provider for a misconfiguration.** A public bucket or loose policy is customer-side.
- **Assuming all services split the same way.** The line shifts — EC2, RDS, and S3 leave you different
  amounts of work.

# Best Practices

- For every resource, ask: **"of the cloud" (AWS) or "in the cloud" (me)?** — then act on your half.
- **Patch the guest OS** on EC2 promptly; prefer managed services to shrink that burden.
- **Lock down access**: least-privilege IAM, and leave S3 Block Public Access on unless you truly need
  public access.
- Treat **misconfiguration** as the main threat and review your settings regularly.

# Summary

- The **shared responsibility model**: **AWS secures the cloud** (infrastructure, hardware, managed
  software); **you secure what's in it** (data, access, config, and the OS on IaaS).
- The line **shifts** — IaaS leaves you the most work, serverless the least — but **data and access
  are always yours**.
- Some controls (patching, configuration, training) are **shared** across layers.
- Most cloud incidents are **customer misconfiguration**, not AWS being breached.

# Flash Cards

Q: State the shared responsibility model in one sentence.
A: AWS is responsible for security OF the cloud (the infrastructure and managed-service software), and the customer is responsible for security IN the cloud (their data, access, configuration, and — on IaaS — the OS).

Q: Who patches the guest operating system on an EC2 instance?
A: The customer — on IaaS like EC2, the guest OS, applications, and firewall (security group) rules are the customer's responsibility.

Q: Who is responsible if an S3 bucket is misconfigured as public and leaks data?
A: The customer — the bucket's access configuration and the data are the customer's responsibility, even though AWS runs S3 securely.

Q: How does the responsibility line change from EC2 to S3?
A: EC2 (IaaS) leaves the customer the most work (including OS patching); S3 (fully managed) leaves the least infrastructure work, though data and access are still the customer's.

Q: What is always the customer's responsibility, regardless of service?
A: Their data and their identity/access configuration are always the customer's responsibility.

Q: Give an example of a shared control.
A: Patch management — AWS patches the infrastructure while the customer patches the guest OS and applications (configuration management and training are also shared).

# Exercises

### Easy
For each item, say whether it's AWS's or the customer's responsibility: (a) physical data-center
security, (b) an IAM policy that grants access, (c) patching the EC2 guest OS, (d) the hypervisor.

### Medium
Explain, in two or three sentences, why running PostgreSQL on Amazon RDS shifts some security work to
AWS compared with running PostgreSQL yourself on an EC2 instance.

### Challenging
A colleague says, "We're on AWS, so security is handled." Write a short, specific rebuttal naming
three things that are still your team's responsibility, and one common misconfiguration that would
prove the point.

# Further Reading

- AWS — *Shared Responsibility Model*: <https://aws.amazon.com/compliance/shared-responsibility-model/>
- AWS Well-Architected — *Security pillar*: <https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html>
- AWS — *Security best practices in IAM*: <https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>
- AWS — *S3 Block Public Access*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html>
