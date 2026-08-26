---
id: lesson-08
slug: s3-fundamentals
title: "Amazon S3 Fundamentals"
level: beginner
order: 8
duration: 19
tags:
  - s3
  - object-storage
  - buckets
  - durability
  - security
summary: "Amazon S3 as object storage — buckets with globally unique names holding unlimited objects addressed by key, its eleven-nines durability versus its availability, the private-by-default and encrypted-by-default security posture, and the basic operations for putting and getting data."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **object storage** is and how S3 differs from a filesystem or block storage.
- Define **bucket**, **object**, and **key**, and note that bucket names are **globally unique**.
- Distinguish **durability** from **availability** and quote S3's design goals correctly.
- Describe S3's **secure defaults**: private buckets, Block Public Access, default encryption.
- Perform basic operations conceptually (put, get, list, delete).

# Why It Matters

**S3** is the storage backbone of AWS — websites' assets, application backups, logs, data lakes, and
more live there. It's cheap, effectively unlimited, and extremely durable. But it's also the service
most often *misconfigured* into a public data leak, so understanding its model and its safe defaults is
both a foundational skill and a security essential.

# Concept Explanation

### Object storage, not a filesystem

**Amazon Simple Storage Service (S3)** is **object storage**. You store whole **objects** (files plus
metadata) and retrieve them by name over HTTP(S). This is different from:

- a **filesystem** (folders and partial edits), and
- **block storage** (like EBS, a raw disk you attach to one server).

S3 has a **flat** structure: those "folders" you see are just **prefixes** in the object's name.

### Buckets, objects, and keys

- A **bucket** is a container for objects. Its **name is globally unique across all AWS accounts** and
  must be DNS-compliant. You create a bucket **in a Region**, and its data **stays in that Region**.
- An **object** is a stored item — up to **5 TB** each — plus metadata. A bucket holds an **unlimited**
  number of objects.
- A **key** is the object's full name within the bucket (e.g., `reports/2026/q1.csv`). Bucket + key
  uniquely identifies an object.

```text
Bucket:  my-app-bucket   (globally unique, lives in one Region)
   ├── index.html                     ← key: "index.html"
   ├── images/logo.png                ← key: "images/logo.png"   ("images/" is just a prefix)
   └── reports/2026/q1.csv            ← key: "reports/2026/q1.csv"
```

### Durability vs availability

These are different promises, and mixing them up is a classic error:

- **Durability** = the chance your data **survives** (isn't lost). S3 Standard is designed for
  **99.999999999% — "eleven nines" — durability**, by storing copies across multiple devices and
  facilities within the Region.
- **Availability** = the chance you can **access** it right now. S3 Standard targets **99.99%
  availability**, which is high but a smaller number than durability.

So S3 almost never *loses* your data, and is *reachable* the vast majority of the time — related but
distinct guarantees.

### Secure by default

Modern S3 defaults are safe:

- New buckets are **private**, and **S3 Block Public Access is on** — public access requires
  deliberate action.
- **New objects are encrypted at rest by default** (server-side encryption with S3-managed keys,
  SSE-S3).
- Access is granted through **IAM policies**, **bucket policies** (resource-based), and **presigned
  URLs** for temporary, time-limited access. (Legacy ACLs are disabled by default.)

S3 also provides **strong read-after-write consistency**: right after you write or overwrite an
object, a read returns the latest version.

### Basic operations

```bash
aws s3 mb s3://my-app-bucket                 # make (create) a bucket
aws s3 cp report.csv s3://my-app-bucket/     # upload (put) an object
aws s3 ls s3://my-app-bucket/                # list objects
aws s3 cp s3://my-app-bucket/report.csv .    # download (get) an object
```

# Key Terminology

- **Object storage** — storing whole objects retrieved by name, not a filesystem or block device.
- **Bucket** — a container for objects with a globally unique, Region-bound name.
- **Object** — a stored item (up to 5 TB) plus metadata.
- **Key** — the object's full name within its bucket.
- **Durability** — the likelihood data survives (S3 Standard: eleven nines by design).
- **Availability** — the likelihood you can access it now (S3 Standard: ~99.99%).
- **Block Public Access** — the setting (on by default) that keeps buckets private.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Storage kind | S3 (object) | EBS (block) | S3 for files/assets/backups accessed over HTTP; EBS for a disk attached to one EC2 instance. |
| Making data public | Turn off Block Public Access | Keep it private, share via presigned URL / CloudFront | Keep private by default; use presigned URLs or CloudFront to share instead of opening the bucket. |
| Where the bucket lives | Region near users | Region for compliance | Choose by latency and any data-residency rules; data stays in that Region. |

# Worked Example

Storing a nightly database backup safely:

```text
1. Create a bucket in your Region (name globally unique, e.g. acme-db-backups-2026).
2. Leave Block Public Access ON — backups must not be public.
3. Upload each night's dump with a dated key: backups/2026-08-26.sql.gz
4. Rely on default encryption at rest (SSE-S3); enable versioning later for extra safety.
5. Because durability is eleven-nines, the backup is extremely unlikely to be lost.
```

The bucket stays private, the object is encrypted at rest by default, and each backup has a unique,
dated key so nothing is overwritten by accident.

# Real World Analogy

S3 is like a **vast coat check** run by an obsessive attendant. You hand over an item (the object) and
get a claim ticket (the key); you don't know or care which shelf it's on (the flat namespace). The
attendant keeps several copies in separate rooms so your coat is **almost never lost** (durability) and
the counter is **open essentially all the time** (availability). And the cloakroom is **private by
default** — someone needs your ticket, or your written permission, to collect an item.

# Examples

## Example 1 — Basic: object identity

The object at bucket `my-app-bucket` with key `images/logo.png` is uniquely addressed by that
bucket+key pair. The `images/` part looks like a folder but is just a **prefix** in the key; S3's
namespace is flat.

**Why this works:** treating the key as one flat string (with `/` for readability) matches how S3
actually stores and lists objects.

## Example 2 — Real-world: hosting static assets

A website stores its images and downloads in S3 and serves them (often via CloudFront). Storage is
cheap, scales without provisioning, and the eleven-nines durability means assets won't silently
disappear.

**Why this works:** S3's unlimited, durable object storage is ideal for static content that's written
once and read many times.

## Example 3 — Pitfall: making a bucket public to "make it work"

A developer disables Block Public Access so an app can read files, exposing **everything** in the
bucket to the internet. The right fix is a scoped **bucket policy**, a **presigned URL**, or serving
through **CloudFront** — not opening the whole bucket.

**Why this bites:** public buckets are the number-one cause of S3 data leaks; the secure defaults exist
precisely to prevent this.

# Common Mistakes

- **Confusing durability and availability.** Durability is about not *losing* data; availability is
  about being able to *reach* it.
- **Turning off Block Public Access carelessly.** Prefer scoped policies, presigned URLs, or
  CloudFront.
- **Treating S3 like a filesystem.** It's flat object storage; prefixes aren't real folders, and you
  replace whole objects rather than editing in place.
- **Forgetting bucket names are global.** Your desired name may be taken by another account.

# Best Practices

- Keep **Block Public Access on**; share data with **presigned URLs** or **CloudFront** instead of
  making buckets public.
- Rely on **default encryption**, and add **versioning** for important data (next tier).
- Use **clear key naming** (prefixes, dates) so listing and lifecycle rules are easy.
- Choose the bucket's **Region** for latency and compliance, remembering data stays there.

# Summary

- **S3** is **object storage**: **buckets** (globally unique, Region-bound) hold unlimited **objects**
  (up to 5 TB) addressed by **key**.
- **Durability** (S3 Standard: **eleven nines** by design) means data is almost never lost;
  **availability** (~99.99%) means it's almost always reachable — they're different guarantees.
- S3 is **secure by default**: private buckets, **Block Public Access on**, and **encryption at rest by
  default**, with **strong read-after-write consistency**.
- Grant access with **IAM/bucket policies and presigned URLs**, not by making buckets public.

# Flash Cards

Q: What kind of storage is Amazon S3?
A: Object storage — you store whole objects (file plus metadata) retrieved by key over HTTP(S); it's not a filesystem or block storage, and its namespace is flat.

Q: What uniquely identifies an object in S3?
A: The combination of its bucket name and its key (the object's full name within the bucket).

Q: What is the difference between durability and availability?
A: Durability is the likelihood your data survives (S3 Standard is designed for eleven nines); availability is the likelihood you can access it right now (S3 Standard targets about 99.99%).

Q: Are new S3 buckets public or private by default?
A: Private — Block Public Access is on by default, and new objects are encrypted at rest by default; public access requires deliberate action.

Q: How large can a single S3 object be, and how many can a bucket hold?
A: Up to 5 TB per object, and an unlimited number of objects per bucket.

Q: How should you share S3 data instead of making a bucket public?
A: Use a scoped bucket policy, a time-limited presigned URL, or serve through CloudFront — rather than turning off Block Public Access.

# Exercises

### Easy
For a bucket `my-notes` containing an object with key `2026/aug/todo.txt`, identify the bucket, the
key, and the prefix, and say whether `2026/aug/` is a real folder.

### Medium
Explain, in two or three sentences, the difference between durability and availability using S3's
design numbers, and why an app might care about each.

### Challenging
A teammate wants a web app to read images from S3 and proposes turning off Block Public Access on the
whole bucket. Explain why that's risky and describe at least two safer ways to grant the needed access.

# Further Reading

- AWS — *What is Amazon S3?*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html>
- AWS — *Buckets and objects*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html>
- AWS — *Blocking public access to your S3 storage*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html>
- AWS — *Amazon S3 data consistency model*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel>
