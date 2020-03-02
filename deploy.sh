#!/bin/bash
set -e

function post_to_slack () {
  curl -X POST -H "Content-Type: application/json"\
  -d '{"username": "'"$SLACK_USERNAME"'", "attachments": '"$1"'}'\
  "https://hooks.slack.com/services/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"
}

function rollout_status () {
  EXPECTED_REPLICAS=$(kubectl -n ratecity get deployment ultimate-$SHA -o jsonpath='{.status.replicas}')
  AVAILABLE_REPLICAS=$(kubectl -n ratecity get deployment ultimate-$SHA -o jsonpath='{.status.availableReplicas}')

  while [ "$EXPECTED_REPLICAS" != "$AVAILABLE_REPLICAS" ]
  do
    post_to_slack '[{"color": "warning", "text": "Expected Replicas: '"$EXPECTED_REPLICAS"'. \n Available Replicas: '"$AVAILABLE_REPLICAS"'", "mrkdwn_in": ["text"]}]'
    AVAILABLE_REPLICAS=$(kubectl -n ratecity get deployment ultimate-$SHA -o jsonpath='{.status.availableReplicas}')
    sleep 30
  done

  post_to_slack '[{"color": "warning", "text": "Expected Replicas: '"$EXPECTED_REPLICAS"'. \n Available Replicas: '"$AVAILABLE_REPLICAS"'", "mrkdwn_in": ["text"]}]'

  kubectl -n ratecity rollout status deployment/ultimate-$SHA

  if [ "$?" != "0" ]
  then
    post_to_slack '[{"color": "danger", "pretext": "*ERROR*", "text": "Rollout of image for the deployment failed, Aborting!!", "mrkdwn_in": ["text", "pretext"]}]'
    exit -1
  else
    post_to_slack '[{"color": "good", "text": "deployment ultimate-'"$SHA"' successfully rolled out", "mrkdwn_in": ["text"]}]'
  fi
}

function delete_old_deployments () {
  post_to_slack '[{"color": "good", "pretext": "*DELETE OLD DEPLOYMENTS*", "mrkdwn_in": ["pretext"]}]'

  for DEPLOYMENT in $(kubectl -n ratecity get deployments -l app=ultimate -o jsonpath='{range .items[*]}{@.metadata.name}{"\n"}{end}')
  do
    if [ "$DEPLOYMENT" != "ultimate-$SHA" ]
    then
      DEPLOYMENTS_TO_DELETE="$DEPLOYMENTS_TO_DELETE $DEPLOYMENT"
    fi
  done

  for DEPLOYMENT in $DEPLOYMENTS_TO_DELETE
  do
    post_to_slack '[{"color": "warning", "text": "Deleting deployment '"$DEPLOYMENT"'", "mrkdwn_in": ["text"]}]'
    kubectl -n ratecity delete deployment $DEPLOYMENT
    if [ "$?" != "0" ]
    then
      post_to_slack '[{"color": "danger", "pretext": "*ERROR*", "text": "Delete failed, Aboting!!", "mrkdwn_in": ["text", "pretext"]}]'
      exit -1
    else
      post_to_slack '[{"color": "good", "text": "Deleted deployment '"$DEPLOYMENT"'", "mrkdwn_in": ["text"]}]'
    fi
  done
}

STAGE=''
KUBE_CERTIFICATE=''
KUBE_CONFIG=''

if [ "$TRAVIS_BRANCH" = "master" ]
then
  STAGE=staging
  KUBE_CERTIFICATE=$KUBE_CLUSTER_CERTIFICATE_STAGING
  KUBE_CONFIG=kube.staging.config
  SLACK_USERNAME=k8s-staging
else
  STAGE=prod
  KUBE_CERTIFICATE=$KUBE_CLUSTER_CERTIFICATE_PROD
  KUBE_CONFIG=kube.prod.config
  SLACK_USERNAME=k8s-prod
fi

post_to_slack '[{"color": "#439FE0", "pretext": "*ULTIMATE BUILD* `'"$SHA"'`",
"text": "_'"`TZ=Australia/Sydney date +%T`"'_ build started", "mrkdwn_in": ["text", "pretext"]}]'

# Install kubectl
curl -O "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
export PATH=$PATH:$HOME/.local/bin

# Set kubectl config
curl -o config "https://$GITHUB_ACCESS_TOKEN@raw.githubusercontent.com/ratecity/rc-devops/master/k8s/$KUBE_CONFIG"
mkdir ${HOME}/.kube
cp config ${HOME}/.kube/config
kubectl config set clusters.kubernetes-$STAGE.certificate-authority-data $KUBE_CERTIFICATE

# Install awscli
pip install --user awscli
mkdir ${HOME}/.aws
echo "[default]"> ${HOME}/.aws/credentials
echo "region = ap-southeast-2">> ${HOME}/.aws/credentials
echo "output=json" >> ${HOME}/.aws/credentials

# setup aws-iam-authenticator
curl -Lo aws-iam-authenticator "https://amazon-eks.s3-us-west-2.amazonaws.com/1.12.7/2019-03-27/bin/linux/amd64/aws-iam-authenticator"
chmod +x aws-iam-authenticator
sudo mv ./aws-iam-authenticator /usr/local/bin

# login to ECR
eval $(aws ecr get-login --no-include-email --region ap-southeast-2)

# build images
docker build -t 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate:latest -t 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate:$SHA -f ./Dockerfile ./

docker build -t 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate-resque:latest -t 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate-resque:$SHA -f ./Dockerfile ./

if [ "$?" != "0" ]
then
  post_to_slack '[{"color": "danger", "pretext": "*ERROR*", "text": "build failed",
  "mrkdwn_in": ["text", "pretext"]}]'
  exit -1
else
  DATE_NOW=`date`
  post_to_slack '[{"color": "good", "text": "_'"`TZ=Australia/Sydney date +%T`"'_ build successful",
  "mrkdwn_in": ["text"]}]'
fi

post_to_slack '[{"color": "#439FE0", "pretext": "*ULTIMATE IMAGES*", "text": "_'"`TZ=Australia/Sydney date +%T`"'_ push started", "mrkdwn_in": ["text", "pretext"]}]'

# push images
docker push 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate:latest || exit 1
docker push 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate:$SHA || exit 1
docker push 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate-resque:latest || exit 1
docker push 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/$STAGE/ultimate-resque:$SHA || exit 1

post_to_slack '[{"color": "good", "text": "_'"`TZ=Australia/Sydney date +%T`"'_ push finished", "mrkdwn_in": ["text"]}]'

# Get the deployments file
curl -o deployment.yaml "https://$GITHUB_ACCESS_TOKEN@raw.githubusercontent.com/ratecity/rc-devops/master/k8s/ultimate/deployment.yaml"

curl -o deployment.yaml "https://$GITHUB_ACCESS_TOKEN@raw.githubusercontent.com/ratecity/rc-devops/master/k8s/ultimate/deployment-resque.yaml"

# update the variables
sed -i "s/VERSION/$SHA/g" deployment.yaml || exit -1
sed -i "s/\/STAGE/\/$STAGE/g" deployment.yaml || exit -1
sed -i "s/VERSION/$SHA/g" deployment-resque.yaml || exit -1
sed -i "s/\/STAGE/\/$STAGE/g" deployment-resque.yaml || exit -1

# apply new changes
kubectl apply -f deployment.yaml || exit 1
kubectl apply -f deployment-resque.yaml || exit 1

# Staging specific tasks
if [ "$TRAVIS_BRANCH" = "master" ]
then
  post_to_slack '[{"color": "#439FE0", "pretext": "*SWITCHING OVER TO* `'"$SHA"'`", "text": "_'"`TZ=Australia/Sydney date +%T`"'_ Starting switch over", "mrkdwn_in": ["text", "pretext"]}]'

  kubectl -n ratecity patch svc ultimate -p "{\"spec\":{\"selector\": {\"version\": \"${SHA}\"}}}"

  if [ "$?" != "0" ]
  then
    post_to_slack '[{"color": "danger", "pretext": "*ERROR*", "text": "switch over failed, Aborting!!", "mrkdwn_in": ["text", "pretext"]}]'
    exit -1
  else
    rollout_status
    delete_old_deployments
  fi
fi

# Prod specific tasks
if [ "$TRAVIS_BRANCH" = "production" ]
then
  kubectl -n ratecity patch svc ultimate-uat -p "{\"spec\":{\"selector\": {\"version\": \"${SHA}\"}}}"

  post_to_slack '[{
    "color": "good",
    "pretext": "*Ultimate Deployment Created*",
    "actions": [
      {
        "type": "button",
        "style": "good",
        "text": "Switch over to '"$SHA"'",
        "url": "http://k8s.ratecity.com.au/patch?key='"$K8S_API_KEY"'&service=ultimate&version='"$SHA"'"
      }
    ],
    "mrkdwn_in": ["pretext"]
  }]'
fi
