---
id: lesson-23
slug: containers-on-aws
title: "Containers on AWS: ECS, EKS, and Fargate"
level: advanced
order: 23
duration: 20
tags:
  - containers
  - ecs
  - eks
  - fargate
  - orchestration
summary: "Running containers on AWS — what containers are and how they differ from virtual machines, why orchestration matters, and the AWS options: ECS for simple AWS-native orchestration, EKS for managed Kubernetes, and Fargate for running containers without managing servers."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what a **container** is and how it differs from a **virtual machine**.
- Describe why **orchestration** is needed for many containers.
- Distinguish **Amazon ECS**, **Amazon EKS**, and **Amazon ECR**.
- Explain **AWS Fargate** and the **EC2 vs Fargate** launch choice.
- Decide when containers (vs Lambda or plain EC2) fit a workload.

# Why It Matters

Containers are the standard way modern applications are packaged and deployed — consistent across
laptops, test, and production, and efficient to run at scale. AWS offers several ways to run them, and
the choices (ECS vs EKS, EC2 vs Fargate) meaningfully affect complexity, portability, and how much
infrastructure you manage. Knowing the landscape lets you pick the simplest option that meets your
needs.

# Concept Explanation

### Containers vs virtual machines

A **container** packages an application **together with its dependencies** so it runs the same
everywhere. The key difference from a **virtual machine**:

- A **VM** virtualizes **hardware** — each VM runs its **own full operating system**, so it's heavier
  and slower to start.
- A **container** virtualizes the **operating system** — containers **share the host's OS kernel** as
  isolated processes, so they're **lightweight**, start fast, and pack densely.

```text
   Virtual machines                     Containers
   ┌─────┬─────┬─────┐                  ┌─────┬─────┬─────┬─────┐
   │ App │ App │ App │                  │ App │ App │ App │ App │
   │ OS  │ OS  │ OS  │  ← full OS each  ├─────┴─────┴─────┴─────┤
   ├─────┴─────┴─────┤                  │  container runtime    │  ← shared kernel
   │   hypervisor    │                  │     host OS           │
   └─────────────────┘                  └───────────────────────┘
```

### Orchestration

Running one container is easy; running **hundreds across many hosts** needs an **orchestrator** to
**schedule** containers onto hosts, **scale** them, **restart** failed ones, and wire up
**networking**. That's what ECS and EKS provide.

### The AWS container services

- **Amazon ECR (Elastic Container Registry)** — a **registry** to store and version your container
  **images** (like a private image library).
- **Amazon ECS (Elastic Container Service)** — AWS's **own orchestrator**. It's simpler and deeply
  integrated with AWS; you define **tasks** (containers) and **services**, and ECS runs them.
- **Amazon EKS (Elastic Kubernetes Service)** — **managed Kubernetes**. You get the **standard,
  portable** Kubernetes API and ecosystem, at more complexity — a good fit when you already use
  Kubernetes or want cross-cloud portability.

### AWS Fargate — serverless containers

**AWS Fargate** is a **serverless compute engine for containers**: you run containers **without
provisioning or managing EC2 servers**. It works **with both ECS and EKS**. You specify the container
and its CPU/memory, and Fargate runs it — no cluster of EC2 instances to patch or scale.

This gives two **launch types**:

- **EC2 launch type** — you manage a cluster of EC2 instances the containers run on (more control,
  can be cheaper at high steady utilization, more work).
- **Fargate launch type** — AWS runs the containers serverlessly (less control, no servers to manage,
  pay per container resource used).

### Containers vs Lambda vs EC2

- **Lambda** — short, event-driven functions; no packaging of a long-running server.
- **Containers (ECS/EKS + Fargate)** — longer-running or always-on services, microservices, and
  workloads you want packaged as images and orchestrated.
- **Plain EC2** — when you want full control of the host or specialized instances.

# Key Terminology

- **Container** — an app plus dependencies sharing the host OS kernel; lightweight and portable.
- **Orchestration** — scheduling, scaling, healing, and networking many containers.
- **Amazon ECR** — a registry for storing container images.
- **Amazon ECS / EKS** — AWS-native orchestrator / managed Kubernetes.
- **AWS Fargate** — serverless compute for containers (no EC2 to manage), works with ECS and EKS.
- **Launch type** — EC2 (you manage instances) vs Fargate (serverless).

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Orchestrator | Amazon ECS | Amazon EKS | ECS for simplicity and AWS-native; EKS for the Kubernetes standard, ecosystem, and portability. |
| Compute for containers | EC2 launch type | Fargate | Fargate to avoid managing servers; EC2 for fine control or cost tuning at steady high scale. |
| Function vs service | AWS Lambda | Containers | Lambda for short event-driven tasks; containers for longer-running or always-on services. |

# Worked Example

Choosing how to run a microservice:

```text
Requirements: an always-on HTTP microservice, packaged as a container, low operational overhead.
1. Build the image and push it to Amazon ECR.
2. Orchestrate with Amazon ECS (AWS-native, simplest) — define a task for the container and a service
   to keep the desired number running behind a load balancer.
3. Use the Fargate launch type so there are no EC2 instances to patch or scale.
4. Result: the service runs and self-heals, scales by task count, and you manage no servers.
If the team standardizes on Kubernetes across clouds, choose EKS instead of ECS — same containers,
different orchestrator.
```

# Real World Analogy

A **container** is like a standardized **shipping container**: pack your goods (app + dependencies)
once, and it moves identically on any ship, truck, or port (any host). A **virtual machine** is like
shipping a **whole truck** — engine and all (a full OS) — for each load: heavier and slower.
**Orchestration** (ECS/EKS) is the **port's crane-and-logistics system** that decides where each
container goes, replaces damaged ones, and brings in more when it's busy. **Fargate** is **hiring the
port to run everything** so you don't own the cranes or the docks — no servers to manage.

# Examples

## Example 1 — Basic: why containers start fast

A container shares the host's kernel and only bundles the app and its libraries, so launching one is
near-instant compared with booting a VM's full operating system.

**Why this works:** virtualizing the OS instead of the hardware removes the per-instance OS boot,
making containers light and quick.

## Example 2 — Real-world: no servers with Fargate

A team runs a dozen microservices on **ECS + Fargate**. There's no EC2 cluster to patch or right-size;
each service scales by task count, and they pay for the CPU/memory their tasks use.

**Why this works:** Fargate removes server management for containers, mirroring the serverless benefit
at the container level.

## Example 3 — Pitfall: reaching for Kubernetes by default

A small team picks **EKS** for a simple service purely because Kubernetes is popular, then spends weeks
on cluster complexity they didn't need. **ECS + Fargate** would have shipped the same service far
sooner.

**Why this bites:** EKS's power comes with operational complexity; choose it for real Kubernetes needs
(standardization, ecosystem, portability), not by default.

# Common Mistakes

- **Confusing containers and VMs.** Containers share the host kernel; VMs each run a full OS.
- **Defaulting to EKS.** Use ECS + Fargate unless you specifically need Kubernetes.
- **Managing EC2 clusters unnecessarily.** Fargate removes that work for most workloads.
- **Using containers for tiny event tasks.** Short, event-driven work is often simpler on Lambda.

# Best Practices

- Store images in **ECR** and keep them small and versioned.
- Prefer **ECS + Fargate** for simple, AWS-native container workloads; choose **EKS** when you need
  **Kubernetes** specifically.
- Use **Fargate** to avoid server management; consider the **EC2 launch type** only for control or
  cost at steady high utilization.
- Match the tool to the workload: **Lambda** for short events, **containers** for services, **EC2** for
  full host control.

# Summary

- A **container** bundles an app with its dependencies and **shares the host OS kernel**, making it
  lighter and faster than a **VM** (which runs a full OS each).
- **Orchestration** schedules, scales, heals, and networks many containers; **ECS** is AWS-native and
  simple, **EKS** is managed **Kubernetes** (portable, more complex), and **ECR** stores images.
- **Fargate** runs containers **serverlessly** (no EC2 to manage) with **both ECS and EKS**; the
  alternative **EC2 launch type** gives more control.
- Choose **containers** for longer-running services, **Lambda** for short event tasks, and **EC2** for
  full host control.

# Flash Cards

Q: How does a container differ from a virtual machine?
A: A VM virtualizes hardware and runs its own full OS (heavier); a container virtualizes the OS, sharing the host kernel as an isolated process, so it's lightweight and starts fast.

Q: What problem does container orchestration solve?
A: Running many containers across hosts — scheduling them onto hosts, scaling them, restarting failed ones, and handling networking — which ECS and EKS provide.

Q: What is the difference between Amazon ECS and Amazon EKS?
A: ECS is AWS's own, simpler, AWS-integrated orchestrator; EKS is managed Kubernetes, offering the standard portable Kubernetes API and ecosystem at more complexity.

Q: What is AWS Fargate?
A: A serverless compute engine for containers — you run containers without provisioning or managing EC2 servers — and it works with both ECS and EKS.

Q: What is Amazon ECR?
A: The Elastic Container Registry, a private service for storing and versioning your container images.

Q: When would you choose containers over Lambda?
A: For longer-running or always-on services and microservices packaged as images, rather than short, event-driven tasks that fit Lambda.

# Exercises

### Easy
In one or two sentences, explain why a container starts faster and is lighter than a virtual machine.

### Medium
Compare ECS and EKS: when would you pick each, and what does Fargate change about running either?

### Challenging
A team must run several always-on microservices with minimal operational overhead and no Kubernetes
requirement. Recommend an AWS approach (registry, orchestrator, launch type), justify each choice, and
say when you'd revisit the decision in favor of EKS.

# Further Reading

- AWS — *What is Amazon ECS?*: <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html>
- AWS — *What is Amazon EKS?*: <https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html>
- AWS — *What is AWS Fargate?*: <https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html>
- AWS — *Amazon Elastic Container Registry*: <https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html>
