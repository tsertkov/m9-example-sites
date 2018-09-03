const Deployer = require('./lib/deployer')
const config = require('./config')
const deployer = new Deployer(config)

module.exports.processDbEvent = function processDbEvent (event) {
  return deployer.processDbEvent(event)
}
