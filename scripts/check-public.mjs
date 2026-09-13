import { execFileSync } from 'node:child_process';
const files=execFileSync('git',['diff','--cached','--name-only','--diff-filter=ACM','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbidden=/^(?:\.local\/|\.xrpl-devex\/|\.codex\/|\.vercel\/|reference\/|wallets\/|data\/|secrets\/|\.env(?:$|\.))/;
let failures=0;
for(const file of files){
  if(file !== '.env.example' && forbidden.test(file)){console.error(`Restricted staged path: ${file}`);failures++;continue;}
  const content=execFileSync('git',['show',`:${file}`],{encoding:'utf8',maxBuffer:8*1024*1024});
  for(const name of ['MISTRAL_API_KEY','RECOGNITIUM_API_KEY','PROTOTYPE_BROKER_TOKEN','PROTOTYPE_BORROWER_TOKEN','PROTOTYPE_OPERATOR_TOKEN','HOSTED_BORROWER_TOKEN','HOSTED_BROKER_TOKEN','BLOB_READ_WRITE_TOKEN','VERCEL_OIDC_TOKEN']){
    const secret=process.env[name];if(secret && secret.length>=16 && content.includes(secret)){console.error(`Configured secret detected in: ${file}`);failures++;}
  }
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)||/\bsEd[1-9A-HJ-NP-Za-km-z]{25,}\b/.test(content)){console.error(`Private key material pattern in: ${file}`);failures++;}
}
console.log(JSON.stringify({stagedFilesChecked:files.length,failures,note:'Scoped path/key scan; human review still required for public content.'}));
if(failures)process.exitCode=1;
