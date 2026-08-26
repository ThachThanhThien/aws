---
id: lesson-17
slug: dns-and-content-delivery
title: "DNS and Content Delivery: Route 53 and CloudFront"
level: advanced
order: 17
duration: 20
tags:
  - route-53
  - cloudfront
  - dns
  - cdn
  - latency
summary: "How users reach your app fast — Amazon Route 53 as managed DNS with routing policies and health-check failover, and Amazon CloudFront as a content delivery network that caches content at edge locations near users to cut latency and offload the origin."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **DNS** does and what **Amazon Route 53** adds beyond basic resolution.
- Describe Route 53 **routing policies** and **health-check failover**.
- Explain how a **CDN** like **Amazon CloudFront** reduces latency and origin load.
- Identify common CloudFront **origins** and benefits (TLS, caching, protection).
- Combine Route 53 and CloudFront to serve a global audience.

# Why It Matters

Two things sit between a user typing your domain and seeing your page: **DNS** (turning the name into an
address) and **content delivery** (getting bytes to them quickly wherever they are). Route 53 and
CloudFront are AWS's answers. They cut latency, absorb traffic spikes, add resilience through failover,
and reduce load on your servers — foundational for any app with a real audience.

# Concept Explanation

### DNS and Route 53

The **Domain Name System (DNS)** translates human-friendly names (`example.com`) into IP addresses.
**Amazon Route 53** is AWS's **managed DNS** service (a **global** service, named for DNS's port 53). It
also handles **domain registration** and **health checks**. You manage records in a **hosted zone**:

- Standard record types: **A** (IPv4), **AAAA** (IPv6), **CNAME** (alias to another name), **MX**
  (mail), **TXT**, and more.
- **Alias records** — a Route 53 feature that points a name (even the zone apex, like `example.com`)
  directly at AWS resources such as a **CloudFront distribution**, **load balancer**, or **S3 website**,
  at no extra query cost.

### Routing policies

Route 53 can decide **which answer** to return based on a **routing policy**:

- **Simple** — one record, one answer.
- **Weighted** — split traffic by percentage (useful for A/B or gradual rollouts).
- **Latency-based** — send users to the Region that gives them the **lowest latency**.
- **Failover** — return a primary, but switch to a secondary when a **health check** fails (for HA/DR).
- **Geolocation / geoproximity** — route by the user's location.
- **Multivalue answer** — return several healthy records.

Health checks make failover and multivalue routing **fault-aware**, so DNS steers users away from
unhealthy endpoints.

### Content delivery with CloudFront

**Amazon CloudFront** is a **content delivery network (CDN)**: it **caches content at edge locations**
around the world so requests are served from a site **near the user** instead of traveling to your
origin every time. This **cuts latency** and **offloads the origin**. Key points:

- **Origins** — where CloudFront fetches content: an **S3 bucket**, an **ALB/EC2**, or any HTTP server.
- **Caching** — frequently requested objects are cached at the edge (controlled by TTLs and cache
  behaviors); you can **invalidate** cached objects when content changes.
- **Security & features** — **HTTPS/TLS** termination, **AWS Shield** DDoS protection, **geo-
  restriction**, **signed URLs/cookies** for private content, and **edge functions** (CloudFront
  Functions / Lambda@Edge) to run logic close to users.

```text
   user ──► Route 53 (resolve example.com, choose best/healthy target)
              │
              ▼
        CloudFront edge (nearest location; serve from cache if present)
              │  cache miss
              ▼
        Origin: S3 bucket  or  ALB → app servers
```

# Key Terminology

- **DNS** — the system translating domain names into IP addresses.
- **Route 53** — AWS's managed DNS, domain registration, and health-check service (global).
- **Hosted zone** — the container for a domain's DNS records.
- **Alias record** — a Route 53 record pointing a name at an AWS resource (works at the zone apex).
- **Routing policy** — the rule choosing which DNS answer to return (weighted, latency, failover…).
- **CloudFront** — a CDN caching content at edge locations near users.
- **Origin** — the source CloudFront fetches content from (S3, ALB, any HTTP server).

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Route users globally | Latency-based routing | Geolocation routing | Latency for speed; geolocation when you must serve region-specific content or comply with rules. |
| Point apex at a load balancer | CNAME (not allowed at apex) | Route 53 **alias** | Use an alias — CNAMEs can't sit at the zone apex, aliases can, and they're free. |
| Serve static assets | Directly from origin | Through CloudFront | CloudFront for global speed and to offload the origin; direct only for tiny/internal cases. |
| Resilience | Single endpoint | Failover routing + health checks | Failover routing for DR — DNS steers away from an unhealthy primary. |

# Worked Example

Serving a global website fast and resiliently:

```text
1. Store static assets in S3; run the dynamic API behind an ALB across two AZs.
2. Put CloudFront in front: static paths cached from S3, API paths forwarded to the ALB origin.
3. In Route 53, create an alias record for example.com → the CloudFront distribution.
4. Add latency-based or failover routing if you run multiple Regions, with health checks.
Result: users hit the nearest edge, static content is cached (low latency, less origin load), TLS is
terminated at the edge, and DNS can steer around a failed Region.
```

# Real World Analogy

Route 53 is a **smart phone directory with a receptionist**: it not only looks up the number for a name,
it can connect your call to the **nearest** office (latency routing), split calls across branches
(weighted), or reroute to a backup office when one isn't answering (failover with health checks).
CloudFront is a network of **local warehouses**: instead of shipping every order from one central depot,
popular items are stocked at a warehouse near each city (edge location), so delivery is fast and the
central depot (origin) isn't overwhelmed.

# Examples

## Example 1 — Basic: alias at the apex

You want `example.com` (the apex) to point at a CloudFront distribution. A CNAME can't live at the apex,
so you create a Route 53 **alias** record instead, which resolves directly to the distribution.

**Why this works:** alias records are an AWS-specific answer to the apex/CNAME limitation and cost
nothing per query.

## Example 2 — Real-world: a traffic spike absorbed at the edge

A news story goes viral. Because the article's assets are cached in CloudFront, the vast majority of
requests are served from edge locations, and only a trickle reaches the origin. The site stays fast and
the servers stay calm.

**Why this works:** caching at the edge turns a spike into cache hits, protecting the origin and cutting
latency.

## Example 3 — Pitfall: forgetting to invalidate the cache

A team deploys new site content but users keep seeing the old version, because CloudFront is still
serving the cached objects until their TTL expires. Creating an **invalidation** (or versioning the
asset filenames) fixes it.

**Why this bites:** caching is why CDNs are fast, but stale content persists until TTL or an
invalidation — you must plan cache busting on deploys.

# Common Mistakes

- **Trying to CNAME the zone apex.** Use a Route 53 **alias** record instead.
- **Skipping the CDN for a global audience.** Serving everything from one origin is slow and fragile.
- **Forgetting cache invalidation.** New deploys can serve stale cached content until TTL.
- **Failover without health checks.** Failover routing needs health checks to know when to switch.

# Best Practices

- Front web content with **CloudFront** for global latency wins and origin offload; use **HTTPS**.
- Use **alias** records for AWS targets and pick a **routing policy** that matches your goal
  (latency/failover/weighted).
- Attach **health checks** so DNS failover actually detects outages.
- Plan **cache behavior** and **invalidation** (or versioned filenames) for deploys, and use **signed
  URLs** for private content.

# Summary

- **DNS** maps names to addresses; **Route 53** is AWS's global managed DNS with **routing policies**
  (simple, weighted, latency, failover, geolocation) and **health-check failover**.
- **Alias records** let you point even the zone apex at AWS resources like CloudFront or a load
  balancer.
- **CloudFront** is a **CDN** that caches content at **edge locations** near users, cutting **latency**
  and **offloading the origin**, with TLS, DDoS protection, and signed URLs.
- Together they deliver a **fast, resilient, global** front end; remember to handle **cache
  invalidation** on deploys.

# Flash Cards

Q: What does Amazon Route 53 do beyond basic DNS resolution?
A: It provides managed, highly available DNS plus domain registration, health checks, and routing policies (weighted, latency-based, failover, geolocation) — it's a global service.

Q: What is a Route 53 alias record, and why is it useful?
A: A record that points a name — including the zone apex — directly at an AWS resource like CloudFront or a load balancer, which a CNAME can't do at the apex, at no per-query cost.

Q: How does a CDN like CloudFront reduce latency?
A: It caches content at edge locations near users, so requests are served from a nearby site instead of traveling to the origin, which also offloads the origin.

Q: What can be a CloudFront origin?
A: An S3 bucket, an Application Load Balancer or EC2, or any HTTP server — CloudFront fetches from the origin on a cache miss.

Q: Which Route 53 routing policy sends users to the endpoint that gives them the lowest latency?
A: Latency-based routing; failover routing (with health checks) switches to a secondary when the primary is unhealthy.

Q: Why might users see stale content after a deploy through CloudFront?
A: Because cached objects are served until their TTL expires; you must create an invalidation or use versioned filenames to force the new content.

# Exercises

### Easy
Explain in one sentence what DNS does, and name one thing Route 53 adds beyond plain name resolution.

### Medium
Describe how CloudFront reduces both latency for users and load on your origin, using the warehouse
analogy or your own.

### Challenging
Design the front end for a global site: where static and dynamic content live, how CloudFront is
configured, what Route 53 record and routing policy you'd use, and how you'd handle showing fresh
content after each deploy.

# Further Reading

- AWS — *What is Amazon Route 53?*: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html>
- AWS — *Choosing a routing policy*: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html>
- AWS — *What is Amazon CloudFront?*: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html>
- AWS — *Invalidating files*: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html>
