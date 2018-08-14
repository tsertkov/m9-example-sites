const m9 = require('@tsertkov/m9-generator')({
  babelCachePath: '/tmp/babel-cache.json',
  dst: '/tmp/build'
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
