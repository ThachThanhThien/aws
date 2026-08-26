---
id: lesson-11
slug: load-balancing-and-auto-scaling
title: "Load Balancing and Auto Scaling"
level: intermediate
order: 11
duration: 20
tags:
  - elastic-load-balancing
  - auto-scaling
  - high-availability
  - elasticity
  - health-checks
summary: "How AWS spreads traffic and adjusts capacity — Elastic Load Balancing distributing requests across healthy targets in multiple AZs, Auto Scaling groups adding and removing instances to match demand, and how the two combine into an elastic, self-healing web tier."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **Elastic Load Balancing (ELB)** does and why **health checks** matter.
- Tell apart the **Application** and **Network** Load Balancers.
- Describe how an **Auto Scaling group (ASG)** keeps the right number of instances.
- Distinguish **horizontal** from **vertical** scaling and why statelessness enables it.
- Combine a load balancer and an ASG into a resilient web tier.

# Why It Matters

A single server has two problems: if it fails, the app is down, and if traffic spikes, it gets
overwhelmed. **Load balancing** and **auto scaling** solve both — spreading requests across many
servers in multiple AZs and adding or removing servers as demand changes. Together they turn a fragile
single machine into an elastic, self-healing tier, which is the standard pattern for production web
apps.

# Concept Explanation

### Elastic Load Balancing

An **Elastic Load Balancer** sits in front of your servers and **distributes incoming traffic** across
a group of **targets** (EC2 instances, containers, or IPs), typically spread across **multiple AZs**.
It runs **health checks** and routes requests **only to healthy targets**, so a failed server is
automatically taken out of rotation. That gives you both **scalability** (share the load) and
**availability** (route around failures).

The main types:

- **Application Load Balancer (ALB)** — operates at **Layer 7 (HTTP/HTTPS)**. It can route by
  **content** (URL path or host header), which suits web apps and microservices (e.g., `/api/*` to one
  group, `/images/*` to another).
- **Network Load Balancer (NLB)** — operates at **Layer 4 (TCP/UDP)** for **very high performance and
  low latency**, and can provide a **static IP**. Good for extreme throughput or non-HTTP protocols.
- **Gateway Load Balancer (GWLB)** — for deploying third-party network appliances (firewalls, etc.).
- (The **Classic Load Balancer** is the older, legacy option.)

### Auto Scaling groups

An **Auto Scaling group (ASG)** manages a fleet of EC2 instances to keep a **desired capacity**. You
set **minimum**, **desired**, and **maximum** counts, and a **launch template** describing how to build
each instance. The ASG:

- **launches or terminates** instances to match the desired count,
- **spreads** them across the AZs you choose, and
- **replaces unhealthy instances** automatically (self-healing).

**Scaling policies** change the desired count based on demand:

- **Target tracking** — keep a metric at a target (e.g., average CPU at 50%); the ASG adds/removes
  instances to hold it. This is the simplest and most common.
- **Step / simple** scaling — add or remove N instances when an alarm crosses a threshold.
- **Scheduled** scaling — change capacity at known times (e.g., scale up before business hours).

### Horizontal vs vertical scaling

- **Horizontal scaling (scale out/in)** — add or remove **instances**. This is what an ASG does, and
  it's how the cloud achieves elasticity and high availability.
- **Vertical scaling (scale up/down)** — move to a **bigger/smaller instance type**. Simpler, but
  bounded by the largest instance and it means downtime to resize.

Horizontal scaling requires **stateless** servers: if a user's session data lives on one instance,
adding servers or replacing a failed one loses it. Keep session/state in a shared store (a database,
cache, or S3) so any instance can serve any request.

```text
                       ┌──────────────── Auto Scaling group ────────────────┐
  users → [ ALB ] ───► │  AZ-a: [web] [web]        AZ-b: [web] [web]         │
             │         │  desired=4 (min 2, max 8); unhealthy ones replaced  │
             │         └─────────────────────────────────────────────────────┘
      health checks skip failed targets;  CPU high → add web servers;  quiet → remove them
```

# Key Terminology

- **Elastic Load Balancer (ELB)** — distributes traffic across healthy targets in multiple AZs.
- **Health check** — a probe that decides whether a target should receive traffic.
- **Application / Network Load Balancer** — Layer 7 (HTTP) vs Layer 4 (TCP/UDP) balancers.
- **Auto Scaling group (ASG)** — maintains a desired number of instances across AZs.
- **Launch template** — the definition of how to build each instance in the ASG.
- **Target tracking** — a scaling policy that holds a metric (like CPU) at a target value.
- **Horizontal / vertical scaling** — more instances vs a bigger instance.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Load balancer type | ALB (Layer 7) | NLB (Layer 4) | ALB for HTTP apps needing path/host routing; NLB for raw TCP/UDP throughput or a static IP. |
| Scaling direction | Vertical (bigger box) | Horizontal (more boxes) | Horizontal for elasticity and HA; vertical only when an app can't run on multiple instances. |
| Scaling policy | Scheduled | Target tracking | Target tracking for demand-driven load; scheduled for known, time-based patterns. |

# Worked Example

Making a web app elastic and highly available:

```text
1. Put web servers in private subnets across AZ-a and AZ-b.
2. Front them with an Application Load Balancer in public subnets (Layer 7, HTTPS).
3. Put the servers in an Auto Scaling group: min 2, desired 2, max 8, launch template installs the app.
4. Add a target-tracking policy: keep average CPU at ~50%.
5. Keep session state in a shared store (database/cache) so servers stay stateless.
Result: traffic spreads across healthy servers in two AZs; the ASG scales out under load and heals
failed instances automatically.
```

The ALB provides availability and routing; the ASG provides elasticity and self-healing; statelessness
makes both safe.

# Real World Analogy

A load balancer is the **host at a busy restaurant**: they send each arriving party to an open table,
across several dining rooms, and never seat anyone in a room that's closed for cleaning (the health
check). An Auto Scaling group is the **staffing manager**: when the queue grows they call in more
servers, when it's quiet they send some home, always keeping at least a minimum on shift. And because
any waiter can serve any table (stateless), adding or losing one doesn't disrupt a guest's meal.

# Examples

## Example 1 — Basic: health checks in action

An ALB fronts three servers. One crashes and fails its health check, so the ALB stops sending it
requests and users keep getting served by the other two. When it recovers and passes again, traffic
returns.

**Why this works:** routing only to healthy targets turns a server failure into a non-event for users.

## Example 2 — Real-world: a traffic spike

A product launch triples traffic. Target-tracking sees CPU rise above 50% and the ASG launches more
instances across both AZs; the ALB spreads the load. After the launch, CPU falls and the ASG scales
back in, so you stop paying for the extra capacity.

**Why this works:** the ASG converts a demand spike into temporary capacity and removes it afterward —
elasticity in action.

## Example 3 — Pitfall: stateful servers behind a scaler

An app stores each user's login session in memory on the instance that handled it. When the ASG
replaces an instance or adds new ones, those users are suddenly logged out or routed to a server that
doesn't know them.

**Why this bites:** horizontal scaling assumes any instance can serve any request; local state breaks
that, so state must live in a shared store.

# Common Mistakes

- **Skipping health checks (or setting them wrong).** Without good checks, traffic goes to dead
  servers.
- **Keeping session state on instances.** It breaks scaling and self-healing; externalize it.
- **Only scaling vertically.** A bigger box is still a single point of failure with a hard ceiling.
- **Setting min/max too tight.** Too low can't absorb spikes; too high wastes money — tune them.

# Best Practices

- Spread targets across **multiple AZs** behind the load balancer and ASG.
- Use **target tracking** for demand-driven scaling; add **scheduled** scaling for known patterns.
- Design servers to be **stateless**, storing session/state in a database, cache, or S3.
- Right-size **min/desired/max** and verify **health checks** actually detect failure.

# Summary

- **Elastic Load Balancing** distributes traffic across **healthy** targets in **multiple AZs**;
  **ALB** is Layer 7 (HTTP, content routing) and **NLB** is Layer 4 (TCP/UDP, high performance).
- An **Auto Scaling group** maintains a **desired capacity**, spreads instances across AZs, and
  **replaces unhealthy** ones; **target-tracking** policies scale to demand.
- **Horizontal scaling** (more instances) delivers elasticity and HA; it requires **stateless**
  servers.
- Together, an **ALB + ASG** form the standard elastic, self-healing web tier.

# Flash Cards

Q: What does an Elastic Load Balancer do, and why are health checks important?
A: It distributes incoming traffic across targets in multiple AZs and uses health checks to route only to healthy ones, so failed servers are automatically taken out of rotation.

Q: What is the difference between an Application Load Balancer and a Network Load Balancer?
A: The ALB works at Layer 7 (HTTP/HTTPS) and can route by URL path or host; the NLB works at Layer 4 (TCP/UDP) for very high performance and low latency, and can offer a static IP.

Q: What does an Auto Scaling group maintain, and what does it do with unhealthy instances?
A: It maintains a desired number of instances across chosen AZs, launching or terminating to match, and automatically replaces instances that fail health checks.

Q: What is target-tracking scaling?
A: A scaling policy that keeps a metric (e.g., average CPU) at a target value by adding or removing instances as needed — the simplest, most common policy.

Q: What is the difference between horizontal and vertical scaling?
A: Horizontal scaling adds or removes instances (elastic, highly available); vertical scaling moves to a bigger or smaller instance type (bounded and usually needs downtime).

Q: Why must servers be stateless to scale horizontally?
A: Because any instance may serve any request and instances can be added or replaced; if session state lives on one instance, scaling or healing loses it — so state belongs in a shared store.

# Exercises

### Easy
Explain in one or two sentences how a load balancer keeps users served when one backend server
crashes.

### Medium
Given a web app with unpredictable daytime traffic, describe an Auto Scaling setup: min/desired/max
values that make sense, which scaling policy you'd use, and across how many AZs.

### Challenging
An app stores user sessions in memory on each server and you're told to make it auto-scale. Explain why
the current design breaks under scaling and healing, and describe the changes needed to fix it, plus
which load balancer type you'd choose and why.

# Further Reading

- AWS — *Elastic Load Balancing*: <https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html>
- AWS — *Application Load Balancers*: <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html>
- AWS — *What is Amazon EC2 Auto Scaling?*: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html>
- AWS — *Target tracking scaling policies*: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html>
