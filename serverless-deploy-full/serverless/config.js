module.exports = {
  table: process.env.TABLE,
  deployFnName: process.env.DEPLOY_FN_NAME,
  deployTimeout: Number(process.env.DEPLOY_TIMEOUT)
}
