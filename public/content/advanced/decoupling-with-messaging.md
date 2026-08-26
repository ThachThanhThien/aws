---
id: lesson-18
slug: decoupling-with-messaging
title: "Decoupling with SQS, SNS, and EventBridge"
level: advanced
order: 18
duration: 20
tags:
  - sqs
  - sns
  - eventbridge
  - decoupling
  - event-driven
summary: "Why loosely coupled systems are more resilient and scalable, and the AWS services that decouple them — SQS queues that buffer work for one consumer, SNS topics that fan a message out to many subscribers, and EventBridge routing events to targets by rule."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain why **decoupling** components improves resilience and scalability.
- Describe **Amazon SQS** as a queue and its **standard vs FIFO** trade-off.
- Describe **Amazon SNS** as **pub/sub** and the **fan-out** pattern.
- Describe **Amazon EventBridge** as a rule-based **event bus**.
- Choose the right messaging service for a given need.

# Why It Matters

When one component calls another directly, they're **tightly coupled**: if the downstream is slow or
down, the upstream fails too, and they can't scale independently. **Messaging** decouples them — work
is handed off asynchronously through a queue or topic, so components absorb spikes, tolerate failures,
and scale on their own. This is the backbone of resilient, event-driven architecture on AWS.

# Concept Explanation

### Why decouple

**Decoupling** means components communicate **indirectly** through a message service instead of calling
each other directly. Benefits:

- **Resilience** — if a consumer is down, messages **wait** in the queue instead of being lost.
- **Elastic scaling** — producers and consumers scale independently; the buffer absorbs bursts.
- **Simplicity** — each component only knows about the queue/topic, not every other component.

### Amazon SQS — queues (point-to-point)

**Amazon Simple Queue Service (SQS)** is a fully managed **message queue**. A **producer** sends
messages; the queue **stores** them durably; a **consumer polls** and processes them, then deletes
them. Each message is processed by **one** consumer — it's **point-to-point**. Key features:

- **Standard queues** — near-unlimited throughput, **at-least-once** delivery, **best-effort ordering**.
- **FIFO queues** — **strict ordering** and **exactly-once** processing, at lower throughput.
- **Visibility timeout** — a message is hidden while one consumer works on it, so others don't grab it.
- **Dead-letter queue (DLQ)** — messages that repeatedly fail are moved aside for inspection.

Because messages wait until a consumer is ready, SQS **buffers** load — a spike fills the queue and
workers drain it at their own pace.

### Amazon SNS — pub/sub (fan-out)

**Amazon Simple Notification Service (SNS)** is **publish/subscribe**. A publisher sends a message to a
**topic**, and SNS **pushes a copy to every subscriber** — which can be **SQS queues, Lambda functions,
HTTP/S endpoints, email, or SMS**. One message reaches **many** receivers (fan-out).

A common **fan-out** pattern combines them: publish once to an **SNS topic** that has **several SQS
queues** subscribed, so each downstream service gets its own copy to process independently.

```text
SQS (point-to-point):   producer ──► [ queue ] ──► one consumer processes each message

SNS fan-out (pub/sub):  publisher ──► (SNS topic) ──► SQS queue A ──► service A
                                                 └──► SQS queue B ──► service B
                                                 └──► Lambda        ──► service C
```

### Amazon EventBridge — the event bus

**Amazon EventBridge** is a serverless **event bus** that **routes events** from AWS services, SaaS
apps, and your own applications to **targets** based on **rules** (event patterns that match on the
event's content). It's ideal for **event-driven** designs where many sources and destinations need
**filtering and routing**, and it includes a **scheduler** (the successor to CloudWatch Events'
scheduled rules). The default bus automatically receives events from many AWS services.

### Choosing between them

| Need | Service |
| ---- | ------- |
| Buffer work for one worker to process, decouple a spike | **SQS** |
| Broadcast one message to many subscribers | **SNS** |
| Route/filter events from many AWS/SaaS/custom sources to targets, or schedule | **EventBridge** |

# Key Terminology

- **Decoupling** — components communicate through a message service, not direct calls.
- **SQS** — a managed queue; each message processed by one consumer (point-to-point).
- **Standard vs FIFO queue** — high throughput/at-least-once vs strict order/exactly-once.
- **Visibility timeout / DLQ** — hide a message while processing / hold repeatedly failing messages.
- **SNS** — pub/sub topics that push a message to many subscribers (fan-out).
- **EventBridge** — a rule-based event bus routing events to targets, with scheduling.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| One message, one worker | SQS | SNS | SQS — a queue delivers each message to a single consumer. |
| One message, many receivers | SNS | SQS | SNS — pub/sub fans out to all subscribers. |
| Strict ordering / no duplicates | Standard queue | FIFO queue | FIFO when order and exactly-once matter; standard for max throughput. |
| Route many event types by content | SNS | EventBridge | EventBridge for rich content-based routing and many AWS/SaaS integrations. |

# Worked Example

Decoupling an order pipeline so a slow step can't break checkout:

```text
1. Checkout publishes an "OrderPlaced" event to an SNS topic (fan-out).
2. Subscribed SQS queues each feed a service: one for billing, one for shipping, one for analytics.
3. Each service polls its own queue and processes at its own pace; if shipping is briefly down,
   its messages wait safely in its queue.
4. Repeatedly failing messages land in a dead-letter queue for investigation.
Result: checkout returns instantly, downstream services scale independently, and a failure in one
doesn't take down the others or lose data.
```

# Real World Analogy

**SQS** is a **ticket queue** at a help desk: requests pile up, and whichever agent is free takes the
next one — if all agents are busy, tickets wait safely rather than vanishing. **SNS** is a **mailing
list**: the sender writes once and every subscriber gets their own copy. **EventBridge** is a **smart
mailroom**: it reads each incoming item and, following posted rules, routes it to exactly the right
departments — and it can also drop scheduled reminders in the mail on a timetable.

# Examples

## Example 1 — Basic: buffering a spike

A flash sale sends orders far faster than the fulfillment service can process. Orders go into an **SQS**
queue; the fulfillment workers drain it steadily. Nothing is lost, and the workers aren't overwhelmed.

**Why this works:** the queue absorbs the burst and lets the consumer process at a sustainable rate —
decoupling in action.

## Example 2 — Real-world: fan-out to independent teams

An "image uploaded" event is published to **SNS**. A thumbnailing service, a moderation service, and an
analytics service each have their own subscribed **SQS** queue, so all three react to the same event
without knowing about each other.

**Why this works:** SNS fan-out lets one event drive many independent consumers, added or removed
without touching the publisher.

## Example 3 — Pitfall: using a queue for broadcast

A team puts a message on a single **SQS** queue expecting three services to each act on it — but each
message is delivered to only **one** consumer, so two services never see it. They needed **SNS**
(fan-out), or SNS-to-SQS per service.

**Why this bites:** SQS is point-to-point; broadcasting to many receivers is SNS's job, not a queue's.

# Common Mistakes

- **Using SQS when you need broadcast.** One message = one consumer; use SNS/EventBridge to fan out.
- **Choosing standard queues when order matters.** Use FIFO for strict ordering/exactly-once.
- **No dead-letter queue.** Failing messages retry forever or get lost; a DLQ isolates them.
- **Calling services synchronously for slow work.** Decouple with a queue so callers don't block or
  fail together.

# Best Practices

- **Decouple** components with a queue or topic so failures and spikes are absorbed.
- Use **SQS** for point-to-point buffering, **SNS** for fan-out, **EventBridge** for content-based
  routing and scheduling.
- Configure **dead-letter queues** and sensible **visibility timeouts**; design consumers to be
  **idempotent** (safe to reprocess).
- Reach for **FIFO** only when **ordering/exactly-once** is truly required (it costs throughput).

# Summary

- **Decoupling** through messaging makes systems **resilient** (work waits instead of failing) and
  **independently scalable**.
- **SQS** is a **queue**: each message is processed by **one** consumer; **standard** maximizes
  throughput, **FIFO** guarantees order/exactly-once.
- **SNS** is **pub/sub**: one message **fans out** to many subscribers (often SNS → several SQS queues).
- **EventBridge** is a **rule-based event bus** routing events from many sources to targets, with
  scheduling.

# Flash Cards

Q: Why decouple components with messaging?
A: So they communicate asynchronously through a queue or topic — work waits instead of being lost when a consumer is down, spikes are buffered, and producers and consumers scale independently.

Q: In Amazon SQS, how many consumers process each message?
A: One — SQS is point-to-point, so each message is delivered to and processed by a single consumer.

Q: What is the difference between an SQS standard queue and a FIFO queue?
A: Standard queues offer near-unlimited throughput with at-least-once delivery and best-effort ordering; FIFO queues guarantee strict ordering and exactly-once processing at lower throughput.

Q: What does Amazon SNS do, and what is fan-out?
A: SNS is publish/subscribe: a message published to a topic is pushed to every subscriber (SQS, Lambda, HTTP, email, SMS) — fan-out is one message reaching many receivers.

Q: What is Amazon EventBridge best for?
A: A serverless event bus that routes events from AWS services, SaaS, and custom apps to targets based on content-matching rules, and it can schedule events.

Q: Which service would you use to broadcast one event to three independent services?
A: SNS (often fanning out to a separate SQS queue per service), or EventBridge — not a single SQS queue, since a queue delivers each message to only one consumer.

# Exercises

### Easy
For each need, name SQS, SNS, or EventBridge: (a) buffer tasks for one pool of workers, (b) send one
message to many subscribers, (c) route many event types to targets by content-matching rules.

### Medium
Explain how putting an SQS queue between a producer and a slow consumer improves resilience during a
traffic spike.

### Challenging
Design an order-processing pipeline where placing an order must trigger billing, shipping, and
analytics independently, none can break checkout, and failed messages must be inspectable. Name the
services and how they connect, and one setting you'd add for reliability.

# Further Reading

- AWS — *What is Amazon SQS?*: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html>
- AWS — *SQS standard vs FIFO queues*: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-queue-types.html>
- AWS — *What is Amazon SNS?*: <https://docs.aws.amazon.com/sns/latest/dg/welcome.html>
- AWS — *What is Amazon EventBridge?*: <https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html>
