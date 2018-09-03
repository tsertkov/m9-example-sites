const commonConfig = require('../config')
module.exports = m9config => {
  const config = {
    ...commonConfig.default,
    ...commonConfig[m9config.stage]
  }

  console.log(m9config.stage, config)

  return {
    ...m9config,
    deploy: {
      ...m9config.deploy,
      region: config.region,
      s3Bucket: config.s3Bucket,
      cfId: config.cfId
    }
  }
}
