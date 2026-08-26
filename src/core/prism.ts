// Prism core + the languages the AWS lessons use. `bash` is the primary
// language — the AWS CLI (`aws ...`) and shell commands. `json` covers IAM
// policies, CLI output, and small config. `yaml` covers CloudFormation
// templates and other declarative config. `python` covers Lambda handlers and
// the AWS SDK for Python (boto3). Plain `text` fences (console output, ARNs,
// diagrams, tables) are left unhighlighted.
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

export default Prism;
