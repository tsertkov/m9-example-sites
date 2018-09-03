const Deployer = require('./lib/deployer')
const config = require('./config')
const deployer = new Deployer(config)

module.exports.deploy = async function deploy () {
  await deployer.setDeployInProgress()
  await deployer.deleteDeployJob()
  await runDeployTask()
  await deployer.setDeployInProgress(false)
  return 'ok'
}

function runDeployTask () {
  const m9 = require('@tsertkov/m9-generator')({
    babelCachePath: '/tmp/babel-cache.json',
    dst: '/tmp/build',
    config (m9config) {
      // Replace json-dir plugin with wp-json to load content from wp endpoint
      const { plugins } = m9config.content
      const staticPluginIdx = plugins.findIndex(
        plugin => plugin.name === 'json-dir'
      )

      plugins[staticPluginIdx] = {
        name: 'wp-json',
        options: m9config.content.wpJson
      }

      return m9config
    }
  })

  return new Promise((resolve, reject) => {
    m9.series('deploy')(err =>
      err
        ? reject(err)
        : resolve()
    )
  })
}
