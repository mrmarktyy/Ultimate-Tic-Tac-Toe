#!/bin/bash

mongo="$(which mongo)"
mongod="$(which mongod)"
mongo_data_path=$HOME"/mongodb/data/"
mongo_log_path=$HOME"/mongodb/log/"
mongo_db_name="ratecity-data"
port1=27017
port2=27018
port3=27019
hostname="$(scutil --get ComputerName)"

echo "Creating mongodb data directory..."
echo ""
sleep 3

mongo_data_dir_0=${mongo_data_path}${mongo_db_name}-0
mongo_data_dir_1=${mongo_data_path}${mongo_db_name}-1
mongo_data_dir_2=${mongo_data_path}${mongo_db_name}-2

mkdir -p ${mongo_data_dir_0} 
mkdir -p ${mongo_data_dir_1} 
mkdir -p ${mongo_data_dir_2} 

echo ""
echo "Create mongodb log directory..."

mkdir -p ${mongo_log_path}
echo ""

echo "MongoDB data directory created at ${mongo_data_path}"
sleep 3

echo "Start mongod  for all 3 nodes..."
sleep 3

nohup ${mongod} --port ${port1} --dbpath ${mongo_data_dir_0} --replSet ${mongo_db_name} --smallfiles --oplogSize 128 > ${mongo_log_path}setupMongo.log 2>&1& 
nohup ${mongod} --port ${port2} --dbpath ${mongo_data_dir_1} --replSet ${mongo_db_name} --smallfiles --oplogSize 128 > ${mongo_log_path}setupMongo.log 2>&1& 
nohup ${mongod} --port ${port3} --dbpath ${mongo_data_dir_2} --replSet ${mongo_db_name} --smallfiles --oplogSize 128 > ${mongo_log_path}setupMongo.log 2>&1& 


sleep 3

echo "Start initiate mongo replica set"
sleep 3
${mongo} --port=${port1} --eval 'rs.initiate();'
echo ""
echo "Finished initiate mongo replica set"
echo ""
echo "Check mongo replica set conf"
echo ""
sleep 2
${mongo} --port=${port1} --eval 'rs.conf();'
echo ""
echo "Added 2nd node into replica set"
sleep 2
${mongo} --port=${port1} --eval "rs.add(\"${hostname}.local:${port2}\");"
echo ""
echo "Add 3rd nod einto replica set"
sleep 2
${mongo} --port=${port1} --eval "rs.add(\"${hostname}.local:${port3}\");"
sleep 5
echo ""
echo "MongoDB replica set setup finished."

echo "***************** Replica Set Status******************************"

${mongo} --port=${port1} --eval "rs.status();"
