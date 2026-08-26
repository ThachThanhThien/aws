# AWS Course — Authoring Prompt & No-Hallucination Contract

This file is the contract for writing and maintaining the **Amazon Web Services (AWS)** course in
this repo. Every lesson and quiz must obey it. The goal: a beginner-friendly, **source-verified**
course on AWS fundamentals and hands-on cloud skills — cloud concepts, the global infrastructure,
identity and security, the core services (EC2, S3, VPC, RDS, DynamoDB, Lambda), monitoring and
infrastructure as code, and production architecture — with **zero invented facts**.

## Audience & voice

- **Suitable for everyone.** Assume the reader is new to AWS and may be new to the cloud entirely.
  Define every term the first time it appears (Region, AZ, IAM, ARN, VPC, subnet, EBS…). Prefer
  short sentences and concrete examples.
- Explain the *why*, not just the *how*. Use **one plain-language analogy per lesson**.
- Be honest about limits, cost, and security. The cloud is full of claims that sound reassuring but
  are wrong — never oversell ("AWS secures everything", "serverless means no servers", "the cloud is
  always cheaper"). Qualify claims and name the assumptions.
- Keep code **minimal and runnable**. Prefer the **AWS CLI** (`aws ...`) for hands-on steps, small
  **JSON** for IAM policies, small **YAML** for CloudFormation, and short **Python (boto3 / Lambda)**
  where a service is code-driven. Show console output as `text`. Use placeholders like
  `123456789012` for account IDs and `us-east-1` for Regions, and say they are placeholders.

## Currency & honesty (verified 2026-08-26)

- AWS changes constantly — new services, new defaults, new Region counts. Do **not** hard-code exact
  prices, the exact number of Regions/AZs/services, or "fastest/cheapest/best" claims as fixed facts.
  Say **"as of writing"** and link the current docs. Defaults that *have* changed and must be stated
  correctly (all current as of writing):
  - **S3 Block Public Access is ON by default** for new buckets, and **S3 encrypts new objects at
    rest by default** (SSE-S3). New buckets are **private** by default.
  - **S3 provides strong read-after-write consistency** for all operations (the old "eventual
    consistency" caveat is obsolete).
  - The **Well-Architected Framework has six pillars** (Sustainability was added in 2021).
- Prices vary by Region and change often. **Never quote a specific dollar figure as a fact** — point
  to <https://aws.amazon.com/pricing/> and the per-service pricing pages, and to the AWS Pricing
  Calculator. The **Free Tier** exists but is easy to exceed; always pair it with a budget/alarm.
- When you show a CLI command, IAM action, or API name, it must match the **current** documented
  spelling (e.g. `s3api`, `ec2 run-instances`, `iam create-role`, `logs:PutLogEvents`).

## Authoritative sources (cite these; do not invent)

- **AWS Documentation (home)** — https://docs.aws.amazon.com/ (the primary reference for every
  service; each service has a User Guide / Developer Guide / API Reference)
- **AWS General Reference** — https://docs.aws.amazon.com/general/latest/gr/ (Regions & endpoints,
  ARNs, service quotas)
- **Shared Responsibility Model** — https://aws.amazon.com/compliance/shared-responsibility-model/
- **AWS Well-Architected Framework** —
  https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html (the six pillars)
- **IAM User Guide** — https://docs.aws.amazon.com/IAM/latest/UserGuide/
- **Amazon EC2 User Guide** — https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/
- **Amazon S3 User Guide** — https://docs.aws.amazon.com/AmazonS3/latest/userguide/
- **Amazon VPC User Guide** — https://docs.aws.amazon.com/vpc/latest/userguide/
- **AWS Lambda Developer Guide** — https://docs.aws.amazon.com/lambda/latest/dg/
- **Amazon RDS User Guide** — https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/ ·
  **Amazon DynamoDB Developer Guide** — https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/
- **Amazon CloudWatch User Guide** — https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/
  · **AWS CloudTrail** — https://docs.aws.amazon.com/awscloudtrail/latest/userguide/
- **AWS CloudFormation User Guide** — https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/
- **Amazon Route 53** — https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/ ·
  **Amazon CloudFront** — https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/
- **AWS KMS** — https://docs.aws.amazon.com/kms/latest/developerguide/ ·
  **Amazon SQS / SNS / EventBridge** — the respective Developer Guides on docs.aws.amazon.com
- **AWS CLI Command Reference** — https://docs.aws.amazon.com/cli/latest/reference/
- **AWS Free Tier** — https://aws.amazon.com/free/ · **AWS Pricing** — https://aws.amazon.com/pricing/

If a claim isn't backed by one of these (or another primary AWS source), don't write it. If unsure,
qualify it or leave it out.

## High-risk facts to get right (anti-hallucination checklist)

These are the classic places AWS material goes wrong. Getting them right is the point of the course.

1. **Shared Responsibility Model.** AWS secures the **cloud itself** (hardware, the global
   infrastructure, and the software of managed services); the customer secures what they put **in**
   the cloud (their data, IAM configuration, OS and application patching on EC2, security-group and
   firewall rules, and their encryption choices). The line **shifts by service**: with EC2 (IaaS)
   the customer patches the OS; with managed/serverless services (S3, Lambda, DynamoDB) AWS handles
   more. Never say "AWS secures everything."
2. **Region vs Availability Zone vs edge location.** A **Region** is a separate geographic area
   containing multiple (generally three or more) **Availability Zones (AZs)**. An AZ is one or more
   discrete data centers with redundant power and networking, isolated so a failure in one AZ does
   not take down another. **Edge locations** serve CloudFront/Route 53, not compute. Data is **not**
   automatically copied across Regions — cross-Region replication is something you set up.
3. **Global vs Regional services.** **IAM, Route 53, CloudFront, and AWS Organizations are global.**
   Most services (EC2, VPC, RDS, Lambda, DynamoDB, and S3 **data**) are **Regional**. **S3 bucket
   names are globally unique**, but the objects live in the Region you chose.
4. **IAM.** IAM is **global**. The **root user** has full power and should be locked down (enable
   MFA, don't use it for daily work, avoid root access keys). Prefer **roles** (temporary
   credentials via STS) over long-term **access keys**. Policies are **deny by default**; you need an
   explicit **Allow**, and an explicit **Deny always wins**. IAM controls **who can call the AWS
   API** — it is *not* a network firewall (that's security groups / NACLs). Apply **least
   privilege**. (AWS now recommends **IAM Identity Center** for human sign-in, but IAM users, roles,
   and policies remain the foundation.)
5. **S3 is object storage.** Not a filesystem and not a block device. Objects can be up to **5 TB**;
   a bucket holds unlimited objects; bucket names are **globally unique** and DNS-compliant. S3 is
   designed for **11 nines (99.999999999%) of durability** — **durability is not the same as
   availability** (Standard targets 99.99% availability). New buckets are **private**, **Block Public
   Access is on**, and **new objects are encrypted at rest by default** (SSE-S3). S3 has **strong
   read-after-write consistency**.
6. **EC2.** EC2 is **virtual servers (IaaS)** — you manage the OS and patching. An **AMI** is the
   template; the **instance type** is the hardware sizing. A **key pair** is for SSH: AWS keeps the
   public key, **you keep the private key** (lose it and you can't SSH in the normal way). Pricing
   models: **On-Demand**, **Savings Plans / Reserved Instances**, **Spot** (large discount but can be
   interrupted with a two-minute warning — for fault-tolerant work), and **Dedicated Hosts**.
7. **Storage: EBS vs instance store.** **EBS** is network-attached **block** storage that persists
   independently of the instance's life and is tied to **one AZ** (snapshot to S3 to move it).
   **Instance store** is **ephemeral** local disk — its data is lost when the instance stops or
   terminates.
8. **Security groups vs network ACLs.** **Security groups** are **stateful**, act at the
   instance/ENI level, and are **allow-only** (return traffic is automatically permitted). **Network
   ACLs** are **stateless**, act at the **subnet** level, support **allow and deny** rules evaluated
   in number order, and you must allow return traffic explicitly.
9. **VPC.** A VPC is **Regional** and spans all AZs in the Region; **subnets live in a single AZ**. A
   **public subnet** has a route to an **internet gateway**; a **private subnet** does not. A **NAT
   gateway** lets private-subnet resources make **outbound** internet connections without being
   reachable from the internet.
10. **High availability vs durability vs DR.** Spread workloads across **multiple AZs** — a single AZ
    is a single point of failure. **RDS Multi-AZ** is a **synchronous standby for failover
    (availability)**, *not* read scaling; **read replicas** are **asynchronous** and for **read
    scaling**. Cross-Region **disaster recovery** must be designed on purpose; know RTO/RPO.
11. **Serverless / Lambda.** "Serverless" means **you don't provision or patch servers**, not that
    there are none. Lambda is **event-driven** and **stateless**, billed by **requests + duration
    (GB-seconds)**, with a **15-minute maximum** execution time and configurable memory (**up to
    10,240 MB**, with CPU scaling alongside memory). It's the wrong tool for long-running or stateful
    jobs; mind **cold starts**.
12. **RDS vs DynamoDB.** **RDS** is **managed relational** (MySQL, PostgreSQL, MariaDB, Oracle, SQL
    Server, plus **Aurora**) — AWS handles patching/backups/Multi-AZ, but you pick an instance size
    and get **no OS access**. **DynamoDB** is a **managed NoSQL** key-value/document store with
    single-digit-millisecond latency that scales automatically; you **design around access
    patterns** (no SQL joins). Choose by **data model**, not by "NoSQL is newer/better."
13. **Cost realities.** Pay-as-you-go; commitments (Savings Plans / RIs) trade flexibility for a
    discount. **Data transfer**: **inbound is generally free**, **outbound to the internet and
    cross-Region transfer cost money** — a frequent surprise. **Stopping** an EC2 instance stops
    compute charges but the **EBS volume still costs**; an **Elastic IP** costs while it's not
    associated with a running instance. **Set an AWS Budget and billing alarm.** Do **not** quote
    specific prices.
14. **Encryption.** **At rest** (SSE-S3, SSE-KMS, EBS encryption) vs **in transit** (TLS/HTTPS).
    **AWS KMS** manages the keys; distinguish **AWS managed keys**, **customer managed keys**, and
    **AWS owned keys**. Encryption at rest does **not** protect data in transit, and vice versa.
15. **Scaling terms.** **Vertical scaling** = a bigger instance; **horizontal scaling** = more
    instances. An **Auto Scaling group** maintains a desired count across AZs; an **Elastic Load
    Balancer** distributes incoming traffic. **Elasticity** (scale out and back in with demand) is
    not the same as raw capacity.
16. **Credentials hygiene.** **Never hardcode or commit access keys.** On EC2 use an **instance
    role** (instance profile); in general prefer **roles and temporary STS credentials** over
    long-term keys. `aws configure` stores a profile locally.
17. **The Well-Architected Framework has six pillars:** **Operational Excellence, Security,
    Reliability, Performance Efficiency, Cost Optimization, and Sustainability.** Get the count and
    names right.
18. **Service names.** Use the correct product name (Amazon S3, Amazon EC2, AWS Lambda, Amazon RDS,
    Amazon VPC, AWS IAM, Amazon CloudWatch, AWS CloudFormation, Amazon Route 53, Amazon CloudFront,
    Amazon DynamoDB, Amazon ECS/EKS, AWS Fargate, AWS KMS, Amazon SQS/SNS/EventBridge). Don't invent
    services, ARNs, or API actions.

## Lesson structure (match the shell + the other courses)

Front-matter (YAML): `id` (`lesson-NN`), `slug`, `title`, `level` (`beginner|intermediate|advanced`),
`order` (1–24), `duration` (minutes), `tags` (exactly 5), `summary` (one sentence — used to generate
the manifest). Then these H1 sections, in order:

`Learning Objectives` · `Why It Matters` · `Concept Explanation` (use `###` subsections) ·
`Key Terminology` · `Options and Trade-offs` (a table) · `Worked Example` · `Real World Analogy` ·
`Examples` (`## Example 1/2/3`: basic, real-world, pitfall) · `Common Mistakes` · `Best Practices` ·
`Summary` · `Flash Cards` (≥5 `Q:`/`A:` pairs; put 6) · `Exercises` (`### Easy/Medium/Challenging`) ·
`Further Reading` (links to the sources above).

## Code fences (only these languages — enforced by the validator)

`bash` (the AWS CLI and shell — **primary**), `json` (IAM policies, CLI output, config), `yaml`
(CloudFormation templates and declarative config), `python` (Lambda handlers and the boto3 SDK), and
`text` (console output, ARNs, region/AZ diagrams, tables). **No other fence languages.**

## Curriculum (24 lessons, 8/8/8)

Beginner: 01 what-is-aws-and-cloud · 02 aws-global-infrastructure · 03 aws-accounts-and-free-tier ·
04 shared-responsibility-model · 05 iam-fundamentals · 06 interacting-with-aws · 07 ec2-fundamentals
· 08 s3-fundamentals.

Intermediate: 09 vpc-and-networking · 10 ec2-in-depth · 11 load-balancing-and-auto-scaling · 12
s3-in-depth · 13 databases-on-aws · 14 lambda-and-serverless · 15 monitoring-with-cloudwatch · 16
infrastructure-as-code.

Advanced: 17 dns-and-content-delivery · 18 decoupling-with-messaging · 19 high-availability-and-dr ·
20 security-in-depth · 21 well-architected-framework · 22 cost-optimization · 23
containers-on-aws · 24 capstone-well-architected-web-app.

## Quizzes

One per lesson: `public/quizzes/lesson-NN.json`, `id` `quiz-lesson-NN`, `lessonId` `lesson-NN`,
`passingScore` 60, 5–6 questions spanning the five types (`single-choice`, `multiple-choice`,
`fill-blank`, `ordering`, `match-pair`). Every answer must be traceable to the lesson text; add an
`explanation` to each. Keep `fill-blank` answers short and provide case/spelling variants (e.g.
`"IAM"`, `"iam"`). Use the quiz to reinforce the anti-hallucination points above (especially the
shared responsibility split, Region vs AZ, stateful vs stateless firewalls, durability vs
availability, Multi-AZ vs read replica, and the six pillars).
