---
id: lesson-14
slug: lambda-and-serverless
title: "AWS Lambda and Serverless"
level: intermediate
order: 14
duration: 20
tags:
  - lambda
  - serverless
  - event-driven
  - api-gateway
  - functions
summary: "What serverless really means, how AWS Lambda runs event-driven, stateless functions billed only for what they use, its limits (a 15-minute maximum and cold starts), and how Lambda combines with API Gateway and DynamoDB into a serverless application."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define **serverless** honestly (you don't manage servers — they still exist).
- Explain how **AWS Lambda** runs **event-driven, stateless** functions and how it's billed.
- List Lambda's key **limits**: the 15-minute maximum, memory/CPU, and **cold starts**.
- Assemble a simple **serverless application** (API Gateway + Lambda + DynamoDB).
- Recognize workloads that **don't** fit Lambda.

# Why It Matters

Serverless lets you run code without provisioning or patching a single server, scaling automatically
and paying nothing when idle — a genuinely different cost and operations model. But "serverless" is
widely misunderstood, and Lambda has real limits (time, state, cold starts) that make it perfect for
some jobs and wrong for others. Knowing the boundary saves you from both missed savings and painful
misfits.

# Concept Explanation

### What serverless means

**Serverless** means **you don't provision, manage, or patch servers** — the provider does. It does
**not** mean there are no servers; AWS runs them, scales them, and hides them from you. You get:
automatic scaling, **pay-per-use** billing (often **nothing when idle**), and no capacity to manage.

### AWS Lambda

**AWS Lambda** runs your code in response to **events**, with no servers to manage. The unit is a
**function**: your code plus configuration (runtime, memory, timeout, and an **IAM execution role**
granting its permissions). Key properties:

- **Event-driven** — a function runs when a **trigger** fires: an S3 upload, an **API Gateway** HTTP
  request, a **DynamoDB stream**, an **SQS** message, an **EventBridge** schedule, and many more.
- **Stateless** — each invocation is independent; don't rely on data staying in memory between calls.
  Persist state in **S3**, **DynamoDB**, or a database.
- **Managed runtimes** — Node.js, Python, Java, Go, Ruby, .NET, or a custom runtime.
- **Billing** — you pay for the **number of requests** plus **duration** (measured in GB-seconds:
  memory × time). Idle functions cost nothing.

```python
def handler(event, context):
    # 'event' carries the trigger's data; return a response.
    name = event.get("name", "world")
    return {"statusCode": 200, "body": f"Hello, {name}!"}
```

### Limits to respect

- **Maximum execution time is 15 minutes** — Lambda is not for long-running jobs.
- **Memory** is configurable (roughly 128 MB up to 10,240 MB), and **CPU scales with memory** — more
  memory also means more CPU.
- **Cold starts** — the first invocation after idle (or when scaling up) must initialize the execution
  environment, adding latency. Warm invocations reuse it. **Provisioned concurrency** keeps
  environments ready when low latency matters.

### A serverless application

A common pattern wires managed pieces together with no servers to run:

```text
   client ──HTTP──► API Gateway ──trigger──► Lambda function ──► DynamoDB (data)
                     (routes/auth)            (your logic)        (serverless store)
```

**API Gateway** turns HTTP requests into Lambda invocations (a REST/HTTP API), Lambda holds the logic,
and **DynamoDB** stores the data — all scaling automatically and billed by use.

# Key Terminology

- **Serverless** — you don't manage servers; the provider runs and scales them, billed by use.
- **Lambda function** — your code plus config (runtime, memory, timeout, IAM role).
- **Trigger / event source** — what invokes a function (S3, API Gateway, SQS, EventBridge…).
- **Stateless** — each invocation is independent; state lives in external stores.
- **Cold start** — startup latency when a new execution environment must initialize.
- **API Gateway** — a managed service exposing HTTP APIs that invoke Lambda (or other backends).

# Options and Trade-offs

| Decision | Lambda (serverless) | EC2 / containers | How to choose |
| -------- | ------------------- | ---------------- | ------------- |
| Workload shape | Short, event-driven, spiky | Long-running, steady, heavy compute | Lambda for bursty event handling; servers for sustained work. |
| Ops model | No servers to manage | You (or ECS) manage capacity | Lambda to eliminate server management entirely. |
| Cost when idle | ~Nothing | You pay for running instances | Lambda shines for intermittent workloads. |
| Latency sensitivity | Cold starts possible | Consistent once warmed | Use provisioned concurrency or servers for strict low-latency needs. |

# Worked Example

Building a "thumbnail on upload" feature with no servers:

```text
Trigger:   An image is uploaded to an S3 bucket (an S3 event).
Function:  A Lambda (Python) reads the image, makes a thumbnail, and writes it to another bucket.
Perms:     The function's IAM execution role allows read on the source bucket and write on the target.
Scale:     Ten uploads run ten invocations in parallel automatically; zero uploads cost nothing.
Fit:       Each job is short and independent — well within 15 minutes and naturally stateless.
```

There's no server to provision, patch, or scale; you pay only for the milliseconds each thumbnail
takes.

# Real World Analogy

Lambda is like an **on-demand taxi** instead of **owning a car**. Owning a car (a running server) means
paying for it even while it sits in the driveway. A taxi (a function) shows up **only when you need a
ride** (an event), takes you where you're going, and you **pay per trip** — nothing when you're not
riding. The "cold start" is the short wait for the taxi to arrive when none is nearby; keeping one
parked outside (provisioned concurrency) removes the wait at a cost.

# Examples

## Example 1 — Basic: event in, response out

An API Gateway request triggers a Lambda that reads the request from the `event`, looks up an item in
DynamoDB, and returns JSON. No server was running before the request, and none stays running after.

**Why this works:** Lambda is invoked per event and billed per invocation, which fits request/response
workloads that aren't constantly busy.

## Example 2 — Real-world: scaling to a spike for free-when-idle

A notification function is quiet most of the day, then fires thousands of times during a broadcast.
Lambda scales out to handle the burst automatically and scales back to zero afterward — you pay for the
burst and nothing in between.

**Why this works:** automatic scaling and pay-per-use make Lambda ideal for spiky, intermittent event
processing.

## Example 3 — Pitfall: a 30-minute job on Lambda

A team tries to run a batch job that takes half an hour inside a single Lambda invocation. It hits the
**15-minute limit** and is killed. The work belonged on a container/EC2 or split into smaller steps
(e.g., with Step Functions).

**Why this bites:** Lambda caps execution at 15 minutes; long-running or heavy sustained compute needs a
different service.

# Common Mistakes

- **Thinking "serverless" means no servers.** AWS runs them; you just don't manage them.
- **Relying on in-memory state between invocations.** Functions are stateless — persist state
  externally.
- **Ignoring the 15-minute limit.** Long jobs must move to containers/EC2 or be decomposed.
- **Forgetting cold starts.** Latency-sensitive paths may need provisioned concurrency.

# Best Practices

- Keep functions **small, single-purpose, and stateless**; store state in S3/DynamoDB.
- Grant the **execution role least privilege** for exactly what the function touches.
- Design for **idempotency** (safe re-runs), since events can retry.
- Use Lambda for **event-driven, bursty** work; use containers/EC2 for long-running or heavy compute.

# Summary

- **Serverless** means you don't manage servers (they still exist); you get auto-scaling and
  **pay-per-use** billing.
- **Lambda** runs **event-driven, stateless** functions, billed by **requests + duration**, with a
  **15-minute** maximum and configurable memory (CPU scales with it); mind **cold starts**.
- A **serverless app** often combines **API Gateway + Lambda + DynamoDB**, all scaling automatically.
- Lambda fits **short, spiky, event-driven** work; **long-running or heavy** workloads belong on
  containers/EC2.

# Flash Cards

Q: What does "serverless" actually mean?
A: That you don't provision, manage, or patch servers — the provider runs and scales them for you, billed by use — not that there are literally no servers.

Q: How is AWS Lambda triggered, and is it stateful?
A: It's event-driven — invoked by triggers like S3 uploads, API Gateway requests, or schedules — and it's stateless, so each invocation is independent and state must live in external stores.

Q: How is Lambda billed?
A: By the number of requests plus duration (GB-seconds: memory times execution time); idle functions cost nothing.

Q: What is Lambda's maximum execution time?
A: 15 minutes — longer or heavy sustained workloads belong on containers or EC2, or must be split into steps.

Q: What is a cold start, and how can you reduce it?
A: The startup latency when a new execution environment must initialize (after idle or when scaling); provisioned concurrency keeps environments warm to avoid it.

Q: Name the three services in a common serverless application pattern.
A: API Gateway (HTTP front door), Lambda (logic), and DynamoDB (data) — all managed and auto-scaling.

# Exercises

### Easy
Explain in one sentence why "serverless means no servers" is a misconception.

### Medium
Describe a small serverless feature (trigger, function, data store) end to end, and note why each piece
scales automatically and costs nothing when idle.

### Challenging
You're asked to run a 40-minute nightly data-crunch on Lambda. Explain why that's a poor fit, and
propose an alternative design (which services, and how you'd stay within limits or avoid them).

# Further Reading

- AWS — *What is AWS Lambda?*: <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html>
- AWS — *Lambda quotas (limits)*: <https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html>
- AWS — *Lambda execution environment and cold starts*: <https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html>
- AWS — *Amazon API Gateway*: <https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html>
