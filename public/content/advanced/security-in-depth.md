---
id: lesson-20
slug: security-in-depth
title: "Security in Depth: KMS, Secrets, and Encryption"
level: advanced
order: 20
duration: 21
tags:
  - kms
  - encryption
  - secrets-manager
  - defense-in-depth
  - guardduty
summary: "Layered security on AWS — defense in depth across network, identity, and data; encryption at rest and in transit with AWS KMS and envelope encryption; managing secrets with Secrets Manager instead of hardcoding; and the detection services (GuardDuty, WAF, Shield) that watch for threats."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Explain **defense in depth** and why no single control is enough.
- Distinguish encryption **at rest** from **in transit** and where each applies.
- Describe **AWS KMS**, key types, and **envelope encryption**.
- Use **Secrets Manager / Parameter Store** instead of hardcoding secrets.
- Name key **detection/protection** services: GuardDuty, WAF, Shield.

# Why It Matters

Security isn't one setting — it's layers. IAM controls who can act, networking controls what's
reachable, encryption protects the data itself, and detection services watch for trouble. Relying on a
single control (a firewall, say) leaves you one mistake from exposure. This lesson pulls the pieces into
a **defense-in-depth** posture and shows how AWS manages keys and secrets so you never hardcode them.

# Concept Explanation

### Defense in depth

**Defense in depth** means layering multiple, independent controls so that if one fails, others still
protect you:

- **Network** — private subnets, security groups, NACLs, VPC endpoints.
- **Identity** — least-privilege IAM, roles, MFA.
- **Data** — encryption at rest and in transit.
- **Detection** — logging, monitoring, and threat-detection services.

No layer is sufficient alone; together they raise the cost of an attack dramatically.

### Encryption at rest and in transit

- **In transit** — protect data moving over the network with **TLS/HTTPS**. Always use it for APIs and
  data transfer.
- **At rest** — protect stored data with **server-side encryption** (S3 SSE, EBS/RDS encryption). These
  are different protections: encrypting at rest does nothing for data in transit, and vice versa —
  you want **both**.

### AWS KMS and envelope encryption

**AWS Key Management Service (KMS)** creates and controls **encryption keys** and integrates with most
AWS services (S3, EBS, RDS, Secrets Manager, and more). Key types:

- **AWS managed keys** — created and managed by AWS for a service.
- **Customer managed keys** — you control the **key policy**, **rotation**, and access.
- **AWS owned keys** — used by AWS internally, not visible to you.

KMS uses **envelope encryption**: your data is encrypted with a **data key**, and that data key is
itself encrypted by the **KMS key**. The **plaintext key material never leaves KMS** — you ask KMS to
encrypt/decrypt data keys, and **CloudTrail logs every use**, giving you an audit trail. **Key
policies** plus IAM decide who can use a key, and KMS supports **automatic key rotation**. (**CloudHSM**
offers dedicated hardware modules when you need single-tenant key control.)

```json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::123456789012:role/app-role" },
  "Action": ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
  "Resource": "*"
}
```

### Managing secrets

Never hardcode database passwords or API keys in code or config:

- **AWS Secrets Manager** — stores secrets, retrieves them via API at runtime, and can **rotate** them
  automatically (e.g., rotate a database password on a schedule).
- **AWS Systems Manager Parameter Store** — stores configuration and secrets (as **SecureString**),
  cheaper, without built-in rotation.

Applications fetch the secret at runtime using their IAM role — so there's no secret in the repo.

### Detection and protection services

A quick tour of what watches for threats:

- **Amazon GuardDuty** — threat detection that analyzes logs for malicious or unusual activity.
- **AWS WAF** — a **web application firewall** filtering web requests (e.g., SQL injection, XSS).
- **AWS Shield** — DDoS protection (**Standard** is automatic and free; **Advanced** is paid).
- **AWS Security Hub** aggregates findings; **Amazon Inspector** scans for vulnerabilities; **Amazon
  Macie** discovers sensitive data in S3; **AWS Config** tracks compliance.

# Key Terminology

- **Defense in depth** — layering independent controls (network, identity, data, detection).
- **Encryption at rest / in transit** — protecting stored data vs data moving over the network.
- **AWS KMS** — managed service to create and control encryption keys.
- **Envelope encryption** — encrypting data with a data key that KMS itself encrypts.
- **Secrets Manager / Parameter Store** — services to store (and rotate) secrets instead of hardcoding.
- **GuardDuty / WAF / Shield** — threat detection / web firewall / DDoS protection.

# Options and Trade-offs

| Decision | Option A | Option B | How to choose |
| -------- | -------- | -------- | ------------- |
| Encryption keys | AWS managed key | Customer managed key (KMS) | Customer managed when you need control over rotation, policy, and audit; AWS managed for simple defaults. |
| Storing secrets | Secrets Manager | Parameter Store SecureString | Secrets Manager when you need automatic rotation; Parameter Store for cheaper static secrets/config. |
| Web protection | Security groups only | Add AWS WAF + Shield | Add WAF/Shield for internet-facing apps facing application-layer and DDoS threats. |

# Worked Example

Hardening a web app's data and secrets:

```text
1. In transit: serve everything over HTTPS (TLS) via the load balancer / CloudFront.
2. At rest: enable S3 SSE-KMS and RDS encryption using a customer managed KMS key.
3. Secrets: store the database password in Secrets Manager with automatic rotation; the app fetches it
   at runtime via its IAM role — no password in the repo.
4. Access: least-privilege IAM, private subnets for the database, security groups scoped to the app tier.
5. Detection: enable GuardDuty; put AWS WAF in front of the app; rely on Shield Standard for DDoS.
Result: multiple independent layers — even if one fails, the data stays encrypted and access stays
constrained, with threats monitored.
```

# Real World Analogy

Defense in depth is a **medieval castle**: a moat, an outer wall, an inner wall, guards, and a locked
vault — an attacker must defeat **many** layers, not one. **KMS** is the castle's **master locksmith**:
it holds the keys and will lock or unlock things on your behalf, but it **never hands the raw key out
of the vault**, and it writes down every request in a ledger (CloudTrail). **Secrets Manager** is a
secure key cabinet that also **changes the locks periodically** (rotation), so a copied key soon stops
working.

# Examples

## Example 1 — Basic: at rest and in transit are different

A team enables S3 encryption (at rest) and thinks they're done, but their API still serves data over
plain HTTP. Data is protected on disk but exposed on the wire. Adding TLS closes the gap.

**Why this works:** the two protections cover different phases; you need both to protect data end to
end.

## Example 2 — Real-world: rotating a leaked-prone secret

A database password lived in a config file for years. The team moves it to **Secrets Manager** with
30-day rotation; the app fetches it at runtime. Now a copied credential expires soon, and there's no
secret in source control.

**Why this works:** rotation limits the lifetime of any exposed secret, and runtime retrieval keeps it
out of the repo.

## Example 3 — Pitfall: a single layer

An app relies solely on a security group for protection, with an over-permissive IAM policy and no
encryption. One misconfiguration in that single layer exposes everything, with nothing behind it.

**Why this bites:** without defense in depth, a single failure is total; layered controls contain the
blast radius.

# Common Mistakes

- **Relying on one control.** Layer network, identity, data, and detection.
- **Encrypting at rest but not in transit (or vice versa).** Do both.
- **Hardcoding secrets.** Use Secrets Manager/Parameter Store and fetch at runtime.
- **Ignoring detection.** Without GuardDuty/logging, malicious activity goes unseen.

# Best Practices

- Apply **defense in depth**: least-privilege IAM, private networking, encryption everywhere, and
  monitoring.
- Encrypt **at rest with KMS** (customer managed keys where control/audit matter) and **in transit with
  TLS**.
- Keep secrets in **Secrets Manager** with **rotation**; grant access via IAM roles, never commit
  secrets.
- Enable **GuardDuty**, front internet-facing apps with **WAF/Shield**, and review findings.

# Summary

- **Defense in depth** layers independent controls (network, identity, data, detection) so one failure
  isn't total.
- Protect data **at rest** (S3/EBS/RDS encryption) **and in transit** (TLS) — they're separate needs.
- **AWS KMS** manages keys with **envelope encryption**; plaintext key material never leaves KMS, and
  **CloudTrail** audits every use.
- Use **Secrets Manager/Parameter Store** (with rotation) instead of hardcoding, and watch for threats
  with **GuardDuty, WAF, and Shield**.

# Flash Cards

Q: What is defense in depth?
A: Layering multiple independent security controls — network, identity, data, and detection — so that if one fails, others still protect you.

Q: How do encryption at rest and in transit differ?
A: At rest protects stored data (e.g., S3/EBS/RDS encryption); in transit protects data moving over the network (TLS/HTTPS) — they're separate protections and you want both.

Q: What is AWS KMS and what is envelope encryption?
A: KMS is a managed service for creating and controlling encryption keys; envelope encryption encrypts data with a data key that KMS itself encrypts, and the plaintext key material never leaves KMS.

Q: Why use Secrets Manager instead of hardcoding a database password?
A: It stores the secret outside your code, serves it at runtime via IAM, and can rotate it automatically — so no secret sits in the repo and a copied one soon expires.

Q: What does Amazon GuardDuty do?
A: It's a threat-detection service that analyzes logs for malicious or unusual activity in your account.

Q: What is AWS WAF used for?
A: A web application firewall that filters incoming web requests to block application-layer attacks such as SQL injection and cross-site scripting.

# Exercises

### Easy
List the four layers of defense in depth and give one AWS control for each.

### Medium
Explain why encrypting data at rest is not sufficient on its own, and what you'd add to protect it end
to end.

### Challenging
Design the security for a public web app handling sensitive data: describe how you'd protect data (KMS,
TLS), manage the database credential (Secrets Manager), constrain access (IAM/network), and detect
threats (which services) — and name one thing that would still be your responsibility under the shared
responsibility model.

# Further Reading

- AWS — *What is AWS KMS?*: <https://docs.aws.amazon.com/kms/latest/developerguide/overview.html>
- AWS — *AWS KMS concepts (envelope encryption)*: <https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html>
- AWS — *What is AWS Secrets Manager?*: <https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html>
- AWS — *Amazon GuardDuty*: <https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html>
