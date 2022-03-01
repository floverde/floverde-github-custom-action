const core = require('@actions/core');
const EdgeGrid = require('akamai-edgegrid');

try {
  var eg = new EdgeGrid(core.getInput('client-token'),
						core.getInput('client-secret'),
						core.getInput('access-token'),
						core.getInput('base-uri'));

  console.log(`Edge Grid successfully instantiated!!!`);

  eg.auth({
    path: '/api-definitions/v2/contracts/groups',
    method: 'GET',
    headers: {},
  }).send(function (error, response, body) {
    console.log(body);
  });

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
} catch (error) {
  core.setFailed(error.message);
}