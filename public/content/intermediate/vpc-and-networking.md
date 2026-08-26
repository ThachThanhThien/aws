---
id: lesson-09
slug: vpc-and-networking
title: "VPC and Networking Fundamentals"
level: intermediate
order: 9
duration: 21
tags:
  - vpc
  - subnets
  - security-groups
  - network-acls
  - routing
summary: "How networking works on AWS — a VPC as your own isolated virtual network, subnets pinned to Availability Zones, route tables and internet/NAT gateways deciding what reaches the internet, and the crucial difference between stateful security groups and stateless network ACLs."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define a **VPC**, **subnet**, **route table**, **internet gateway**, and **NAT gateway**.
- Explain what makes a subnet **public** versus **private**.
- Contrast **security groups** (stateful) with **network ACLs** (stateless).
- Describe how outbound-only internet access works for private subnets.
- Sketch a simple, resilient two-tier network across AZs.

# Why It Matters

Every EC2 instance, database, and load balancer lives inside a **VPC** — your private slice of the AWS
network. Networking decisions determine what's reachable from the internet, what stays hidden, and how
traffic is filtered. Misunderstanding public vs private subnets or the stateful/stateless firewall
distinction leads to resources that are either broken or dangerously exposed.

# Concept Explanation

### The VPC

A **Virtual Private Cloud (VPC)** is your own **logically isolated virtual network** within an AWS
Region. It **spans all the AZs** in that Region. You define its private IP range with a **CIDR block**
(for example, `10.0.0.0/16`). Every account gets a **default VPC** per Region to start with.

### Subnets

A **subnet** is a slice of the VPC's IP range, and **each subnet lives in exactly one Availability
Zone**. You place resources into subnets. A subnet is **public** or **private** depending on its
routing:

- **Public subnet** — its route table sends internet-bound traffic to an **internet gateway (IGW)**,
  so resources with a public IP can be reached from and reach the internet.
- **Private subnet** — no route to an IGW, so its resources aren't directly reachable from the
  internet.

### Route tables and gateways

- A **route table** is a set of rules matching destination IP ranges to targets; each subnet is
  associated with one.
- An **internet gateway (IGW)** connects the VPC to the internet (needed by public subnets).
- A **NAT gateway** lets instances in a **private** subnet make **outbound** connections to the
  internet (say, to download updates) **without** being reachable from the internet inbound. It sits in
  a public subnet and the private subnet routes outbound traffic to it.

```text
VPC 10.0.0.0/16  (Region, spans AZs)
   ┌───────────────── AZ a ─────────────────┐   ┌──────────── AZ b ────────────┐
   │ Public subnet 10.0.1.0/24               │   │ Public subnet 10.0.3.0/24    │
   │   route: 0.0.0.0/0 → Internet Gateway   │   │   route: 0.0.0.0/0 → IGW     │
   │   [ load balancer ] [ NAT gateway ]     │   │   [ load balancer ]          │
   ├─────────────────────────────────────────┤   ├──────────────────────────────┤
   │ Private subnet 10.0.2.0/24              │   │ Private subnet 10.0.4.0/24   │
   │   route: 0.0.0.0/0 → NAT gateway        │   │   [ app / database ]         │
   │   [ app servers, database ]  (no inbound from internet)                     │
   └─────────────────────────────────────────┘   └──────────────────────────────┘
```

### Security groups vs network ACLs

Two firewall layers protect traffic, and they behave differently:

- **Security groups** are **stateful**, operate at the **instance / network-interface** level, and are
  **allow-only** (you list what's permitted; there are no deny rules). "Stateful" means if you allow an
  inbound request, the **response is automatically allowed** back out — you don't write a return rule.
- **Network ACLs (NACLs)** are **stateless**, operate at the **subnet** level, and support **both allow
  and deny** rules evaluated in **number order**. "Stateless" means you must **explicitly allow the
  return traffic** too, because each direction is judged on its own.

| | Security group | Network ACL |
| --- | --- | --- |
| Level | Instance / ENI | Subnet |
| State | Stateful (returns auto-allowed) | Stateless (must allow return) |
| Rules | Allow only | Allow and deny |
| Evaluation | All rules | In number order |

Most designs rely mainly on **security groups**; NACLs add a coarse subnet-level guardrail.

# Key Terminology

- **VPC** — your isolated virtual network in a Region, spanning its AZs.
- **CIDR block** — an IP range like `10.0.0.0/16` defining the VPC/subnet addresses.
- **Subnet** — a slice of the VPC in a single AZ; public or private by routing.
- **Route table** — rules mapping destination ranges to targets (IGW, NAT, local).
- **Internet gateway** — connects a VPC to the internet.
- **NAT gateway** — gives private-subnet resources outbound-only internet access.
- **Security group / NACL** — stateful instance firewall / stateless subnet firewall.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Where to place a database | Public subnet | Private subnet | Private — databases should not be internet-reachable; only the app tier talks to them. |
| Main traffic filter | Network ACLs | Security groups | Security groups for most rules (stateful, per-instance); NACLs as a coarse subnet-level guardrail. |
| Private outbound internet | Give instances public IPs | NAT gateway | NAT gateway keeps them unreachable inbound while allowing outbound updates. |

# Worked Example

Designing a resilient two-tier web app:

```text
1. VPC 10.0.0.0/16 in your Region.
2. Public subnets in AZ-a and AZ-b: route 0.0.0.0/0 → internet gateway. Put the load balancer here.
3. Private subnets in AZ-a and AZ-b: no IGW route. Put app servers and the database here.
4. Add a NAT gateway in a public subnet; private subnets route 0.0.0.0/0 → NAT for outbound updates.
5. Security groups: LB allows 443 from the internet; app allows 8080 only from the LB's security group;
   database allows 5432 only from the app's security group.
```

The internet only ever reaches the load balancer; the app and database stay private, span two AZs for
resilience, and can still fetch updates outbound through NAT.

# Real World Analogy

A VPC is like your own **private office campus** inside a city (the Region). **Subnets** are buildings,
each in one district (AZ). A **public subnet** is a building with a street entrance (the internet
gateway); a **private subnet** is one with no public door. A **NAT gateway** is the mailroom: staff can
send letters out to the world, but outsiders can't walk in through it. A **security group** is a
personal assistant at each desk who remembers who you invited and lets their reply straight through
(stateful). A **network ACL** is a guard at the building entrance checking a numbered rulebook, with no
memory of earlier visitors (stateless).

# Examples

## Example 1 — Basic: public vs private by routing

Two subnets have identical instances. Subnet A's route table sends `0.0.0.0/0` to an internet gateway;
Subnet B's does not. Subnet A is **public**; Subnet B is **private** — the only difference is the
route.

**Why this works:** "public" isn't a checkbox on the subnet; it's whether a route to the internet
gateway exists.

## Example 2 — Real-world: locking a database away

An app's database sits in a private subnet, and its security group allows the database port **only from
the app servers' security group** — not from any IP. Even inside the VPC, nothing but the app tier can
reach it, and the internet can't reach it at all.

**Why this works:** referencing another security group as the source ties access to a role, not a
fragile IP list, and the private subnet blocks internet exposure.

## Example 3 — Pitfall: forgetting NACLs are stateless

A team adds a network ACL that allows inbound traffic but forgets to allow the **outbound ephemeral
ports** for the responses. Connections hang, because NACLs don't auto-allow return traffic the way
security groups do.

**Why this bites:** stateless means every direction must be permitted explicitly; the mental model from
security groups doesn't carry over.

# Common Mistakes

- **Putting databases in public subnets.** Keep data tiers private; expose only the load balancer.
- **Assuming NACLs are stateful.** They aren't — you must allow return traffic in both directions.
- **Opening security groups to `0.0.0.0/0`.** Scope sources to specific IPs or other security groups.
- **Forgetting subnets are per-AZ.** For resilience you need subnets in **multiple** AZs.

# Best Practices

- Use **private subnets** for app and data tiers; put only internet-facing pieces (load balancers) in
  **public** subnets.
- Prefer **security groups** referencing other security groups over hard-coded IP ranges.
- Spread subnets across **at least two AZs** for high availability.
- Give private resources outbound internet via a **NAT gateway**, not public IPs.

# Summary

- A **VPC** is your isolated network in a Region; **subnets** slice it and each lives in **one AZ**.
- A subnet is **public** if its route table points internet traffic at an **internet gateway**;
  otherwise it's **private**. A **NAT gateway** gives private subnets **outbound-only** internet.
- **Security groups** are **stateful, instance-level, allow-only**; **network ACLs** are **stateless,
  subnet-level, allow and deny in order** — and you must allow return traffic on a NACL.
- Keep data tiers **private**, scope firewall rules tightly, and span **multiple AZs**.

# Flash Cards

Q: What is a VPC, and what is its scope?
A: A Virtual Private Cloud — your isolated virtual network within an AWS Region that spans all the Availability Zones in that Region.

Q: What makes a subnet public rather than private?
A: A public subnet's route table sends internet-bound traffic (0.0.0.0/0) to an internet gateway; a private subnet has no such route.

Q: What is the difference between a security group and a network ACL?
A: Security groups are stateful, act at the instance level, and are allow-only; network ACLs are stateless, act at the subnet level, and support both allow and deny rules evaluated in order.

Q: Why must you add return rules for a network ACL but not a security group?
A: NACLs are stateless, so each direction is evaluated independently and you must allow the response explicitly; security groups are stateful and auto-allow the return traffic.

Q: How do resources in a private subnet reach the internet for updates?
A: Through a NAT gateway, which allows outbound connections while keeping the resources unreachable from the internet inbound.

Q: In how many AZs does a single subnet exist?
A: Exactly one — a subnet lives in a single Availability Zone, so you create subnets in multiple AZs for high availability.

# Exercises

### Easy
Given two subnets, one whose route table has `0.0.0.0/0 → internet gateway` and one that doesn't, label
each public or private and explain why in one sentence.

### Medium
Write a short comparison of security groups and network ACLs covering level, statefulness, and whether
they support deny rules.

### Challenging
Design a two-tier app network: describe your subnets (public/private, across AZs), where the load
balancer, app servers, and database go, how private servers get outbound internet, and the
security-group rules that keep the database reachable only from the app tier.

# Further Reading

- AWS — *What is Amazon VPC?*: <https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html>
- AWS — *Subnets for your VPC*: <https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html>
- AWS — *Security groups*: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html>
- AWS — *Network ACLs*: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html>
