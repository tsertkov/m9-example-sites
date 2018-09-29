# LambCI based CI/CD

CI/CD is build with [custom fork](https://github.com/tsertkov/lambci) of [LambCI](https://github.com/lambci).

## LambCI Installation

### lambci local utility

Install `lambci` command line utility locally.

```bash
$ npm install -g lambci
```

### Setup LambCI with ECS worker

Create LambCI stack as documented at https://github.com/lambci/lambci.

Follow documentation at https://github.com/lambci/ecs.

## IAM role for running CI tasks

Create IAM role for running ci tasks with.

```bash
$ DOMAIN=tokenguru.net aws cloudformation create-stack \
  --stack-name "${DOMAIN/./-}-ci-role" \
  --template-body "file://${PWD}/ci-role.template.yaml" \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=DomainName,ParameterValue="$DOMAIN" ParameterKey=ProjectName,ParameterValue="${DOMAIN/./-}"
```

## Project configuration

### Set project configuration

Replace following variables with their values:

- CLUSTER: ECS Cluster Id (lambci-ecs-Cluster-*)
- TASK: ECS Task Id (lambci-ecs-BuildTask-*)
- TASK_ROLE: Arn of IAM role managed by ci-role stack

```bash
$ lambci config --project gh/t-projects/tokenguru.net CHECK_VERSION_URL false
$ lambci config --project gh/t-projects/tokenguru.net noClone true
$ lambci config --project gh/t-projects/tokenguru.net branches.staging true
$ lambci config --project gh/t-projects/tokenguru.net env.LAMBCI_DOCKER_RUN_ARGS "--ulimit nofile=65535:65535"
$ lambci config --project gh/t-projects/tokenguru.net docker.cluster <CLUSTER>
$ lambci config --project gh/t-projects/tokenguru.net docker.task <TASK>
$ lambci config --project gh/t-projects/tokenguru.net docker.taskRole <TASK_ROLE>
```

### Enable GitHub integration:

```bash
$ lambci hook --add gh/t-projects/<REPO_NAME>
```
