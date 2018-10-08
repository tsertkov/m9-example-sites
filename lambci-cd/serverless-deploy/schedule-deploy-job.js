const Deployer = require('./lib/deployer')
const config = require('./config')
const deployer = new Deployer(config)

module.exports.scheduleDeployJob = async function scheduleDeployJob (event) {
  const requestTime = event.requestContext.requestTimeEpoch
  return deployer.scheduleDeployJob(requestTime)
}
