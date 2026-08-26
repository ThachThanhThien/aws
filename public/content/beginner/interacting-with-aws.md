---
id: lesson-06
slug: interacting-with-aws
title: "Interacting with AWS: Console, CLI, and SDKs"
level: beginner
order: 6
duration: 18
tags:
  - console
  - cli
  - sdk
  - credentials
  - automation
summary: "The ways you operate AWS — the web Management Console for exploring, the AWS CLI for scriptable commands, SDKs for calling AWS from code, and infrastructure as code for repeatable setups — all of which drive the same signed service APIs, plus how to configure CLI credentials safely."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Name the main ways to interact with AWS and when each fits.
- Explain that the Console, CLI, and SDKs all call the **same AWS APIs**.
- Configure the **AWS CLI** and understand where credentials live.
- Read a basic `aws` command and a minimal SDK (boto3) snippet.
- Follow safe **credential** practices (profiles, roles, never committing keys).

# Why It Matters

You can do the same task on AWS by clicking in a browser, typing a command, or running code — and
choosing the right one saves hours. The Console is great for learning and one-offs, but anything you'll
repeat should be a command or a script so it's fast and consistent. Knowing that all of these drive the
**same API** demystifies AWS: there's one system underneath, reachable many ways.

# Concept Explanation

### One API, several front doors

Everything in AWS is ultimately a call to a **service API** — an HTTPS request that AWS
**authenticates** (it must be signed with valid credentials) and **authorizes** (IAM must allow it).
The Console, CLI, and SDKs are just different front doors to those same APIs:

```text
   Console (web GUI) ─┐
   AWS CLI (terminal)─┼──►  signed HTTPS request ──►  AWS service API  ──►  IAM checks ──►  action
   SDK (your code) ───┘
```

### The AWS Management Console

The **Console** is the web GUI at the AWS website. It's ideal for **learning, exploring**, and
**occasional tasks** — you can see everything and click through wizards. It's slower and manual, so
it's a poor fit for anything you need to repeat exactly.

### The AWS CLI

The **AWS Command Line Interface (CLI)** runs commands in a terminal, shaped as
`aws <service> <operation>`. It's **scriptable and repeatable** — perfect for automation. You set it
up with `aws configure`, which stores a **profile**:

```bash
# One-time setup: prompts for access key, secret key, default Region, output format.
aws configure

# Then commands look like this:
aws s3 ls                                  # list your S3 buckets
aws ec2 describe-instances --output table  # list EC2 instances as a table
```

Credentials live in `~/.aws/credentials` and settings (like Region) in `~/.aws/config`. You can keep
several named **profiles** (`--profile work`). Even better than long-term keys, the CLI can use
**IAM Identity Center / SSO** or an assumed **role** for temporary credentials.

### SDKs

**SDKs (Software Development Kits)** are libraries that let your programs call AWS. There's one for
most languages — **boto3** for Python, plus JavaScript, Java, Go, .NET, and more:

```python
import boto3

s3 = boto3.client("s3")
for bucket in s3.list_buckets()["Buckets"]:
    print(bucket["Name"])
```

### Infrastructure as Code (a preview)

**Infrastructure as Code (IaC)** describes your resources in a template so you can create them
repeatably. **AWS CloudFormation** (YAML/JSON) and the **AWS CDK** (real programming languages) are the
AWS-native options; **Terraform** is a popular third-party tool. We cover CloudFormation later — for
now, just know it's the fourth way to operate AWS, and the best one for repeatable environments.

### AWS CloudShell

**AWS CloudShell** is a browser-based terminal in the Console with the CLI pre-installed and your
console session's permissions — handy when you don't want to install anything locally.

# Key Terminology

- **AWS Management Console** — the web GUI for AWS.
- **AWS CLI** — the command-line tool; commands are `aws <service> <operation>`.
- **SDK** — a code library (e.g., boto3 for Python) for calling AWS from programs.
- **Profile** — a named set of CLI credentials/settings in `~/.aws/`.
- **Infrastructure as Code (IaC)** — defining resources in templates (CloudFormation, CDK, Terraform).
- **AWS CloudShell** — a browser terminal with the CLI ready to use.

# Options and Trade-offs

| Task | Best tool | Why |
| ---- | --------- | --- |
| Exploring a new service | Console | Visual, guided, no setup. |
| A one-off change you'll never repeat | Console or CLI | Fast enough either way. |
| A task you'll repeat or script | CLI | Repeatable and automatable. |
| Logic inside an application | SDK | Programmatic control from your code. |
| A whole environment you re-create | Infrastructure as Code | Consistent, version-controlled, reviewable. |

# Worked Example

You need to list buckets and copy a file up, three times a week.

```text
First time, exploring:  Use the Console to see your buckets and confirm names.
Making it repeatable:   Switch to the CLI:
                          aws s3 ls
                          aws s3 cp report.csv s3://my-app-bucket/reports/
Fully automated:        Put those CLI commands in a script (or an SDK program) run on a schedule.
```

The Console taught you the lay of the land; the CLI made the recurring task fast and consistent.

# Real World Analogy

Think of a **restaurant kitchen** (the AWS API) that can take orders three ways: **dining in** (the
Console — you walk in, look at the menu, point at what you want), **phoning an order** (the CLI —
quick, precise, repeatable), and a **standing catering contract** (Infrastructure as Code — the same
order fulfilled identically every time, on schedule). Different front doors, one kitchen preparing the
food.

# Examples

## Example 1 — Basic: the same task two ways

Creating an S3 bucket can be done by clicking "Create bucket" in the Console, or by running
`aws s3 mb s3://my-unique-bucket-name`. Both send the same `CreateBucket` API call; the result is
identical.

**Why this works:** the front door doesn't change the underlying API — only how you invoke it.

## Example 2 — Real-world: automating a nightly export

A team clicks through the Console to test an export, then moves the working steps into a small **boto3
script** run on a schedule. What was a manual chore becomes a reliable job that runs the same way every
night.

**Why this works:** the SDK turns a manual Console workflow into repeatable code, removing human error.

## Example 3 — Pitfall: committing access keys

A developer pastes their access key and secret into a config file and commits it to a shared
repository. Now anyone with the repo has full CLI access to the account.

**Why this bites:** CLI/SDK credentials are powerful secrets. Store them in `~/.aws/` (never in the
repo), prefer SSO/roles, and use tools that scan for accidentally committed keys.

# Common Mistakes

- **Doing repetitive work in the Console.** Repeatable tasks belong in the CLI or a script.
- **Committing credentials.** Keys in source control are an instant account compromise.
- **Forgetting to set a Region.** Many commands need a default Region or `--region`.
- **Assuming the tools differ in power.** They all call the same APIs; permissions come from IAM, not
  the tool.

# Best Practices

- Use the **Console to learn**, then move recurring work to the **CLI/SDK** or **IaC**.
- Configure credentials with **profiles**, and prefer **SSO/roles** (temporary credentials) over
  long-term keys.
- **Never commit** keys; keep them in `~/.aws/` or supply them via roles/environment.
- Set a sensible **default Region** and use `--output table`/`json` to read results.

# Summary

- The **Console, CLI, SDKs, and IaC** are front doors to the **same signed AWS APIs**; IAM governs
  what each can do.
- The **Console** suits exploring and one-offs; the **CLI** suits repeatable, scriptable tasks; **SDKs**
  put AWS calls inside your code; **IaC** rebuilds whole environments consistently.
- Configure the CLI with `aws configure`; credentials live in `~/.aws/` as **profiles**.
- Keep credentials safe: **never commit** keys, and prefer **temporary credentials** from SSO/roles.

# Flash Cards

Q: What do the Console, CLI, and SDKs have in common?
A: They are different front doors that all make the same signed AWS service API calls, which IAM then authorizes.

Q: When is the AWS CLI a better choice than the Console?
A: When a task is repeated or scripted — the CLI is repeatable and automatable, while the Console is manual and better for exploring or one-offs.

Q: What is an SDK, and give an example.
A: A code library for calling AWS from a program; boto3 is the SDK for Python (there are SDKs for JavaScript, Java, Go, and more).

Q: Where does the AWS CLI store credentials, and what is a profile?
A: In the ~/.aws/ directory (credentials and config files); a profile is a named set of credentials/settings you can select with --profile.

Q: What is Infrastructure as Code, and name an AWS-native tool for it?
A: Defining your resources in templates so they can be created repeatably; AWS CloudFormation (and the AWS CDK) are the native tools.

Q: Why should you never commit access keys to a repository?
A: They are powerful, long-lived secrets; anyone with the repo gains CLI/SDK access to the account, so keep them in ~/.aws/ or use temporary role/SSO credentials.

# Exercises

### Easy
Write the AWS CLI command that lists your S3 buckets, and the command that starts the one-time
credential setup.

### Medium
Give one task best done in the Console and one best done with the CLI, and justify each choice in a
sentence.

### Challenging
You have a setup task you run every week by clicking through the Console. Describe how you'd convert it
to something repeatable — CLI script or SDK program — and one safeguard you'd add so credentials never
end up in source control.

# Further Reading

- AWS — *AWS Command Line Interface*: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html>
- AWS — *Configuring the AWS CLI*: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html>
- AWS — *Tools to Build on AWS (SDKs)*: <https://aws.amazon.com/developer/tools/>
- AWS — *AWS CloudShell*: <https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html>
