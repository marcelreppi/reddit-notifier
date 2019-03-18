# reddit-notifier

A service that sends email notifications for reddit posts based on keywords for specified subreddits

## How to use

* Configure the ```subreddits.json``` file with the subreddits and keywords you want to track

## Serverless deployment

* Create a ```serverless.yml```
* Deploy lambda function via serverless ```sls deploy -v```

The ```serverless.yml``` should look something like this.

```yml
# serverless.yml

service: reddalert
provider:
  name: aws
  runtime: nodejs8.10
  region: eu-west-1

functions:
  reddalert:
    handler: index.handler
    name: reddalert
    events:
      - schedule: cron(0 * * * ? *)
    environment:
      MAIL_HOST: your_mail_provider_host
      MAIL_PORT: your_mail_provider_port
      MAIL_SENDER: your_sending_mail_address
      MAIL_PW: your_sending_mail_password
      MAIL_RECEIVER: your_receiving_mail_address
```

## Local testing

* ```sls invoke local -f <your-function-name>```