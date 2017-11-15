# Prerequisites

1. NVM
2. Brew


# Setup

1. Get access to the repo
2. Clone the repository to your local machine
3. ```nvm install 7```
3. ```cd <project direct>```
4. ```npm install -g gulp```
5. ```npm install```
6. create a .env file in the project root and add the following variables
7. ```brew install awsebcli```

````
RECURLY_API_KEY='xxxx'
RECURLY_ACCOUNT_NAME='xxx'
RECURLY_ACCOUNT_ENV='xxxx'
RECURLY_SUBSCRIPTION_CODE='xxxx'
ADMIN_PASSWORD='xxx'
NODE_ENV='development'
ENV='development'

S3_BUCKET_NAME=xxxx
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_DEFAULT_REGION=us-east-1
````
Contact another developer to get the values for xxx

# Operation
1. ```gulp serve```

# Deploying
1. ``` npm run build ```
2. ``` git add . ; git commit -m "Heroku Build"; git push heroku master ```
