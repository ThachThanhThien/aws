---
id: lesson-01
slug: what-is-aws-and-cloud
title: "What Is AWS and Cloud Computing?"
level: beginner
order: 1
duration: 16
tags:
  - cloud
  - aws
  - iaas
  - deployment-models
  - overview
summary: "What cloud computing is — on-demand IT resources over the internet with pay-as-you-go pricing — what Amazon Web Services offers, the three service models (IaaS, PaaS, SaaS), the deployment models (cloud, hybrid, on-premises), and an honest look at what the cloud does and does not solve."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define **cloud computing** and **Amazon Web Services (AWS)** in plain language.
- Explain the shift from **capital expense (CapEx)** to **operating expense (OpEx)**.
- Tell apart the three service models — **IaaS, PaaS, SaaS** — with AWS examples.
- Describe the **deployment models**: cloud, hybrid, and on-premises.
- Give an **honest** account of what the cloud can and cannot do for you.

# Why It Matters

Almost every app you use — streaming, banking, messaging — runs on rented computers in someone
else's data center. **AWS** is the largest of those rental platforms. Before you launch a single
server, it helps to see the whole map: what "the cloud" actually is, why organizations move to it,
and where the honest trade-offs are. Everything else in this course is a stop on that map, so getting
the vocabulary right now pays off in every later lesson.

# Concept Explanation

### What cloud computing is

**Cloud computing** is the **on-demand delivery of IT resources** — compute power, storage,
databases, networking — **over the internet**, with **pay-as-you-go pricing**. Instead of buying and
running your own servers, you rent capacity from a provider and give it back when you're done. You
provision what you need in minutes through a website or a command, and you pay only for what you use.

### What AWS is

**Amazon Web Services (AWS)** is Amazon's cloud platform. It launched its first widely used services
in 2006 and today offers **more than 200 services** (as of writing) for compute, storage, databases,
networking, analytics, machine learning, and more. You reach them through the **AWS Management
Console** (a website), the **AWS CLI** (a command-line tool), or **SDKs** (code libraries). We'll
meet the core services one at a time.

### CapEx vs OpEx

Running your own data center is a **capital expense (CapEx)**: you spend a large sum up front on
servers you own, and you're stuck with that capacity whether you use it or not. The cloud turns this
into an **operating expense (OpEx)**: you pay as you go for what you consume, like a utility bill.
This is why AWS summarizes the appeal as **"trade capital expense for variable expense"** and
**"stop guessing capacity"** — you can scale up for a busy day and back down at night.

### The three service models

Cloud services sit at different levels of "how much does the provider manage for you":

```text
        You manage less  ───────────────────────────►  You manage more
   ┌──────────────┐     ┌──────────────┐     ┌────────────────────────┐
   │     SaaS     │     │     PaaS     │     │          IaaS          │
   │ (software)   │     │ (platform)   │     │ (infrastructure)       │
   │ use the app  │     │ deploy code  │     │ run virtual servers    │
   └──────────────┘     └──────────────┘     └────────────────────────┘
     e.g. a hosted        e.g. Elastic         e.g. Amazon EC2 — you
     email service        Beanstalk / RDS      pick the OS and patch it
```

- **IaaS (Infrastructure as a Service)** gives you the raw building blocks — virtual servers,
  storage, networks. You control the operating system and everything above it. **Amazon EC2** is
  IaaS.
- **PaaS (Platform as a Service)** manages the servers and OS for you so you can focus on your code
  or data. **AWS Elastic Beanstalk** and, in spirit, **Amazon RDS** (managed databases) are examples.
- **SaaS (Software as a Service)** is finished software you just use in a browser. Your webmail or a
  hosted help-desk tool is SaaS.

### Deployment models

- **Cloud** — everything runs on a cloud provider like AWS.
- **Hybrid** — some workloads run in the cloud and some stay in your own data center, connected
  together (common while migrating, or for data that must stay on-site).
- **On-premises** (sometimes called *private cloud* when virtualized) — you run everything in your
  own facility.

# Key Terminology

- **Cloud computing** — on-demand IT resources over the internet, billed pay-as-you-go.
- **AWS (Amazon Web Services)** — Amazon's cloud platform of 200+ services.
- **CapEx / OpEx** — large up-front purchase vs pay-for-what-you-use spending.
- **IaaS / PaaS / SaaS** — infrastructure, platform, and software service models.
- **On-demand** — provision resources immediately, without a purchase order or wait.
- **Elasticity** — scaling capacity up and down automatically as demand changes.
- **Deployment model** — where workloads run: cloud, hybrid, or on-premises.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Where to run | Own data center (on-prem) | Cloud (AWS) | Cloud for speed, elasticity, and no up-front hardware; on-prem for strict data-residency or existing sunk investment. Many use **hybrid**. |
| Service model | IaaS (EC2) | PaaS/SaaS (managed) | Managed services when you want less operational work; IaaS when you need full control of the OS and stack. |
| Spending | CapEx (buy servers) | OpEx (pay-as-you-go) | Pay-as-you-go avoids over-buying, but usage must be watched or costs drift — set budgets. |

# Worked Example

A small team wants to launch a website that might get a traffic spike after a launch announcement.

```text
On-premises path:  Estimate peak traffic → buy servers for the peak → wait weeks for delivery →
                   rack and configure them → hope the estimate was right → own idle hardware after.

AWS path:          Launch a couple of virtual servers in minutes → put them behind a load balancer →
                   let Auto Scaling add servers during the spike and remove them after →
                   pay only for the hours actually used.
```

The cloud path removes the up-front guess and the idle hardware. The trade-off is that costs are now
ongoing and usage-based, so the team must **monitor spending** — which is why later lessons cover
budgets and cost optimization.

# Real World Analogy

The cloud is like **electricity from a utility**. You don't build a power plant in your basement to
run a lamp — you plug into the grid and pay for the kilowatt-hours you use. AWS is the grid for
computing: you "plug in" to servers, storage, and databases, use as much as you need, and pay for
what you consumed. And just like electricity, leaving things switched on when you don't need them
still costs money.

# Examples

## Example 1 — Basic: naming the service model

You use a browser-based photo editor (SaaS), which was built by a company that deployed its code to a
managed platform (PaaS), which ultimately runs on virtual servers and storage (IaaS). The same photo
you edit touches all three layers — but *you* only interact with the SaaS at the top.

**Why this works:** the models stack. Knowing which layer you're operating at tells you what you're
responsible for managing.

## Example 2 — Real-world: matching capacity to demand

A retailer's traffic is ten times higher on a sale day than on a normal night. On-premises, they'd
buy hardware for the peak and let it sit idle the rest of the year. On AWS they scale out for the
sale and back in afterward, paying for the extra capacity only during the sale.

**Why this works:** elasticity turns a fixed cost (peak hardware) into a variable one (peak hours),
which is the core economic argument for the cloud.

## Example 3 — Pitfall: assuming the cloud is automatically cheaper

A team "lifts and shifts" an oversized always-on server to AWS unchanged, never turns it off, and is
surprised the bill is higher than expected. The cloud is only cheaper when you **right-size** and
**turn off what you don't use** — moving waste to the cloud just relocates the waste.

**Why this bites:** pay-as-you-go rewards efficiency and punishes idle resources; the cloud is a tool,
not a discount.

# Common Mistakes

- **Thinking "the cloud" is one thing.** It's a spectrum from raw servers (IaaS) to finished apps
  (SaaS); each level changes what you manage.
- **Assuming it's always cheaper.** Savings come from elasticity and right-sizing, not from the move
  itself.
- **Forgetting the ongoing bill.** OpEx never stops — unwatched resources quietly accrue cost.
- **Ignoring hybrid reality.** Many organizations keep some systems on-premises for years; it's not
  all-or-nothing.

# Best Practices

- Start by asking **which service model** fits: do you need OS control (IaaS) or less operational
  burden (managed/PaaS)?
- Prefer **pay-as-you-go** experiments over big commitments while you're learning.
- Turn resources **off** when idle, and plan to **monitor cost** from day one.
- Keep the **shared responsibility** idea in mind (next lessons): the cloud provider secures some
  things, and you secure others.

# Summary

- **Cloud computing** is on-demand IT resources over the internet with pay-as-you-go pricing; **AWS**
  is the largest such platform.
- The cloud turns **CapEx into OpEx** and lets you **stop guessing capacity** through elasticity.
- Services come as **IaaS, PaaS, and SaaS** — more provider management as you move up the stack.
- Deployment is **cloud, hybrid, or on-premises** — often a mix.
- Be **honest**: the cloud is powerful but only cheaper when you right-size and turn off idle
  resources.

# Flash Cards

Q: In one sentence, what is cloud computing?
A: The on-demand delivery of IT resources (compute, storage, databases, networking) over the internet with pay-as-you-go pricing.

Q: What is the difference between CapEx and OpEx in the cloud context?
A: CapEx is a large up-front purchase of hardware you own; OpEx is paying as you go for what you actually use, like a utility bill.

Q: How do IaaS, PaaS, and SaaS differ?
A: IaaS gives raw infrastructure you manage (e.g., EC2); PaaS manages the servers so you focus on code (e.g., Elastic Beanstalk); SaaS is finished software you just use.

Q: What are the three deployment models?
A: Cloud (all in a provider), hybrid (cloud plus on-premises connected together), and on-premises/private (your own data center).

Q: Why isn't moving to the cloud automatically cheaper?
A: Savings come from elasticity and right-sizing; an oversized, always-on resource moved unchanged just relocates the waste and can cost more.

Q: What does "elasticity" mean?
A: The ability to scale capacity up and back down automatically as demand changes, so you pay for peak capacity only when you need it.

# Exercises

### Easy
List three IT resources (for example, a server, a database, and file storage) and say, for each,
whether renting it on AWS would be IaaS, PaaS, or SaaS.

### Medium
Think of an app you use daily. Sketch which parts might be SaaS you interact with, and what kinds of
IaaS/PaaS resources could be running underneath. Note one thing that would be *your* responsibility
if you ran it yourself on IaaS.

### Challenging
Take a hypothetical always-on server that is busy only two hours a day. Describe how you would use
cloud **elasticity** to cut its cost, and name one risk of the cloud approach (hint: think about the
ongoing bill and monitoring).

# Further Reading

- AWS — *What is Cloud Computing?*: <https://aws.amazon.com/what-is-cloud-computing/>
- AWS — *Overview of Amazon Web Services* (whitepaper): <https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html>
- AWS — *Types of Cloud Computing* (IaaS/PaaS/SaaS): <https://aws.amazon.com/types-of-cloud-computing/>
- AWS — *AWS Free Tier*: <https://aws.amazon.com/free/>
