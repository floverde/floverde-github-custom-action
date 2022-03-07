const core = require('@actions/core');
const github = require('@actions/github');

console.log('api-content:', core.getInput('api-content', { required: true }).substring(0, 20));
console.log('akamai-base-uri:', core.getInput('akamai-base-uri', { required: true }));
console.log('access-token:', core.getInput('access-token', { required: true }));
console.log('client-token:', core.getInput('client-token', { required: true }));
console.log('client-secret:', core.getInput('client-secret', { required: true }));
console.log('contract-id:', parseInt(core.getInput('group-id', { required: true })));
console.log('api-server:', core.getInput('api-server', { required: false }));