---
id: lesson-07
slug: ec2-fundamentals
title: "Amazon EC2 Fundamentals"
level: beginner
order: 7
duration: 20
tags:
  - ec2
  - compute
  - ami
  - instance-types
  - security-groups
summary: "Amazon EC2 as rentable virtual servers — the pieces you choose when launching one (AMI, instance type, key pair, security group, storage), how instances start, stop, and terminate, how you connect to them, and the fact that on EC2 you patch the operating system."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **Amazon EC2** is and why it's the classic IaaS compute service.
- Identify the pieces of a launch: **AMI, instance type, key pair, security group, storage**.
- Describe the **instance lifecycle** and the difference between **stop** and **terminate**.
- Choose a safe way to **connect** to an instance.
- Remember that **you patch the OS** on EC2 (shared responsibility).

# Why It Matters

**EC2** is where "renting a server in the cloud" becomes concrete. It's the first hands-on service most
people meet, and the ideas here — images, instance sizes, firewalls, key pairs — reappear everywhere.
Getting the launch pieces right (and knowing stop vs terminate) prevents both security mistakes and
surprise costs.

# Concept Explanation

### What EC2 is

**Amazon Elastic Compute Cloud (EC2)** provides **virtual servers**, called **instances**, that you
rent by the second/hour. It's **Infrastructure as a Service**: you choose the operating system and
size, and **you** manage the OS, patches, and applications on it (AWS manages the physical host
underneath). Instances run in a Region and a specific Availability Zone.

### The pieces you choose when launching

- **AMI (Amazon Machine Image)** — the **template** an instance boots from: an operating system (e.g.,
  Amazon Linux, Ubuntu, Windows) plus any preinstalled software. AWS, the community, and the
  Marketplace provide AMIs, and you can make your own.
- **Instance type** — the **hardware profile**: how many virtual CPUs, how much memory, and network
  performance. Types are grouped into families — **general purpose** (`t`, `m`), **compute optimized**
  (`c`), **memory optimized** (`r`, `x`), **storage optimized**, and **accelerated/GPU** (`p`, `g`).
  A name like `t3.micro` reads as family `t3`, size `micro`.
- **Key pair** — for **SSH** login on Linux. AWS keeps the **public** key; **you** download and keep
  the **private** key (a `.pem` file). Lose the private key and you can't SSH in the normal way.
- **Security group** — a **virtual firewall** attached to the instance controlling **inbound** and
  **outbound** traffic. It's **stateful** and **allow-only** (more on this in the networking lesson).
- **Storage** — usually an **EBS volume** as the root disk (persistent network storage; covered next
  tier). Optional **user data** is a script that runs at first boot to configure the instance.

```text
Launch wizard, in order:
   choose AMI  →  pick instance type  →  select key pair  →  set network + security group  →
   size the storage  →  (optional) add user-data script  →  Launch
```

### The instance lifecycle

An instance moves through states: **pending → running → stopping → stopped → terminated** (plus
**reboot**). Two actions are commonly confused:

- **Stop** — shuts down the OS; **compute charges stop**, but the **EBS volume persists** (and still
  costs a little). You can start it again later; its data survives.
- **Terminate** — permanently deletes the instance; by default its root EBS volume is deleted too.
  This is irreversible.

### Connecting to an instance

- **SSH** to a Linux instance using your private key: `ssh -i key.pem ec2-user@<public-ip>` — this
  requires the security group to allow inbound port 22 from your address.
- **AWS Systems Manager Session Manager** is often better: it gives you a shell through IAM **without
  opening SSH or managing keys**, which is more secure.

```bash
# List your instances and see their state and public IP.
aws ec2 describe-instances --output table

# Stop an instance (keeps its EBS data; stops compute billing).
aws ec2 stop-instances --instance-ids i-0123456789abcdef0
```

# Key Terminology

- **EC2 instance** — a virtual server you rent, running in one AZ.
- **AMI** — the image (OS + software) an instance launches from.
- **Instance type** — the hardware profile (vCPU, memory) like `t3.micro`.
- **Key pair** — SSH keys; AWS keeps the public key, you keep the private key.
- **Security group** — a stateful, allow-only virtual firewall on the instance.
- **User data** — a startup script that runs when the instance first boots.
- **Stop vs terminate** — pause (keep data) vs permanently delete.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Connecting | SSH with a key pair | Session Manager (no open SSH) | Session Manager avoids exposing port 22 and managing keys — prefer it for security. |
| Pausing work | Stop | Terminate | Stop to keep the data and resume later; terminate only when you're truly done. |
| Sizing | Guess big to be safe | Right-size for the workload | Start small (Free Tier `t3.micro`) and scale up; oversizing wastes money. |

# Worked Example

Launching a small Linux web server for practice, on the Free Tier:

```text
AMI:            Amazon Linux (Free-Tier eligible)
Instance type:  t3.micro (Free-Tier eligible: 750 hours/month for 12 months, as of writing)
Key pair:       create one; download and safely store the .pem private key
Security group: allow inbound 22 (SSH) from *your* IP only, and 80 (HTTP) if serving a page
Storage:        default small EBS root volume
User data:      a short script to install and start a web server
Launch → connect via SSH or Session Manager → when done for the day, STOP it to pause charges.
```

Note the security group only opens SSH to **your** IP — not the whole internet — and you **stop** the
instance to avoid paying while it's idle.

# Real World Analogy

EC2 is like a **giant computer-rental shop**. The **AMI** is the disk image you ask them to load
(Windows or Linux, with your software preinstalled). The **instance type** is the model you rent — a
light laptop or a workstation with lots of RAM. The **key pair** is the key to that machine's lock.
The **security group** is the shop's guest list saying who may approach which door (port). And you can
**park** the machine overnight (stop) or **hand it back** for good (terminate).

# Examples

## Example 1 — Basic: reading an instance type

`m5.large` means the general-purpose `m5` family at the `large` size — a balanced mix of CPU and
memory. `c7g.xlarge` is a compute-optimized family for CPU-heavy work. The family tells you the
*balance*; the size tells you *how much*.

**Why this works:** the naming encodes both the workload fit (family) and the scale (size), so you can
compare options quickly.

## Example 2 — Real-world: a script that configures itself

A team launches instances with a **user-data** script that installs their web server and pulls the
latest app on first boot. Every new instance comes up fully configured with no manual steps.

**Why this works:** user data turns a blank server into a ready one automatically, which is the seed of
auto-scaling later.

## Example 3 — Pitfall: opening SSH to the world

Someone sets the security group to allow port 22 from `0.0.0.0/0` (anywhere) to "make it work." Now
every bot on the internet can attempt to log in. Restricting it to their own IP — or using Session
Manager — closes that exposure.

**Why this bites:** an instance's security group is its front-line firewall; opening admin ports to the
whole internet invites attacks.

# Common Mistakes

- **Opening ports too widely.** Limit SSH/RDP to known IPs, or avoid them with Session Manager.
- **Confusing stop and terminate.** Terminate is permanent and (by default) deletes the root volume.
- **Losing the private key.** Without it you can't SSH in the usual way — store it safely.
- **Forgetting you own the OS.** On EC2 *you* must patch the operating system (shared responsibility).

# Best Practices

- Use **Session Manager** or tightly scoped security-group rules for access; never open admin ports to
  `0.0.0.0/0`.
- **Right-size** and **stop** idle instances; terminate what you no longer need.
- Configure instances with **user data** (or images) so setup is repeatable.
- **Attach an IAM role** (instead of storing keys) for the instance to call AWS services, and **patch
  the OS** regularly.

# Summary

- **EC2** rents **virtual servers (instances)**; it's IaaS, so **you manage the OS**.
- A launch combines an **AMI** (image), an **instance type** (hardware), a **key pair** (SSH), a
  **security group** (firewall), and **storage** — with optional **user data**.
- **Stop** keeps the EBS data and pauses compute charges; **terminate** permanently deletes.
- Prefer **Session Manager** or scoped security groups over opening admin ports to the world.

# Flash Cards

Q: What is Amazon EC2?
A: A service that rents virtual servers (instances) in the cloud; it's IaaS, so you choose the OS and size and are responsible for patching the OS.

Q: What is an AMI?
A: An Amazon Machine Image — the template (operating system plus preinstalled software) that an EC2 instance boots from.

Q: What does an instance type like t3.micro tell you?
A: The family (t3, its CPU/memory balance and workload fit) and the size (micro, how much capacity) of the virtual hardware.

Q: What is the difference between stopping and terminating an instance?
A: Stopping shuts it down but keeps its EBS data and lets you start it again; terminating permanently deletes it (and, by default, its root volume).

Q: Who holds which half of an EC2 key pair?
A: AWS keeps the public key on the instance; you download and keep the private key (.pem), which you need to SSH in.

Q: Why prefer Session Manager over opening SSH port 22?
A: Session Manager gives shell access through IAM without exposing port 22 or managing SSH keys, reducing the attack surface.

# Exercises

### Easy
List, in order, the pieces you choose when launching an EC2 instance (image, hardware, login, firewall,
storage).

### Medium
Explain the difference between stopping and terminating an instance, and give one situation where each
is the right choice.

### Challenging
You need a practice web server but want to avoid both security risks and surprise charges. Describe the
security-group rules you'd set, how you'd connect, and what you'd do with the instance when you're not
using it — and justify each choice.

# Further Reading

- AWS — *What is Amazon EC2?*: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html>
- AWS — *Amazon EC2 instance types*: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html>
- AWS — *Amazon Machine Images (AMI)*: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html>
- AWS — *Connect using Session Manager*: <https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html>
