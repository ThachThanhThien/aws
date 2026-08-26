---
id: lesson-03
slug: aws-accounts-and-free-tier
title: "AWS Accounts, Free Tier, and Billing"
level: beginner
order: 3
duration: 18
tags:
  - account
  - root-user
  - free-tier
  - budgets
  - billing
summary: "What an AWS account is and why the root user must be protected, how the Free Tier lets you learn at low cost, and the billing tools — Budgets, Cost Explorer, and billing alarms — that keep pay-as-you-go spending from surprising you."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what an **AWS account** is and what the **root user** can do.
- List the steps that **secure a brand-new account**.
- Describe the categories of the **AWS Free Tier** and why usage can still cost money.
- Set up a **budget and billing alarm** to catch runaway spend.
- Name the tools you use to **see and understand** your bill.

# Why It Matters

The first thing you do on AWS is create an account, and the two most common beginner disasters both
happen here: leaving the all-powerful **root user** exposed, and getting a surprise bill because
something ran outside the Free Tier. Ten minutes of account hygiene — protecting the root user and
setting a budget — prevents almost every early horror story. This lesson is that ten minutes.

# Concept Explanation

### The AWS account

An **AWS account** is a container for your resources and the **boundary for billing and security**.
Every account has a unique **12-digit account ID** (for example, `123456789012`). Everything you
create — servers, buckets, users — belongs to exactly one account, and all its charges roll up to that
account's bill. Larger organizations use **many** accounts (one per team or environment) and group
them with **AWS Organizations** for **consolidated billing**.

### The root user

When you create an account you get the **root user**: it signs in with the **email address and
password** used at sign-up and has **complete, unrestricted access** to everything, including closing
the account and changing billing. Because it can't be limited, the root user is dangerous if stolen.
AWS's guidance is strict:

- **Turn on multi-factor authentication (MFA)** for the root user immediately.
- **Do not use the root user for daily work.** Create a separate identity for that (next lesson).
- **Do not create access keys for the root user.**

A handful of tasks genuinely require the root user (like changing the account name or some billing
settings), but they are rare.

### The Free Tier

The **AWS Free Tier** lets you try services at little or no cost while learning. Historically it comes
in three flavors (check the current Free Tier page for exact offers and amounts — they change):

- **12-months free** — free for a year from sign-up, up to a monthly limit. Classic examples are a
  small EC2 instance for **750 hours/month** and **5 GB** of S3 Standard storage.
- **Always free** — free indefinitely up to a limit, such as **1 million AWS Lambda requests/month**
  and a chunk of DynamoDB storage.
- **Trials** — a short free period after you first use a service.

AWS has also introduced **credit-based free plans for new accounts**; the specifics and dollar amounts
change, so always confirm on <https://aws.amazon.com/free/>. The crucial point: the Free Tier has
**limits**, and going over them — or using a service that isn't in the Free Tier at all — **costs
money**. That's why you pair it with a budget.

### Seeing and controlling cost

AWS gives you several tools (most in the **Billing and Cost Management** console):

- **AWS Budgets** — set a monthly cost or usage threshold and get an **email alert** when you're
  forecast to exceed it. There's a **Free Tier usage budget** template.
- **AWS Cost Explorer** — charts and breakdowns of what you've spent and on what.
- **Billing alarms (CloudWatch)** — trigger an alarm when estimated charges cross a number.
- **Cost and Usage Report (CUR)** — the most detailed line-item export, for deep analysis.
- **Cost allocation tags** — label resources (e.g., `project=demo`) so spend can be grouped.

# Key Terminology

- **AWS account** — the container for resources and the billing/security boundary; has a 12-digit ID.
- **Root user** — the account's original login (email + password) with unrestricted access.
- **MFA (multi-factor authentication)** — a second sign-in factor beyond the password.
- **Free Tier** — limited free usage of many services (12-month, always-free, and trial offers).
- **AWS Budgets** — set spend/usage thresholds and receive alerts.
- **Cost Explorer** — a tool to visualize and analyze past and forecast spending.
- **Consolidated billing** — combining multiple accounts' bills under AWS Organizations.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Daily identity | Use the root user | Use a separate admin identity | Always use a separate identity; keep the root user locked away with MFA. |
| Cost guardrail | Watch the console manually | Set an AWS Budget alert | Set a budget — humans forget to check; alerts don't. |
| Account structure | One account for everything | Multiple accounts + Organizations | One account is fine for learning; separate accounts isolate teams/environments and simplify billing at scale. |

# Worked Example

The first-hour checklist for a new AWS account:

```text
1. Enable MFA on the root user.
2. Create a separate admin identity for daily work (IAM Identity Center or an IAM user — next lesson).
3. Stop using the root user except for the few tasks that require it.
4. Create an AWS Budget (e.g., alert at $5/month) so any unexpected charge emails you.
5. Turn on the Free Tier usage alerts.
```

Every step is free and takes minutes, and together they remove the two biggest beginner risks: a
compromised root user and a surprise bill.

# Real World Analogy

An AWS account is like a **bank account**. The **root user** is the master owner credential — you
store it in a vault, protect it with a second lock (MFA), and almost never carry it around. For daily
spending you use limited cards (the identities in the next lesson). And a **budget alert** is the
text message your bank sends when spending crosses a threshold — cheap to set up, and it saves you
from a nasty statement.

# Examples

## Example 1 — Basic: why MFA on root matters

Someone guesses or phishes your account's sign-up password. With **MFA off**, they now control
everything. With **MFA on**, the password alone is useless without your second factor. The single
setting turns a password leak from a catastrophe into a non-event.

**Why this works:** MFA adds a factor the attacker doesn't have, and the root user is exactly the
identity you most need to protect.

## Example 2 — Real-world: catching a mistake early

A learner launches a larger instance type than the Free Tier covers and forgets it running. Because
they set a **$5 budget alert**, they get an email two days later, log in, and stop the instance before
the charge grows. Without the alert, they'd have found out at the end of the month.

**Why this works:** budgets convert silent, growing charges into a prompt notification you can act on.

## Example 3 — Pitfall: assuming "Free Tier" means "always free"

A learner assumes anything on AWS is free for a year. They use a service that **isn't** in the Free
Tier, or they exceed the 750-hour EC2 limit by running two instances, and get charged. The Free Tier
covers **specific services up to specific limits** — not everything.

**Why this bites:** the word "free" hides real limits; only usage inside those limits is free.

# Common Mistakes

- **Using the root user day to day.** It's over-powered and can't be scoped down — reserve it.
- **Skipping MFA on root.** It's the single most valuable security setting on the account.
- **Assuming everything is free.** Free Tier is limited by service and quantity; overages bill.
- **Not setting a budget.** Pay-as-you-go means charges are silent until the statement — unless you
  add an alert.

# Best Practices

- **Enable MFA** on the root user and stop using it for routine work.
- **Set an AWS Budget** and Free Tier usage alerts on day one.
- Use **cost allocation tags** so you can see what each project costs.
- Review spend periodically in **Cost Explorer**; shut down resources you no longer need.

# Summary

- An **AWS account** is the container for your resources and the boundary for **billing and
  security**, identified by a 12-digit ID.
- The **root user** has unrestricted power — protect it with **MFA**, avoid daily use, and never give
  it access keys.
- The **Free Tier** (12-month, always-free, trials, plus newer credit plans) is limited; exceeding
  the limits or using non-Free-Tier services **costs money**.
- Use **AWS Budgets, Cost Explorer, and billing alarms** to see and control spending.
- The whole account-hardening routine is free and takes minutes — do it first.

# Flash Cards

Q: What is an AWS account?
A: A container for your resources and the boundary for billing and security, identified by a unique 12-digit account ID.

Q: What can the root user do, and how should you treat it?
A: The root user has complete, unrestricted access; protect it with MFA, avoid using it for daily work, and don't create access keys for it.

Q: What are the main categories of the AWS Free Tier?
A: 12-months-free offers, always-free offers, and short trials (plus newer credit-based plans for new accounts) — each limited to specific services and amounts.

Q: Does "Free Tier" mean everything on AWS is free?
A: No — only specific services up to specific limits are free; using other services or exceeding the limits incurs charges.

Q: How do you get warned before a bill grows unexpectedly?
A: Create an AWS Budget with an alert threshold (and Free Tier usage alerts) so AWS emails you when spend is forecast to exceed it.

Q: Which tool visualizes and breaks down what you've spent?
A: AWS Cost Explorer shows charts and breakdowns of past and forecast spending across services.

# Exercises

### Easy
List the five first-hour steps for a new AWS account from the worked example, in order, from memory.

### Medium
Explain in two or three sentences why using the root user for daily tasks is risky, and what you
should use instead.

### Challenging
You're mentoring someone opening their first account to follow this course. Write a short "cost
safety" plan: which budget threshold you'd suggest, what alerts you'd enable, and how you'd make sure
a forgotten EC2 instance can't quietly run up a large bill.

# Further Reading

- AWS — *AWS Free Tier*: <https://aws.amazon.com/free/>
- AWS — *Best practices to protect your account's root user*: <https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html>
- AWS — *AWS Budgets*: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>
- AWS — *Analyzing your costs with Cost Explorer*: <https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html>
