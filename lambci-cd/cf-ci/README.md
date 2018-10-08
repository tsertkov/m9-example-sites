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

Create IAM role to be assumed by ci jobs.

```bash
$ DOMAIN=example.com aws cloudformation create-stack \
  --stack-name "${DOMAIN/./-}-ci-role" \
  --template-body "file://${PWD}/ci-role.template.yaml" \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=DomainName,ParameterValue="$DOMAIN" ParameterKey=ProjectName,ParameterValue="${DOMAIN/./-}"
```

## Project configuration

### Configure project

Replace following variables with their values:

- CLUSTER: ECS Cluster Id (lambci-ecs-Cluster-*)
- TASK: ECS Task Id (lambci-ecs-BuildTask-*)
- TASK_ROLE: Arn of IAM role managed by ci-role stack

```bash
$ export PROJECT=gh/example.com
$ export CLUSTER_ID=<CLUSTER>
$ export TASK_ID=<TASK>
$ export TASK_ROLE=<TASK_ROLE>
$ lambci config --project $PROJECT CHECK_VERSION_URL false
$ lambci config --project $PROJECT noClone true
$ lambci config --project $PROJECT branches.staging true
$ lambci config --project $PROJECT env.LAMBCI_DOCKER_RUN_ARGS "--ulimit nofile=65535:65535"
$ lambci config --project $PROJECT docker.cluster $CLUSTER_ID
$ lambci config --project $PROJECT docker.task $TASK_ID
$ lambci config --project $PROJECT docker.taskRole $TASK_ROLE
```

### Integrate with GitHub repo service

```bash
$ lambci hook --add $PROJECT
```
