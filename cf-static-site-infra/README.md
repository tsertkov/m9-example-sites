# CloudFormation templates

CLoudFormation templates for static-site infrastructure.

## static-site.template.yaml

Parameters: DomainName

Overview: Hosted DNS Zone, S3 Bucket, CloudFront Distribution for staging and production environments and www-redirect domain.

Usage:

```bash
$ DOMAIN=example.com aws cloudformation create-stack \
  --region eu-central-1 \
  --stack-name "${DOMAIN/./-}-static-site" \
  --template-body "file://${PWD}/static-site.template.yaml" \
  --parameters "ParameterKey=DomainName,ParameterValue=$DOMAIN"
```

## domain-certificate-request.template.yaml

Parameters: DomainName

Overview: ACM Certificate Request

Usage:

```bash
$ DOMAIN=example.com aws cloudformation create-stack \
  --region us-east-1 \
  --stack-name "${DOMAIN/./-}-certificate" \
  --template-body "file://${DIR}/domain-certificate.template.yaml" \
  --parameters "ParameterKey=DomainName,ParameterValue=$DOMAIN"
```

