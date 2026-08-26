---
id: lesson-02
slug: aws-global-infrastructure
title: "AWS Global Infrastructure"
level: beginner
order: 2
duration: 18
tags:
  - regions
  - availability-zones
  - edge-locations
  - high-availability
  - latency
summary: "How AWS is laid out physically — Regions as isolated geographic areas, Availability Zones as isolated groups of data centers inside a Region, edge locations for content delivery — and how to choose a Region based on latency, cost, compliance, and service availability."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define **Region**, **Availability Zone (AZ)**, and **edge location** and how they nest.
- Explain why spreading a workload across **multiple AZs** gives high availability.
- Tell apart **Regional** and **global** services.
- Choose a Region using **latency, cost, compliance, and service availability**.
- Avoid the trap of assuming data is **automatically** copied between Regions.

# Why It Matters

AWS runs real hardware in real buildings around the world, and *where* your resources live changes
their speed, their price, the laws that apply to them, and how a failure affects your users. Almost
every service asks you to pick a Region, and many resilient designs depend on using several
Availability Zones. Understanding this layout is the difference between an app that survives a data
center outage and one that vanishes with it.

# Concept Explanation

### Regions

An **AWS Region** is a separate **geographic area** — for example, `us-east-1` (Northern Virginia) or
`eu-west-1` (Ireland). Each Region is **isolated** from the others: by default your resources and data
stay in the Region you chose and are **not** copied elsewhere unless you set that up. AWS operates
Regions on every populated continent, and the exact count grows over time (so treat any specific
number as "as of writing").

### Availability Zones

Inside each Region are multiple **Availability Zones (AZs)** — for example `us-east-1a`,
`us-east-1b`, `us-east-1c`. An AZ is **one or more discrete data centers** with redundant power,
networking, and cooling. AZs in a Region are physically separated (far enough apart to avoid a shared
disaster, close enough for low-latency links) and **isolated** so that a failure in one AZ does not
take down another. A Region generally has **three or more** AZs.

```text
Region: us-east-1 (N. Virginia)
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │  AZ us-east-1a│   │  AZ us-east-1b│   │  AZ us-east-1c│
   │  [data center]│   │  [data center]│   │  [data center]│
   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
           └──── low-latency, private links ────────┘
   Put copies of your app in 1a AND 1b → one AZ failing doesn't take you down.
```

Because AZs fail independently, the core rule of resilient AWS design is: **run in at least two AZs**.

### Edge locations

**Edge locations** are a separate, much larger set of sites that cache content close to users for
**Amazon CloudFront** (a content delivery network) and answer DNS for **Amazon Route 53**. They are
about **speed of delivery**, not running your servers — you don't launch EC2 instances in an edge
location.

### Regional vs global services

Most services are **Regional** — an EC2 instance, a VPC, an RDS database, and S3 **object data** all
live in one Region. A few services are **global**: **IAM**, **Route 53**, **CloudFront**, and **AWS
Organizations** are not tied to a single Region. **Amazon S3 bucket names are globally unique**, but
each bucket's data still lives in the Region you picked.

### Choosing a Region

Four questions decide it:

- **Latency** — pick a Region near your users so requests travel less distance.
- **Cost** — prices differ by Region; the same resource can cost more in one Region than another.
- **Compliance / data residency** — laws may require data to stay in a particular country.
- **Service availability** — the newest services appear in some Regions before others; confirm your
  service exists in your Region.

# Key Terminology

- **Region** — an isolated geographic area (e.g., `eu-west-1`) containing multiple AZs.
- **Availability Zone (AZ)** — one or more isolated data centers within a Region.
- **Edge location** — a CloudFront/Route 53 site that caches content near users.
- **Local Zone** — an AWS site that places compute closer to a specific metro for very low latency.
- **Regional service** — a service scoped to one Region (EC2, VPC, RDS).
- **Global service** — a service not tied to a Region (IAM, Route 53, CloudFront).
- **High availability (HA)** — designing so the loss of one component (like an AZ) doesn't cause an outage.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| How many AZs | One AZ | Two or more AZs | Two or more AZs for anything that must stay up — a single AZ is a single point of failure. |
| Where to deploy | One Region | Multiple Regions | One Region is simpler and cheaper; multiple Regions add global latency wins and disaster recovery, at real complexity and cost. |
| Region pick | Closest to you | Closest to your users / required by law | Optimize for your **users'** latency and any **compliance** rules, not your own location. |

# Worked Example

You're hosting an app for users in Germany and must keep their data in the EU.

```text
Compliance:  EU data-residency law → choose an EU Region, e.g. eu-central-1 (Frankfurt).
Latency:     Frankfurt is close to German users → fast responses.
Resilience:  Deploy the app across eu-central-1a and eu-central-1b (two AZs).
Delivery:    Front static assets with CloudFront so edge locations cache them near every user.
Result:      Low latency, legally compliant, and able to survive one AZ failing.
```

Notice the Region choice was driven by **law and users**, and resilience came from **multiple AZs**,
not from a single bigger data center.

# Real World Analogy

Think of AWS like a global **airline network**. A **Region** is a city with an airport hub; the
hubs operate independently, so weather in one city doesn't ground another. An **Availability Zone** is
a separate terminal within that hub — if one terminal has a power cut, flights shift to another
terminal in the same city. **Edge locations** are like local ticket kiosks scattered around town: they
don't fly planes, they just get you served faster and closer to home.

# Examples

## Example 1 — Basic: reading a Region and AZ name

The identifier `ap-southeast-2b` breaks down as: `ap-southeast-2` is the Region (Asia Pacific,
Sydney), and the trailing `b` marks a specific Availability Zone within it. Resources launched here
live in that Region and that AZ.

**Why this works:** the naming encodes geography and zone, so you can tell at a glance where something
runs.

## Example 2 — Real-world: surviving a data center outage

A web app runs identical servers in `us-east-1a` and `us-east-1b` behind a load balancer. When `1a`
has an outage, the load balancer sends all traffic to the healthy servers in `1b`, and users barely
notice. The same app in a single AZ would have gone fully offline.

**Why this works:** AZs fail independently, so spreading across them removes the single point of
failure.

## Example 3 — Pitfall: assuming Regions replicate automatically

A team stores backups only in `us-east-1` and assumes AWS mirrors them to another Region "just in
case." It doesn't. When they need a cross-Region copy for disaster recovery, there is none, because
**cross-Region replication is something you configure** — it never happens by default.

**Why this bites:** Region isolation protects you from a bad blast radius, but it also means *you* are
responsible for any geographic redundancy.

# Common Mistakes

- **Confusing an AZ with a Region.** A Region contains multiple AZs; deploying to "a Region" still
  means choosing how many AZs to use.
- **Running in one AZ for production.** That reintroduces the single point of failure the cloud lets
  you avoid.
- **Assuming global reach for Regional services.** An EC2 instance in Tokyo isn't visible from the
  Ireland Region's console view.
- **Expecting automatic cross-Region copies.** Data stays in its Region unless you replicate it.

# Best Practices

- Choose a Region by your **users' latency, cost, and compliance** — not by where you happen to sit.
- Design production workloads to span **at least two AZs**.
- Confirm your **services and features exist** in the Region before committing.
- If you need geographic disaster recovery, **explicitly plan** cross-Region backups or replication.

# Summary

- A **Region** is an isolated geographic area; inside it are multiple **Availability Zones**, each one
  or more isolated data centers.
- **Edge locations** cache content for CloudFront/Route 53 — they deliver, they don't host your
  servers.
- Most services are **Regional**; **IAM, Route 53, CloudFront, and Organizations** are **global**.
- **High availability** comes from spreading across **multiple AZs**.
- Data **stays in its Region** unless you set up cross-Region replication.

# Flash Cards

Q: What is an AWS Region?
A: A separate, isolated geographic area (like eu-west-1) that contains multiple Availability Zones; your data stays there by default.

Q: What is an Availability Zone?
A: One or more discrete, isolated data centers within a Region, with redundant power and networking, connected to other AZs by low-latency links.

Q: Why deploy across multiple Availability Zones?
A: AZs fail independently, so running in two or more removes the single point of failure and keeps the app available if one AZ goes down.

Q: What are edge locations used for?
A: Caching and delivering content close to users for Amazon CloudFront and answering DNS for Route 53 — not for running your servers.

Q: Name services that are global rather than Regional.
A: IAM, Route 53, CloudFront, and AWS Organizations are global; most others (EC2, VPC, RDS, and S3 object data) are Regional.

Q: Is your data automatically copied to another Region for safety?
A: No — Regions are isolated and data stays put; cross-Region replication or backups must be configured on purpose.

# Exercises

### Easy
Write down the Region you would choose for an app whose users are all in Japan, and explain your
choice in one sentence using latency as the reason.

### Medium
Given the identifiers `us-west-2`, `us-west-2a`, and a CloudFront edge location, label each as a
Region, an Availability Zone, or an edge location, and say what each is for.

### Challenging
Your app currently runs in a single AZ. Describe the changes needed to make it survive both (a) one
AZ failing and (b) an entire Region failing, and note which of the two is more complex and costly, and
why.

# Further Reading

- AWS — *Global Infrastructure*: <https://aws.amazon.com/about-aws/global-infrastructure/>
- AWS — *Regions and Availability Zones* (EC2 User Guide): <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html>
- AWS General Reference — *Regions and endpoints*: <https://docs.aws.amazon.com/general/latest/gr/rande.html>
- AWS Well-Architected — *Reliability pillar*: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html>
