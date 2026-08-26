---
id: lesson-13
slug: databases-on-aws
title: "Databases on AWS: RDS and DynamoDB"
level: intermediate
order: 13
duration: 21
tags:
  - rds
  - dynamodb
  - relational
  - nosql
  - multi-az
summary: "Managed databases on AWS — Amazon RDS for relational engines with automated backups, Multi-AZ failover, and read replicas, versus Amazon DynamoDB, a serverless NoSQL key-value store designed around access patterns — and how to choose between relational and NoSQL."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain why **managed databases** offload operational work.
- Contrast **relational (SQL)** and **NoSQL** data models.
- Describe **Amazon RDS**, its engines, and the difference between **Multi-AZ** and **read replicas**.
- Describe **Amazon DynamoDB** as a **serverless** NoSQL store designed around access patterns.
- Choose between RDS and DynamoDB for a given workload.

# Why It Matters

Almost every application needs to store data reliably, and running your own database means patching,
backups, and failover — exactly the toil the cloud can remove. AWS offers **managed** databases so you
focus on your data, not the plumbing. But "which database" is a real decision: pick relational when you
need rich queries and transactions, and NoSQL when you need massive scale with simple access. Getting
Multi-AZ vs read replicas straight is a classic exam-and-production gotcha.

# Concept Explanation

### Managed databases

A **managed database** service runs the database engine for you: AWS handles **patching**, **automated
backups**, **failover**, and scaling the infrastructure. You still design your data and control access,
but you don't SSH in to patch the OS or the engine. This is the shared-responsibility split applied to
databases.

### Relational vs NoSQL

- **Relational (SQL)** databases store data in **tables** of **rows and columns** with a defined
  **schema**. They support **joins** across tables and **ACID transactions**, which suit structured
  data with relationships and complex queries.
- **NoSQL** databases (key-value, document, and others) have **flexible schemas**, scale **horizontally**
  to huge sizes, and are **designed around specific access patterns** rather than ad-hoc queries — they
  typically don't do joins. They suit very high scale and simple, known lookups.

Neither is "better" — they fit different shapes of problem.

### Amazon RDS

**Amazon Relational Database Service (RDS)** is managed **relational** hosting. You choose an engine —
**MySQL, PostgreSQL, MariaDB, Oracle, or SQL Server**, or **Amazon Aurora** (AWS's MySQL/PostgreSQL-
compatible engine built for higher performance) — and an **instance class** and storage. AWS manages
patching, **automated backups** and snapshots, and offers two very different features people confuse:

- **Multi-AZ deployment** — a **synchronous standby** replica in **another AZ**. If the primary fails,
  RDS **automatically fails over** to the standby. This is for **high availability**, **not** for read
  scaling — you don't read from the standby.
- **Read replicas** — **asynchronous** copies you can **read from** to scale read traffic (and they can
  be **cross-Region**). They're for **read scaling**, and can be promoted to standalone databases.

```text
Multi-AZ (availability):   primary ──sync──► standby   (auto-failover; you don't read the standby)
Read replica (read scale): primary ──async──► replica(s)  (serve read queries; can be cross-Region)
```

You don't get **OS access** to an RDS instance — that's the price of it being managed.

### Amazon DynamoDB

**Amazon DynamoDB** is a **serverless NoSQL** key-value and document database. There are **no servers
to manage**: it delivers **single-digit-millisecond latency**, scales **automatically**, is highly
available across AZs, and handles virtually unlimited throughput. You model data as **tables** of
**items** (rows) with **attributes** (fields), and each item is identified by a **primary key** — a
**partition key**, optionally with a **sort key**. Because there are no joins, you **design your table
around the queries you'll run**. Capacity is **on-demand** (pay per request) or **provisioned**;
**global tables** replicate across Regions.

```python
import boto3

table = boto3.resource("dynamodb").Table("Orders")
table.put_item(Item={"order_id": "1001", "customer": "amara", "total": 42})
item = table.get_item(Key={"order_id": "1001"})["Item"]   # single-digit-ms lookup by key
```

# Key Terminology

- **Managed database** — AWS runs the engine (patching, backups, failover); you design the data.
- **Relational / SQL** — tables, schema, joins, and ACID transactions.
- **NoSQL** — flexible schema, horizontal scale, designed around access patterns; no joins.
- **Amazon RDS** — managed relational hosting for several engines, including Aurora.
- **Multi-AZ** — synchronous standby for automatic failover (availability), not read scaling.
- **Read replica** — asynchronous copy for read scaling (can be cross-Region).
- **DynamoDB** — serverless NoSQL key-value/document store keyed by partition (+ sort) key.

# Options and Trade-offs

| Decision | Relational (RDS) | NoSQL (DynamoDB) | How to choose |
| -------- | ---------------- | ---------------- | ------------- |
| Data shape | Structured, related tables | Flexible items keyed by access pattern | Relational for rich relationships/queries; DynamoDB for simple, known lookups at scale. |
| Scaling | Vertical + read replicas | Automatic, horizontal, serverless | DynamoDB when you need huge, elastic scale without managing capacity. |
| Queries | Ad-hoc SQL, joins | Key-based access, no joins | Relational when you need flexible querying; design DynamoDB tables around fixed access patterns. |
| Ops model | Managed instances | Serverless (no instances) | DynamoDB to avoid instance sizing entirely. |

# Worked Example

Choosing a database for two features of an e-commerce app:

```text
Feature A — orders, customers, and their relationships, with reporting queries:
   Use Amazon RDS (PostgreSQL). Structured, related data with joins and transactions.
   Turn on Multi-AZ for failover; add a read replica if reporting reads get heavy.

Feature B — a shopping-cart/session store hit constantly with simple get/put by key, needing huge scale:
   Use DynamoDB. Key-based access at single-digit-ms latency, serverless auto-scaling, no joins needed.
```

The relational side gets RDS for its query power and transactions; the high-scale key-value side gets
DynamoDB for effortless scale.

# Real World Analogy

**RDS** is like hiring a meticulous **records office**: everything is filed in cross-referenced ledgers
(tables with relationships), you can ask complex questions that span ledgers (joins), and a **trained
understudy** instantly takes over if the head clerk is out sick (Multi-AZ failover). **DynamoDB** is
like an **endless wall of labeled lockers**: you retrieve any locker instantly by its label (the key),
it never runs out of space or closes, but there's no cross-referencing between lockers — you organize
them around exactly how you'll fetch them.

# Examples

## Example 1 — Basic: Multi-AZ is not read scaling

A team enables **Multi-AZ** hoping to spread read queries across both instances. It doesn't work that
way — the standby only takes over on failover. To scale reads they add a **read replica**, which is
built exactly for that.

**Why this works:** Multi-AZ is an availability feature (synchronous standby); read replicas are a
scaling feature (asynchronous, readable).

## Example 2 — Real-world: serverless scale for a hot path

A game stores player state in **DynamoDB**. During a launch, traffic jumps enormously, and on-demand
capacity absorbs it with single-digit-millisecond reads — no instance to resize, no capacity to guess.

**Why this works:** DynamoDB's serverless, auto-scaling design fits unpredictable, high-throughput,
key-based access.

## Example 3 — Pitfall: forcing joins onto DynamoDB

A team models richly related data in DynamoDB and then needs ad-hoc joins and reporting queries. Without
joins, they contort the data or scan the whole table, hurting performance and cost.

**Why this bites:** DynamoDB is designed around known access patterns; data needing flexible relational
queries usually belongs in RDS/Aurora.

# Common Mistakes

- **Confusing Multi-AZ with read replicas.** One is failover (availability), the other is read scaling.
- **Expecting OS access on RDS.** It's managed — you don't log into the host.
- **Choosing NoSQL for relational needs.** Complex joins and ad-hoc queries want a relational engine.
- **Ignoring access patterns in DynamoDB.** Model the table around your queries up front; you can't
  bolt on joins later.

# Best Practices

- Use **managed** databases to offload patching, backups, and failover.
- Turn on **Multi-AZ** for production RDS availability; add **read replicas** to scale reads.
- Pick **relational** for related, query-rich data; pick **DynamoDB** for high-scale, key-based access.
- **Design DynamoDB tables around access patterns** (partition/sort keys), and choose on-demand vs
  provisioned capacity to match traffic.

# Summary

- **Managed databases** run the engine for you — patching, backups, failover — while you own the data
  and access.
- **Amazon RDS** hosts relational engines (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora);
  **Multi-AZ** is synchronous **failover** (availability) and **read replicas** are asynchronous **read
  scaling** (and can be cross-Region).
- **DynamoDB** is a **serverless NoSQL** key-value/document store with single-digit-ms latency, keyed by
  a partition (+ optional sort) key, designed **around access patterns**.
- Choose **relational** for rich queries/transactions and **NoSQL** for simple access at massive scale.

# Flash Cards

Q: What does a managed database service like RDS handle for you?
A: Patching, automated backups, failover, and scaling the infrastructure — you still design the data and control access, but don't manage the OS or engine yourself.

Q: What is the difference between RDS Multi-AZ and a read replica?
A: Multi-AZ is a synchronous standby in another AZ for automatic failover (availability) and is not readable; a read replica is an asynchronous copy used to scale read traffic and can be cross-Region.

Q: What kind of database is Amazon DynamoDB?
A: A serverless NoSQL key-value and document database with single-digit-millisecond latency, automatic scaling, and no servers to manage; items are keyed by a partition key (plus optional sort key).

Q: When should you choose relational (RDS) over DynamoDB?
A: When data is structured with relationships and you need joins, ad-hoc queries, or ACID transactions across tables.

Q: Do you get OS access to an Amazon RDS instance?
A: No — RDS is managed, so AWS operates the host and engine; you interact through the database, not the operating system.

Q: Why must you design a DynamoDB table around its access patterns?
A: Because DynamoDB has no joins and queries are key-based, so the partition/sort key design must match how you'll read the data.

# Exercises

### Easy
State whether each is relational or NoSQL: (a) tables with joins and transactions, (b) key-value lookups
at massive scale with flexible schema.

### Medium
Explain, in two or three sentences, the difference between RDS Multi-AZ and read replicas, and which
you'd use to (a) survive an AZ failure and (b) handle heavy read traffic.

### Challenging
For an app with a transactional orders system and a constantly hammered session store, choose a database
for each, justify the choice, and describe one availability/scaling feature you'd enable on each.

# Further Reading

- AWS — *What is Amazon RDS?*: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html>
- AWS — *Multi-AZ deployments*: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
- AWS — *Working with read replicas*: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html>
- AWS — *What is Amazon DynamoDB?*: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html>
