const m9 = require('@tsertkov/m9-generator')({
  babelCachePath: '/tmp/babel-cache.json',
  dst: '/tmp/build',
  function config (m9config) {
    const { plugins } = m9config.content
    const staticPluginIdx = plugins.findIndex(
      plugin => plugin.name === 'json-dir'
    )

    // Replace json-dir plugin with wp-json
    // to load current content from wp endpoint
    plugins[staticPluginIdx] = {
      name: 'wp-json',
      options: m9config.content.wpJson
    }

    return m9config
  }
})

module.exports.deploy = function deploy (event, context, callback) {
  m9.series('build', 'publish-aws')(err => {
    if (err) {
      callback(err)
    } else {
      callback(null)
    }
  })
}
