# RateCity Data CMS

## Prerequisites

* NodeJS >= 6.3.0  `brew install node`
* MongoDB >= 3.2.0  `brew install mongodb`


## Getting Started

* Clone this project from Github
* Install npm packages `npm install`
* Create .env file in the folder `cp .env.example .env`
* Setup MongoDB replica set as below
* Start the server `npm start`
* Visit `http://localhost:4000` to check the website


## MongoDB Replica Set Setup

* Create data directory for each node  
  ```
  mkdir -p ~/mongodb/data/ratecity-data-0
  mkdir -p ~/mongodb/data/ratecity-data-1
  mkdir -p ~/mongodb/data/ratecity-data-2
  ```

* Start 3 mongod
  ```
  nohup mongod --port 27017 --dbpath ~/mongodb/data/ratecity-data-0 --replSet ratecity-data --smallfiles --oplogSize 128 &
  nohup mongod --port 27018 --dbpath ~/mongodb/data/ratecity-data-1 --replSet ratecity-data --smallfiles --oplogSize 128 &
  nohup mongod --port 27019 --dbpath ~/mongodb/data/ratecity-data-2 --replSet ratecity-data --smallfiles --oplogSize 128 &
  ```

* Setup replica setup
  - Go to mongo shell
  ```
  mongo
  ```
  
  - Initiate replica set 
  ```
  rs.initiate()
  ```
  
  - Add secondary nodes into replica set
  ```
  rs.add("RC-FL7-<your machine>-MBP.local:27018")
  rs.add("RC-FL7-<your machine>-MBP.local:27019")
  ```

  - Check the replica set
  ```
  rs.status()
  ```
    
  should see something like
  ```
  {
	"set" : "ratecity-data",
	"date" : ISODate("2016-07-26T01:47:03.175Z"),
	"myState" : 1,
	"term" : NumberLong(2),
	"heartbeatIntervalMillis" : NumberLong(2000),
	"members" : [
		{
			"_id" : 0,
			"name" : "RC-FL7-13-MBP.local:27017",
			"health" : 1,
			"state" : 1,
			"stateStr" : "PRIMARY",
			"uptime" : 3336,
			"optime" : {
				"ts" : Timestamp(1469495779, 1),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2016-07-26T01:16:19Z"),
			"electionTime" : Timestamp(1469494309, 1),
			"electionDate" : ISODate("2016-07-26T00:51:49Z"),
			"configVersion" : 3,
			"self" : true
		},
		{
			"_id" : 1,
			"name" : "RC-FL7-13-MBP.local:27018",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 3314,
			"optime" : {
				"ts" : Timestamp(1469495779, 1),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2016-07-26T01:16:19Z"),
			"lastHeartbeat" : ISODate("2016-07-26T01:47:02.063Z"),
			"lastHeartbeatRecv" : ISODate("2016-07-26T01:47:01.181Z"),
			"pingMs" : NumberLong(0),
			"syncingTo" : "RC-FL7-13-MBP.local:27019",
			"configVersion" : 3
		},
		{
			"_id" : 2,
			"name" : "RC-FL7-13-MBP.local:27019",
			"health" : 1,
			"state" : 2,
			"stateStr" : "SECONDARY",
			"uptime" : 3314,
			"optime" : {
				"ts" : Timestamp(1469495779, 1),
				"t" : NumberLong(2)
			},
			"optimeDate" : ISODate("2016-07-26T01:16:19Z"),
			"lastHeartbeat" : ISODate("2016-07-26T01:47:02.063Z"),
			"lastHeartbeatRecv" : ISODate("2016-07-26T01:47:01.559Z"),
			"pingMs" : NumberLong(0),
			"syncingTo" : "RC-FL7-13-MBP.local:27017",
			"configVersion" : 3
		}
	],
	"ok" : 1
}
  ```
