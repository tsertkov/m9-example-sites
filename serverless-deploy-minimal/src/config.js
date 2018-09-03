const config = require('../config')
module.exports = m9config => {
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
