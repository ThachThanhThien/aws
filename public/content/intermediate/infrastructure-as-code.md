---
id: lesson-16
slug: infrastructure-as-code
title: "Infrastructure as Code with CloudFormation"
level: intermediate
order: 16
duration: 20
tags:
  - cloudformation
  - iac
  - templates
  - stacks
  - automation
summary: "Defining AWS resources in version-controlled templates instead of clicking — how AWS CloudFormation turns a declarative YAML/JSON template into a stack it creates, updates, and deletes as a unit, and how it compares to the AWS CDK and Terraform."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain **Infrastructure as Code (IaC)** and its benefits over manual setup.
- Describe a **CloudFormation** template and the main sections of one.
- Explain what a **stack** is and how create/update/delete work as a unit.
- Use **change sets** and **drift detection** to apply changes safely.
- Compare CloudFormation with the **AWS CDK** and **Terraform**.

# Why It Matters

Clicking through the Console to build an environment is fine once — but it isn't repeatable, reviewable,
or easy to rebuild after a disaster, and it drifts as people make ad-hoc changes. **Infrastructure as
Code** captures your environment as a file you can version, review, and deploy identically every time.
It's how teams create consistent dev/test/prod environments and recover quickly, and it's a core skill
for production AWS.

# Concept Explanation

### Infrastructure as Code

**IaC** means **defining and provisioning infrastructure through machine-readable templates** rather
than manual steps. Because the template is a file, you get:

- **Repeatability** — the same template builds the same environment every time.
- **Version control** — infra changes are diffed, reviewed, and rolled back like code.
- **Consistency** — dev, test, and prod come from the same definition.
- **Disaster recovery & documentation** — the template both rebuilds the environment and describes it.

### CloudFormation templates

**AWS CloudFormation** is AWS's native IaC service. You write a **template** in **YAML or JSON** that
**declaratively** describes the resources you want; CloudFormation works out the order and creates them.
Main template sections:

- **`Resources`** (required) — the AWS resources to create.
- **`Parameters`** — inputs you supply at deploy time (e.g., an environment name).
- **`Mappings`** / **`Conditions`** — lookup tables and conditional logic.
- **`Outputs`** — values to return (e.g., a bucket name or URL).

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: A single private S3 bucket.
Parameters:
  BucketName:
    Type: String
Resources:
  AppBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
Outputs:
  BucketArn:
    Value: !GetAtt AppBucket.Arn
```

### Stacks

A **stack** is a **deployed instance of a template** — the collection of resources CloudFormation
created from it, managed **as a single unit**. Create the stack and CloudFormation provisions
everything; **update** the stack and it changes only what differs; **delete** the stack and it removes
the resources it created. If creation fails, CloudFormation **rolls back** to a clean state by default.

### Applying changes safely

- **Change sets** let you **preview** exactly what an update will add, modify, or replace **before** you
  apply it — so a small edit doesn't unexpectedly replace a database.
- **Drift detection** reports where the real resources have been changed **outside** the template (manual
  edits), so you can bring them back in line.
- **StackSets** deploy the same template across **multiple accounts and Regions**.

### CloudFormation vs CDK vs Terraform

- **CloudFormation** — YAML/JSON templates, AWS-native.
- **AWS CDK** — write infrastructure in a **real programming language** (TypeScript, Python, etc.); it
  **synthesizes CloudFormation** underneath. Great when you want loops, functions, and abstraction.
- **Terraform** — a popular **third-party**, multi-cloud IaC tool using its own language (HCL).

All express the same idea: infrastructure defined as code.

# Key Terminology

- **Infrastructure as Code (IaC)** — provisioning infra from machine-readable templates.
- **Template** — a YAML/JSON file describing the desired resources (declarative).
- **Stack** — the set of resources deployed from a template, managed as one unit.
- **Change set** — a preview of what a stack update will change before you apply it.
- **Drift detection** — finding resources changed outside the template.
- **AWS CDK / Terraform** — code-based and third-party IaC alternatives.

# Options and Trade-offs

| Decision | Console (click-ops) | CloudFormation (IaC) | How to choose |
| -------- | ------------------- | -------------------- | ------------- |
| One-off exploration | Fine | Overkill | Console to learn/experiment. |
| Repeatable environments | Error-prone, drifts | Consistent, reviewable | IaC for anything you'll rebuild or run in multiple environments. |
| Applying an update | Manual, risky | Change set preview + rollback | IaC to see and control changes safely. |
| Language style | — | YAML/JSON (CFN) vs code (CDK) | Templates for simplicity; CDK when you want programming constructs. |

# Worked Example

Promoting a setup from clicks to code:

```text
1. You built a bucket + policy by hand while learning (Console).
2. Capture it as a CloudFormation template (YAML) with a BucketName parameter.
3. Deploy a "dev" stack and a "prod" stack from the SAME template — identical, only the name differs.
4. Need a change? Create a change set to preview it, confirm nothing important is replaced, then apply.
5. Someone edits a resource by hand → drift detection flags it → you reconcile the template.
6. Tearing down dev? Delete the stack and every resource it created goes with it.
```

The environment is now repeatable, reviewable, and disposable — the whole point of IaC.

# Real World Analogy

CloudFormation is like a **blueprint** for a building. Instead of constructing a house by hand and
hoping you remember every step, you hand a blueprint to a builder (CloudFormation) who erects an
identical house every time — and can build ten matching ones for a street (multiple stacks). A **change
set** is the contractor's written quote showing exactly what a renovation will alter before any wall is
touched. **Drift detection** is an inspector noticing someone moved a wall without updating the
blueprint. And **deleting the stack** is a demolition crew that removes precisely what the blueprint
built — nothing more, nothing less.

# Examples

## Example 1 — Basic: one template, two environments

A team deploys the same template as `dev` and `prod` stacks, passing a different parameter for each.
Both environments are guaranteed to match structurally, because they came from one definition.

**Why this works:** parameterized templates make consistent environments trivial and remove
"works-in-dev-not-prod" drift.

## Example 2 — Real-world: safe change with a change set

Before updating a stack that includes a database, the team generates a **change set** and sees that a
proposed edit would **replace** the database (losing data). They adjust the change to avoid replacement,
then apply.

**Why this works:** change sets reveal destructive actions in advance, preventing surprise data loss.

## Example 3 — Pitfall: manual drift

After deploying via CloudFormation, someone tweaks a security group by hand in the Console. The next
template update behaves unexpectedly because the real state no longer matches the template.

**Why this bites:** mixing manual changes with IaC causes drift; the template is only the source of
truth if all changes go through it.

# Common Mistakes

- **Hand-editing IaC-managed resources.** Causes drift; make changes in the template.
- **Applying updates blind.** Use a **change set** to preview replacements first.
- **One giant template for everything.** Split by lifecycle/ownership so blast radius stays small.
- **Treating Console click-ops as a strategy.** Fine to learn, but not for repeatable environments.

# Best Practices

- Keep templates in **version control** and review changes like code.
- Preview updates with **change sets**; rely on **rollback** for failed creates.
- Run **drift detection** and reconcile so the template stays the source of truth.
- Parameterize for **multiple environments**, and consider the **CDK** when you want programming
  constructs.

# Summary

- **Infrastructure as Code** defines resources in templates for **repeatable, reviewable, consistent**
  environments and easy rebuilds.
- **CloudFormation** uses **declarative YAML/JSON** templates; a **stack** is the deployed set of
  resources managed **as a unit** (create/update/delete together, with rollback).
- **Change sets** preview updates and **drift detection** catches manual changes; **StackSets** span
  accounts/Regions.
- **CloudFormation, the CDK, and Terraform** all express infrastructure as code — templates,
  code-synthesized templates, and a third-party multi-cloud tool.

# Flash Cards

Q: What is Infrastructure as Code, and why use it?
A: Defining and provisioning infrastructure from machine-readable templates instead of manual clicks — giving repeatability, version control, consistent environments, and easy rebuilds.

Q: What is a CloudFormation stack?
A: The deployed set of resources created from a template, managed as a single unit — create, update, and delete apply to the whole stack.

Q: What language(s) do CloudFormation templates use, and are they declarative or imperative?
A: YAML or JSON, and they are declarative — you describe the desired resources and CloudFormation works out how to create them in order.

Q: What does a change set let you do?
A: Preview exactly what a stack update will add, modify, or replace before you apply it, so you can avoid surprises like an unintended database replacement.

Q: What is drift detection?
A: A check that reports where real resources have been changed outside the template (manual edits), so you can reconcile them back to the template.

Q: How does the AWS CDK relate to CloudFormation?
A: The CDK lets you define infrastructure in a real programming language and synthesizes CloudFormation templates underneath, so it runs on the same engine.

# Exercises

### Easy
List three benefits of Infrastructure as Code over building resources by hand in the Console.

### Medium
Explain what a stack is and what happens to its resources when you delete the stack, and why that makes
tearing down an environment clean.

### Challenging
You're about to update a stack that contains a production database. Describe the steps you'd take to
apply the change safely (which tools you'd use and what you'd check), and how you'd prevent manual drift
going forward.

# Further Reading

- AWS — *What is AWS CloudFormation?*: <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html>
- AWS — *Template anatomy*: <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html>
- AWS — *Using change sets*: <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html>
- AWS — *What is the AWS CDK?*: <https://docs.aws.amazon.com/cdk/v2/guide/home.html>
