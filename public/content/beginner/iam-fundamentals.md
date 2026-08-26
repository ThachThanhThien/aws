---
id: lesson-05
slug: iam-fundamentals
title: "IAM Fundamentals"
level: beginner
order: 5
duration: 20
tags:
  - iam
  - identity
  - policies
  - roles
  - least-privilege
summary: "How AWS Identity and Access Management controls who can do what — IAM users, groups, and roles as identities, JSON policies as the rules, the deny-by-default evaluation logic where an explicit deny always wins, and why roles and least privilege beat long-term access keys."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain what **IAM** controls and why it's a **global**, free service.
- Tell apart **IAM users, groups, and roles** and when to use each.
- Read a simple **IAM policy** and its `Effect`, `Action`, and `Resource`.
- Apply the **evaluation rule**: deny by default, explicit allow grants, explicit deny wins.
- Explain why **roles and least privilege** beat long-term access keys.

# Why It Matters

IAM is the front door to your entire AWS account: it decides which people and services can touch which
resources. Get it too loose and a single leaked key can expose everything; get it wrong and nothing
works. Almost every AWS security best practice — least privilege, MFA, temporary credentials — is an
IAM decision. This lesson gives you the vocabulary you'll use in every future service.

# Concept Explanation

### What IAM is

**AWS Identity and Access Management (IAM)** controls **authentication** (who you are) and
**authorization** (what you're allowed to do) for AWS. It is a **global** service (not tied to a
Region) and it's **free**. Anything that makes an AWS request is a **principal**: the root user, an
IAM user, an IAM role, a federated identity, or an AWS service acting on your behalf.

### Users, groups, and roles

- An **IAM user** represents a single person or application that needs **long-term credentials**. A
  user can have a **console password** (for the web console) and/or **access keys** (an access key ID
  + secret, for the CLI/SDK). Treat access keys like passwords — they don't expire on their own.
- An **IAM group** is a collection of users. You attach policies to the group and its users
  **inherit** them, which is how you manage permissions by job function ("Developers", "Admins").
  Groups can't be nested and a group is **not** itself a principal.
- An **IAM role** is an identity with permissions but **no long-term credentials**. Instead, a trusted
  principal **assumes** the role and receives **temporary credentials** (via AWS STS) that expire.
  Roles are how you give access to **EC2 instances** (through an *instance profile*), **Lambda
  functions**, **other accounts**, and **federated users** — without handing out permanent keys.

### Policies: the rules

Permissions are defined in **policy** documents written in **JSON**. A statement has an **`Effect`**
(`Allow` or `Deny`), one or more **`Action`s** (API operations), and **`Resource`s** (which things),
plus optional **`Condition`s**. Here is a policy granting read-only access to one bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::my-app-bucket",
        "arn:aws:s3:::my-app-bucket/*"
      ]
    }
  ]
}
```

Policies come in two flavors by where they attach:

- **Identity-based** — attached to a user, group, or role (like the example above).
- **Resource-based** — attached to a resource and include a `Principal` (for example, an **S3 bucket
  policy** that says which accounts may access the bucket).

They also come as **AWS managed** (maintained by AWS), **customer managed** (your reusable policies),
or **inline** (embedded in a single identity).

### How access is decided

The evaluation is simple to remember:

1. **Everything is denied by default.**
2. An **explicit `Allow`** in a policy grants the action.
3. An **explicit `Deny`** anywhere **overrides** any allow.

So the effective permission is: *allowed only if some policy allows it and no policy denies it.* This
is why an explicit `Deny` is a powerful guardrail.

# Key Terminology

- **IAM** — the service controlling who can do what in AWS; global and free.
- **Principal** — any entity that makes an AWS request (user, role, service, root).
- **IAM user** — an identity with long-term credentials for a person or app.
- **IAM group** — a collection of users that share attached policies.
- **IAM role** — an identity assumed for **temporary** credentials; no permanent keys.
- **Policy** — a JSON document listing `Effect`, `Action`, `Resource`, `Condition`.
- **Least privilege** — grant only the permissions actually needed, nothing more.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Access for an EC2 app | Store access keys on the instance | Attach an **IAM role** (instance profile) | Use a role — temporary credentials, nothing to leak or rotate. |
| Human sign-in | Many IAM users | **IAM Identity Center** (SSO) | Identity Center is AWS's recommendation for workforce sign-in; IAM users still suit small setups and apps. |
| Granting permissions | Broad `"*"` policy | Scoped least-privilege policy | Start minimal and add as needed; broad policies are the classic over-exposure. |

# Worked Example

You want a teammate to have console access with read-only permissions on one S3 bucket:

```text
1. Create an IAM user for them (or better, an Identity Center user) with console access + MFA.
2. Put them in a group, e.g. "ReadOnlyBucketUsers".
3. Attach the identity-based policy above (s3:GetObject + s3:ListBucket on that bucket) to the group.
4. They sign in and can read the bucket — and nothing else, because everything else is denied by default.
```

If you later need to revoke it from everyone in that job, you change the **group's** policy once,
rather than editing each user.

# Real World Analogy

IAM is like a **building's badge system**. An **IAM user** is an employee's personal badge; a **group**
is a department whose badges all open the same set of doors; a **role** is a visitor badge you borrow
for the afternoon that opens only certain doors and **expires** when you leave. **Policies** are the
rules programmed into each badge about which doors open. And a **"do not admit" note (explicit Deny)**
at the front desk overrides any badge — exactly like IAM's rule that an explicit deny always wins.

# Examples

## Example 1 — Basic: reading a policy

Given the policy above, a user can call `s3:GetObject` on objects in `my-app-bucket` and list the
bucket, but cannot delete objects or touch any other bucket — because only those two actions on that
one resource are allowed, and everything else is denied by default.

**Why this works:** the policy's `Action` and `Resource` fields draw a tight box; outside it, the
default deny applies.

## Example 2 — Real-world: an app on EC2 reading from S3

Instead of copying access keys onto a server (where they can leak), you create a **role** that allows
reading a bucket and attach it to the EC2 instance. The app automatically receives **temporary
credentials** and reads the bucket. Nothing long-lived is stored on the instance.

**Why this works:** roles hand out short-lived credentials on demand, so there's no permanent secret to
steal or rotate.

## Example 3 — Pitfall: the leaked access key

A developer embeds an access key in code and pushes it to a public repository. Bots find it within
minutes and spin up resources on the account. The key had broad permissions and never expired.

**Why this bites:** long-term access keys are permanent secrets; embedding them — especially broad
ones — is how many accounts get compromised. Roles and least privilege would have prevented it.

# Common Mistakes

- **Using the root user or broad `"*"` policies.** Grant least privilege from named identities.
- **Embedding long-term access keys in code.** Prefer roles; never commit keys to source control.
- **Confusing users and roles.** Users hold long-term credentials; roles are assumed for temporary
  ones.
- **Forgetting the deny rule.** An explicit `Deny` overrides allows — useful as a guardrail, and a
  gotcha if you don't expect it.

# Best Practices

- Apply **least privilege**: start with minimal permissions and add only what's needed.
- Prefer **roles and temporary credentials** over long-term access keys; use **instance profiles** on
  EC2.
- **Enable MFA**, especially for privileged users, and rotate any access keys that must exist.
- Manage permissions with **groups** (by job function) and reusable **customer managed policies**.
- Consider **IAM Identity Center** for human sign-in across accounts.

# Summary

- **IAM** controls who (authentication) can do what (authorization); it's **global** and **free**.
- **Users** hold long-term credentials, **groups** bundle users for shared permissions, and **roles**
  are assumed for **temporary** credentials — the safest way to grant access to services.
- **Policies** are JSON with `Effect`, `Action`, `Resource`; they're identity-based or resource-based.
- Access is **denied by default**, an **explicit allow** grants, and an **explicit deny always wins**.
- Favor **least privilege** and **roles** over broad, long-lived keys.

# Flash Cards

Q: What does IAM control, and is it Regional or global?
A: IAM controls authentication (who you are) and authorization (what you can do) in AWS; it is a global, free service.

Q: What is the difference between an IAM user and an IAM role?
A: A user has long-term credentials for a person or app; a role has no long-term credentials and is assumed to receive temporary credentials (via STS) — ideal for services and cross-account access.

Q: What are the three key elements of a policy statement?
A: Effect (Allow or Deny), Action (which API operations), and Resource (which things) — plus optional Conditions.

Q: What is IAM's access evaluation rule?
A: Everything is denied by default; an explicit Allow grants the action; an explicit Deny anywhere overrides any Allow.

Q: How should an application on EC2 get permission to read an S3 bucket?
A: By attaching an IAM role (instance profile) to the instance, so it receives temporary credentials — not by storing long-term access keys on the server.

Q: What does 'least privilege' mean?
A: Granting only the permissions actually needed to do the job, and nothing more, to limit the damage if credentials are misused.

# Exercises

### Easy
In the sample policy, list exactly which two actions are allowed and on which resource, and say what
happens if the user tries to delete an object.

### Medium
Explain when you would use an IAM group versus an IAM role, giving one concrete example of each.

### Challenging
A teammate proposes putting long-term access keys with full admin permissions into an app running on
EC2. Write a short critique: what's risky, and what specific IAM design (role, scope, MFA) you'd use
instead and why.

# Further Reading

- AWS — *IAM User Guide: What is IAM?*: <https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html>
- AWS — *Security best practices in IAM*: <https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>
- AWS — *Policies and permissions in IAM*: <https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html>
- AWS — *IAM roles*: <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html>
