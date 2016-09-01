FROM 845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/ratecity/keystone-base:latest
MAINTAINER Rudy Lee <rudylee1988@gmail.com>

ENV AP /data/app

# Application Code
ADD . $AP
WORKDIR $AP

RUN touch .env

RUN npm install

CMD ["supervisord", "-n"]
