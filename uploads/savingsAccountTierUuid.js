// node uploads/savingsAccountTierUuid.js
require('dotenv').config()
var uuid = require('node-uuid')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
const SavingsAccountTier = keystoneShell.list('SavingsAccountTier')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let tiers = await SavingsAccountTier.model.find({}).lean().exec()
    for (let i=0; i < tiers.length; i++) {
      let record = tiers[i]
      await SavingsAccountTier.model.findOneAndUpdate(
        { _id: record._id },
        { $set: { uuid: uuid.v4() } },
        { upsert: false },
      ).exec()
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}()

/* Todo: run following sql before merge

create table savings_accounts_tiers_history_new
(
	collectiondate date not null encode zstd,
	tierid char(50) not null encode zstd,
	productuuid varchar(50) not null encode zstd,
	uuid varchar(100) encode zstd,
	name varchar(256) encode zstd,
	repvaraition varchar(256) encode zstd,
	minimumamount double precision encode zstd,
	maximumamount double precision encode zstd,
	maximumrate double precision encode zstd,
	baserate double precision encode zstd,
	bonusrate double precision encode zstd,
	bonusratecondition varchar(256) encode zstd,
	introductoryrate double precision encode zstd,
	introductoryrateterm double precision encode zstd,
	minimummonthlydeposit double precision encode zstd,
	isdiscontinued boolean,
	filename varchar(256) encode zstd
);

grant all on savings_accounts_tiers_history_new to public;

insert into savings_accounts_tiers_history_new
(
 select collectiondate, tierid, productuuid, uuid, null, name, repvaraition, minimumamount, maximumamount, maximumrate, baserate, bonusrate, bonusratecondition, introductoryrate, introductoryrateterm, minimummonthlydeposit, isdiscontinued, filename  from savings_accounts_tiers_history
);

// run this script
update savings_accounts_tiers_history_new set uuid = d.uuid
from (select tierid, uuid from savings_accounts_tiers_history_new s where uuid is not Null group by 1,2) d
where savings_accounts_tiers_history_new.uuid is Null and d.tierid = savings_accounts_tiers_history_new.tierid
;

alter table savings_accounts_tiers_history rename to savings_accounts_tiers_history_bck;

alter table savings_accounts_tiers_history_new rename to savings_accounts_tiers_history;

 */

/* fn_uuid function has been created in prod and staging, I just leave it here as reference.
create function fn_uuid() returns character varying
	volatile
	language plpythonu
as $$
 import uuid
 return uuid.uuid4().__str__()
$$;
 */
