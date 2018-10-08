const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
const DEPLOY_IN_PROGRESS = 'DEPLOY_IN_PROGRESS'
const DEPLOY_JOB = 'DEPLOY_JOB'

module.exports = class Deployer {
  constructor ({ table, deployFnName, deployTimeout }) {
    this.deployTimeout = deployTimeout * 1000
    this.table = table
    this.deployFnName = deployFnName
    this.ddb = new AWS.DynamoDB()
  }

  deploy () {
    return lambda.invoke({
      FunctionName: this.deployFnName,
      InvocationType: 'Event'
    }).promise()
  }

  getKeyForRecord (record) {
    const {
      dynamodb: {
        NewImage: newImage,
        OldImage: oldImage
      }
    } = record

    return newImage
      ? newImage.key.S
      : oldImage.key.S
  }

  isUnsupportedKey (key) {
    return ![
      DEPLOY_IN_PROGRESS,
      DEPLOY_JOB
    ].includes(key)
  }

  async isDeployEvent (record, key) {
    const {
      dynamodb: {
        NewImage: newImage
      }
    } = record

    if (key === DEPLOY_IN_PROGRESS) {
      if (newImage && newImage.running.BOOL) return false
      return !!await this.getDeployJob()
    }

    if (key === DEPLOY_JOB) {
      if (!newImage) return false

      const deployInProgress = await this.getDeployInProgress()
      if (!deployInProgress) {
        return true
      } else if (deployInProgress > this.deployTimeout) {
        // cleanup failed deploy
        await this.deleteDeployJob()
        await this.setDeployInProgress(false)
        return true
      }

      return false
    }
  }

  async processDbEvent (event) {
    const records = event.Records.reduce((acc, record) => {
      const key = this.getKeyForRecord(record)
      if (this.isUnsupportedKey(key)) return acc
      acc[key] = record
      return acc
    }, {})

    for (const key in records) {
      const record = records[key]
      if (await this.isDeployEvent(record, key)) {
        return this.deploy()
      }
    }
  }

  async scheduleDeployJob (requestTime) {
    const lastDeployJob = await this.getDeployJob()
    if (!lastDeployJob.Item) return this.setDeployJob(requestTime)

    const lastRequestTime = Number(lastDeployJob.Item.requestTime.N)

    // Return early if a newer request was already processed
    if (requestTime <= lastRequestTime) return

    return this.setDeployJob(requestTime, lastRequestTime)
  }

  async getDeployInProgress () {
    const deployInProgress = await this.ddb.getItem({
      TableName: this.table,
      Key: {
        key: { S: DEPLOY_IN_PROGRESS }
      }
    }).promise()

    if (!deployInProgress.Item) return 0
    if (!deployInProgress.Item.running.BOOL) return 0
    return Date.now() - Number(deployInProgress.Item.modTime.N)
  }

  setDeployInProgress (status = true) {
    const modTime = Date.now()
    const putItemParams = {
      TableName: this.table,
      Item: {
        key: { S: DEPLOY_IN_PROGRESS },
        modTime: { N: modTime.toString() },
        running: { BOOL: status }
      }
    }

    if (status) {
      putItemParams.ConditionExpression = 'NOT (running = :isRunning)'
      putItemParams.ExpressionAttributeValues = {
        ':isRunning': { BOOL: true }
      }
    }

    return this.ddb.putItem(putItemParams).promise()
  }

  async getDeployJob () {
    const deployJobs = await this.ddb.getItem({
      TableName: this.table,
      Key: {
        key: { S: DEPLOY_JOB }
      }
    }).promise()

    if (!deployJobs.Item) return false
    return deployJobs.Item
  }

  deleteDeployJob () {
    return this.ddb.deleteItem({
      TableName: this.table,
      Key: {
        key: { S: DEPLOY_JOB }
      }
    }).promise()
  }

  setDeployJob (requestTime, lastRequestTime) {
    const putItemParams = {
      TableName: this.table,
      Item: {
        key: { S: DEPLOY_JOB },
        requestTime: { N: requestTime.toString() }
      }
    }

    if (lastRequestTime) {
      // Return early if a newer request was already processed
      if (requestTime <= lastRequestTime) return

      // Safely update deploy request time making sure no other request
      // were made while fn was running
      putItemParams.ConditionExpression = 'requestTime = :lastRequestTime'
      putItemParams.ExpressionAttributeValues = {
        ':lastRequestTime': { N: lastRequestTime.toString() }
      }
    }

    return this.ddb.putItem(putItemParams).promise()
  }
}
