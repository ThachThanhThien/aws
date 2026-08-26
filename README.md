# AWS Learning Portal

A **frontend-only** Amazon Web Services course: read Markdown lessons, take quizzes, and track
your progress — all in the browser. No sign-up, no backend.

## What this is

The portal shell is built with React 19, Vite, TypeScript, React Router, Tailwind CSS v4,
`marked`, and PrismJS. It renders a **24-lesson curriculum** that takes you from "what is the
cloud?" through AWS global infrastructure, accounts and billing, the shared responsibility model,
IAM, and the core building blocks — EC2 compute and S3 storage — then into networking (VPC), load
balancing and auto scaling, databases (RDS and DynamoDB), Lambda and serverless, monitoring, and
infrastructure as code, ending with production topics: high availability and disaster recovery,
security in depth, the Well-Architected Framework, cost optimization, containers, and an end-to-end
capstone. Every lesson is written in plain, welcoming English and verified against primary sources
(see **Sources** below).

Progress, bookmarks, and quiz scores live in `localStorage` under `aws-learning-*` keys, so
nothing leaves your machine.

## Run it locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## How the content works

The app is **data-driven** — adding a lesson needs no code changes:

1. Write the lesson Markdown in `public/content/<level>/<slug>.md` with YAML front-matter
   (including a `summary`).
2. Add a quiz at `public/quizzes/lesson-NN.json`.
3. Regenerate `public/content/course-manifest.json` from the front-matter (the manifest is
   generated, so it can't drift).

> **Code fences** must declare one of the highlighted languages: `bash` (the primary language — the
> AWS CLI and shell), `json` (IAM policies, CLI output, config), `yaml` (CloudFormation templates),
> `python` (Lambda handlers and the boto3 SDK), or `text` (console output, ARNs, diagrams); see
> `src/core/prism.ts`.

## Curriculum

**Beginner — cloud & AWS foundations:** what is AWS & cloud computing? · AWS global infrastructure ·
accounts, Free Tier & billing · the shared responsibility model · IAM fundamentals · interacting
with AWS (Console, CLI, SDKs) · Amazon EC2 fundamentals · Amazon S3 fundamentals.

**Intermediate — core services & networking:** VPC & networking · EC2 in depth · load balancing &
auto scaling · S3 in depth · databases (RDS & DynamoDB) · Lambda & serverless · monitoring with
CloudWatch · infrastructure as code (CloudFormation).

**Advanced — production & architecture:** DNS & content delivery (Route 53, CloudFront) · decoupling
(SQS, SNS, EventBridge) · high availability & disaster recovery · security in depth (KMS) · the
Well-Architected Framework · cost optimization · containers (ECS, EKS, Fargate) · capstone.

## Accuracy: no hallucination

Every definition, default, and claim is verified against primary sources. The per-lesson authoring
contract lives in `prompts/aws-authoring-prompt.md`.

**Sources:**

- **AWS Documentation** — <https://docs.aws.amazon.com/> — the primary reference for every service.
- **AWS Well-Architected Framework** —
  <https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html> — the six pillars.
- **AWS Shared Responsibility Model** —
  <https://aws.amazon.com/compliance/shared-responsibility-model/>.
- **Service user guides** — IAM, Amazon EC2, Amazon S3, Amazon VPC, AWS Lambda, Amazon RDS,
  Amazon DynamoDB, Amazon CloudWatch, AWS CloudFormation, Amazon Route 53, Amazon CloudFront.
- **AWS General Reference** — <https://docs.aws.amazon.com/general/latest/gr/> — Regions, ARNs,
  service endpoints and quotas.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`BASE_PATH=/<repo>/` and publishes `dist/` to GitHub Pages.

---

React 19 · Vite · TypeScript · React Router · Tailwind CSS v4 · marked · PrismJS ·
localStorage.
