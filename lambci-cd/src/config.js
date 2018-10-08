const config = require('../config')
module.exports = m9config => {
  const { stage } = m9config
  const {
    region,
    cfId,
    domain
  } = Object.assign(
    {},
    config.common || {},
    config[m9config.stage] || {}
  )

  const s3Bucket = stage === 'production'
    ? domain
    : `${stage}.${domain}`

  return {
    ...m9config,
    deploy: {
      ...m9config.deploy,
      s3Bucket,
      region,
      cfId
    }
  }
}
