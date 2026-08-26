---
id: lesson-12
slug: s3-in-depth
title: "S3 in Depth: Storage Classes, Versioning, and Security"
level: intermediate
order: 12
duration: 21
tags:
  - s3
  - storage-classes
  - lifecycle
  - versioning
  - encryption
summary: "Getting more from S3 — the storage classes from Standard to Glacier Deep Archive and their cost/retrieval trade-offs, lifecycle rules that move data to cheaper tiers automatically, versioning that protects against accidental loss, and the encryption and access controls that keep buckets safe."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Compare S3 **storage classes** by access frequency, cost, and retrieval time.
- Write **lifecycle rules** to transition and expire objects automatically.
- Explain how **versioning** protects against accidental delete/overwrite.
- Choose an **encryption** option (SSE-S3, SSE-KMS) and know what each adds.
- Apply S3 **access controls**: Block Public Access, bucket policies, presigned URLs.

# Why It Matters

S3 is cheap, but storing everything in the default class and never cleaning up still wastes money, and
a single fat-fingered delete can lose important data. **Storage classes** and **lifecycle rules** cut
cost automatically; **versioning** and good **access controls** protect the data. These are the levers
that make S3 both economical and safe at scale.

# Concept Explanation

### Storage classes

All S3 classes are designed for the same **eleven-nines durability**; they differ in **availability**,
**minimum storage duration**, and **retrieval cost/speed**. The main ones (as of writing):

| Class | Best for | Notes |
| ----- | -------- | ----- |
| **S3 Standard** | Frequently accessed data | Low latency, stored across ≥3 AZs |
| **S3 Intelligent-Tiering** | Unknown/changing access | Auto-moves objects between tiers; small monitoring fee |
| **S3 Standard-IA** | Infrequent access, kept a while | Cheaper storage, **retrieval fee**; ≥3 AZs |
| **S3 One Zone-IA** | Infrequent, reproducible data | Cheaper, but stored in **one AZ** (lost if that AZ is destroyed) |
| **S3 Glacier Instant Retrieval** | Archives needing millisecond access | Cheap storage, higher retrieval cost |
| **S3 Glacier Flexible Retrieval** | Archives, minutes-to-hours retrieval | Very cheap storage |
| **S3 Glacier Deep Archive** | Long-term archives, ~12-hour retrieval | Cheapest storage |

The pattern: the **cheaper the storage**, the **higher or slower the retrieval**. Match the class to
how often — and how fast — you need the data.

### Lifecycle rules

A **lifecycle configuration** moves or deletes objects automatically based on age. You express it as
rules per prefix:

```json
{
  "Rules": [
    {
      "ID": "archive-then-delete-logs",
      "Filter": { "Prefix": "logs/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 365 }
    }
  ]
}
```

This keeps recent logs in Standard, moves them to Standard-IA after 30 days and Glacier after 90, then
deletes them after a year — no manual work.

### Versioning

**Versioning** keeps **every version** of an object in a bucket. With it on, overwriting an object
creates a new version (the old one is retained), and deleting adds a **delete marker** rather than
erasing data — so you can **recover** from accidental overwrites and deletions. Versioning can't be
disabled once enabled, only suspended, and old versions cost storage (pair it with a lifecycle rule to
expire them). **MFA delete** can add a second factor for permanently removing versions.

```bash
aws s3api put-bucket-versioning \
  --bucket my-app-bucket \
  --versioning-configuration Status=Enabled
```

### Encryption

- **SSE-S3** — server-side encryption with keys AWS manages; it's the **default** for new objects.
- **SSE-KMS** — encryption using **AWS KMS** keys, adding **access control and an audit trail** over
  key use (with a small KMS cost; **S3 Bucket Keys** reduce it).
- **SSE-C** — you supply the key. **DSSE-KMS** applies two layers for strict requirements.
- **In transit**, always use **HTTPS/TLS**.

### Access controls

Keep data private and grant access narrowly:

- **Block Public Access** — on by default; leave it on unless you truly need public objects.
- **Bucket policies** (resource-based) and **IAM policies** (identity-based) grant scoped access; ACLs
  are disabled by default.
- **Presigned URLs** give time-limited access to a single object without making it public.
- **VPC endpoints** and **Access Points** control and simplify access at scale.

# Key Terminology

- **Storage class** — an S3 tier trading storage price against retrieval cost/speed.
- **Intelligent-Tiering** — a class that auto-moves objects between access tiers.
- **Lifecycle rule** — automatic transition/expiration of objects by age.
- **Versioning** — retaining every version of an object; deletes become delete markers.
- **SSE-S3 / SSE-KMS** — server-side encryption with S3-managed vs KMS-managed keys.
- **Presigned URL** — a temporary, signed link granting access to one object.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Class for unknown access | S3 Standard | Intelligent-Tiering | Intelligent-Tiering when access patterns are unpredictable — it moves objects for you. |
| Archiving old data | Keep in Standard | Lifecycle to Glacier | Lifecycle to Glacier/Deep Archive for rarely accessed data to cut cost dramatically. |
| Encryption | SSE-S3 (default) | SSE-KMS | SSE-KMS when you need audit logs and tighter key access control; SSE-S3 for simple default protection. |
| Protecting against deletes | No versioning | Versioning + lifecycle | Versioning for recoverability; add a lifecycle rule to expire old versions and control cost. |

# Worked Example

Designing storage for application logs that are read often for a month, rarely after:

```text
1. Write logs to s3://my-app-bucket/logs/ in S3 Standard (frequent reads early on).
2. Lifecycle rule: transition to Standard-IA at 30 days, Glacier Flexible Retrieval at 90 days.
3. Expire (delete) at 365 days to meet the retention policy.
4. Enable versioning so an accidental overwrite/delete is recoverable; expire noncurrent versions at 30 days.
5. Keep Block Public Access on; grant the log-reader app access via a scoped IAM policy.
Result: cheap long-term storage, automatic cleanup, and protection from accidents — with no manual work.
```

# Real World Analogy

S3 storage classes are like choices for storing your belongings. **Standard** is a closet in your home
— instant access, priciest space. **Standard-IA** is a storage unit across town — cheaper each month,
but retrieving something costs a trip. **Glacier Deep Archive** is a deep vault in another city —
cheapest of all, but getting your things back takes about a day. A **lifecycle rule** is an assistant
who automatically moves boxes you haven't opened in months to the cheaper unit, and shreds them after a
year. **Versioning** is keeping every draft of a document so you can always undo a bad edit.

# Examples

## Example 1 — Basic: picking a class

Nightly backups you'd only ever restore in an emergency, and can wait hours for, fit **Glacier Flexible
Retrieval** or **Deep Archive** — cheapest storage, slow retrieval you can tolerate. Files served on
every page load belong in **Standard**.

**Why this works:** the access frequency and acceptable retrieval time point straight at the right
class.

## Example 2 — Real-world: recovering from a bad deploy

A deployment accidentally overwrites a config object in a versioned bucket. Because versioning kept the
previous version, the team restores it in seconds by promoting the old version — no backup restore
needed.

**Why this works:** versioning retains the prior object, turning a destructive overwrite into a quick
rollback.

## Example 3 — Pitfall: versioning without cleanup

A team enables versioning but never expires old versions. Years of noncurrent versions pile up and the
storage bill climbs, because every overwrite kept the old copy forever.

**Why this bites:** versioning protects data but accumulates versions; without a lifecycle rule to
expire old ones, storage grows unbounded.

# Common Mistakes

- **Leaving everything in Standard.** Use lifecycle rules to move cold data to IA/Glacier.
- **Enabling versioning without lifecycle cleanup.** Old versions cost money — expire them.
- **Using One Zone-IA for irreplaceable data.** It's a single AZ; reserve it for reproducible data.
- **Forgetting retrieval costs/times.** Glacier is cheap to store but slower/costlier to read — plan
  for it.

# Best Practices

- Match each dataset to a **storage class** by access frequency and required retrieval speed.
- Automate cost with **lifecycle rules** (transition + expiration), including **noncurrent versions**.
- Turn on **versioning** for important buckets; consider **MFA delete** for critical data.
- Keep **Block Public Access on**, use **SSE-KMS** where you need audit/control, and share via
  **presigned URLs** rather than public objects.

# Summary

- S3 **storage classes** share eleven-nines durability but trade **storage price** against **retrieval
  cost/speed** — Standard for hot data, Glacier/Deep Archive for cold archives.
- **Lifecycle rules** transition and expire objects automatically, cutting cost with no manual work.
- **Versioning** keeps every version so accidental overwrites/deletes are recoverable — pair it with
  lifecycle expiration.
- Secure buckets with **default encryption (SSE-S3), SSE-KMS for control, Block Public Access, scoped
  policies, and presigned URLs**.

# Flash Cards

Q: How do S3 storage classes generally trade off?
A: They share eleven-nines durability, but the cheaper the storage, the higher or slower the retrieval — so you match the class to how often and how fast you need the data.

Q: What does S3 Intelligent-Tiering do?
A: It automatically moves objects between access tiers based on usage, for a small monitoring fee — ideal when access patterns are unknown or changing.

Q: What does an S3 lifecycle rule let you do?
A: Automatically transition objects to cheaper storage classes and/or expire (delete) them after a set number of days, without manual work.

Q: How does versioning protect your data?
A: It retains every version of an object, so overwrites keep the old version and deletes add a delete marker — letting you recover from accidental changes.

Q: What does SSE-KMS add over SSE-S3?
A: Encryption with AWS KMS keys, giving you access control over key use and an audit trail (at a small cost), versus SSE-S3's simpler AWS-managed default encryption.

Q: Why should versioning be paired with a lifecycle rule?
A: Because old (noncurrent) versions keep accumulating and cost storage; a lifecycle rule expires them so the bill doesn't grow unbounded.

# Exercises

### Easy
For each dataset, name a suitable storage class: (a) images served on every page, (b) compliance
archives read maybe once a year and can wait hours, (c) data with unpredictable access.

### Medium
Write, in plain English, a lifecycle policy for `logs/` that keeps them hot for a month, archives them,
and deletes them after a year, and explain what each step saves.

### Challenging
A bucket holds critical config that's occasionally overwritten by deploys. Describe how you'd use
versioning, a lifecycle rule, and encryption to make the bucket both recoverable and cost-controlled,
and note one setting you'd add to prevent accidental permanent deletion.

# Further Reading

- AWS — *Using Amazon S3 storage classes*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
- AWS — *Managing your storage lifecycle*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html>
- AWS — *Using versioning in S3 buckets*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html>
- AWS — *Protecting data with server-side encryption*: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html>
