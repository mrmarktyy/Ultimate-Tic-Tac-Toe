// node uploads/creditcardsCompanies.js
require('dotenv').config()

var keystone = require('keystone')
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const CompanyCreditCard = keystoneShell.list('CompanyCreditCard')
const Company = keystoneShell.list('Company')

const DATA = [["NAB", "59ca6520-97ec-4f64-9b3b-0eb40520b381", ["aus"]], ["Bendigo Bank", "55b8c691-f384-448b-a392-da67e3497a91", ['aus']], ["ANZ", "d4877aca-0d99-4a56-a0ca-843fb16d3319", ["aus"]], ["Macquarie Bank", "a71012bd-9b92-4c0c-8124-ff20f54c6ef5", ["aus"]], ["RACQ Bank", "5ffc30bb-935b-4141-9002-5cae064e9f3a", ["aus"]], ["Teachers Mutual Bank", "4a322ff1-bf35-40f9-8ebe-c185aeca7680", ["aus"]], ["IMB", "7468803c-b71f-4cc3-90ac-26ce1525f518", ["aus"]], ["Commonwealth Bank", "1696a862-f5d6-4c83-9858-4e401e034668", ["aus"]], ["ECU Australia", "5a1f2c83-10e4-45bd-ada7-66eed3e12d36", ["aus"]], ["Bankwest", "75aa1385-9c1c-41fa-a7da-9c1c5c93a42d", ["aus"]], ["bcu", "36767f46-a3c0-4488-abeb-858cb6251e19", ["aus"]], ["Queenslanders CU", "da920228-7fb2-44e2-a402-d934607fac62", ["aus"]], ["Macquarie Credit Union", "ee814e03-9830-42b2-9362-d0d591459182", ["aus"]], ["Horizon Credit Union", "536e2033-c961-4068-81e8-c93990e09579", ["aus"]], ["St.George Bank", "7ec5ad39-1f4a-4f5b-b118-c16b9e1b9900", ["aus"]], ["BankVic", "83e85835-1a22-4278-9fea-dc817cd04835", ["aus"]], ["Heritage Bank", "95d55346-4eaa-402e-9b22-f84bfca9bf48", ["aus"]], ["American Express", "ec4fb03c-4726-416d-b4b3-3a473e848923", ["aus"]], ["Citi", "850db805-38e8-4d17-94e6-1f288af1ff02", ["aus"]], ["Virgin Money", "1d2d6609-fd07-42c0-b38c-5bddd1598eaf", ["aus"]], ["Coles", "10a37ae0-6356-474c-8239-77b9c4e03573", ["aus"]], ["HSBC", "bf8a6099-bb9f-470a-9d51-2ad876804771", ["aus"]], ["BankSA", "b2427bf5-3c07-4762-9d2a-7a0178693ec2", ["aus"]], ["Nexus Mutual", "ee6a5f7d-6296-4916-a54d-fd1ec80d0ed7", ["aus"]], ["Westpac", "ba0b6c26-653a-4388-b79c-b7c84cdc2a35", ["aus"]], ["MyState ", "507d512a-064c-4893-83f7-6162e218081b", ["aus"]], ["SERVICE ONE Alliance Bank", "66804615-4a44-4eaf-98b6-7f5b31a5d9b2", ["aus"]], ["Bank Australia", "e2ce52e1-ea3c-4a8e-8de3-f38f9bc0028b", ["aus"]], ["Latitude Financial Services", "e67c665d-da05-4e7d-9475-0f1a126fcd8d", ["aus"]], ["Suncorp Bank", "1ad010bf-5b30-4d8c-94aa-271a23edb3a8", ["act", "nsw", "vic", "qld", "sa", "wa", "tas"]], ["BOQ", "b4d19b57-2bdd-4c08-8dec-f46b5f0a8af5", ["aus"]], ["Community First CU", "dcfa1d0f-5365-4875-9f19-1cbea75cb76a", ["aus"]], ["Bank First", "c53a0caf-3efd-4b12-aaeb-9cb7a5b05cb8", ["aus"]], ["ME Bank", "ee98387f-1a87-4145-9b12-06a5b1764703", ["aus"]], ["Qudos Bank", "79d4b1a3-9c4c-42dd-8749-c1cf747172f8", ["aus"]], ["First Option Credit Union", "31e27d97-84c7-4ef5-8316-fdc835841e76", ["aus", "act", "nsw", "vic", "qld", "sa", "tas"]], ["Bank of Melbourne", "a7c45e24-cd8c-4995-a23e-054463dfaf3a", ["aus"]], ["P&N Bank", "6448d34c-ce94-4c50-a2b6-0c6a8adc9f6d", ["aus"]], ["Summerland CU", "101cf80d-5959-468c-bc8f-e333bcbca536", ["aus"]], ["CUA", "e8674789-c12d-4413-8e73-bdedbb1547f3", ["aus"]], ["Hume Bank", "f2fc50de-180a-4769-92c3-af15e16aa5dd", ["aus"]], ["Easy Street Fin Services", "318136e1-0d36-450c-94d1-29235a4c9814", ["aus"]], ["SCU", "7487ebc3-e463-45ad-91b6-cb25dcc3a86f", ["aus"]], ["Bank of US", "6a7d4b69-d51d-420f-87b5-74270d5216aa", ["aus"]], ["Auswide Bank", "b3db38f5-a615-4fcb-b97a-05093f7ac038", ["aus"]], ["My Credit Union", "8e2af9a6-b521-4ea0-8fdf-bb3cf8c5633f", ["aus"]], ["Northern Inland CU", "bffc70e2-087d-4598-981c-6c5dee88ba3d", ["aus"]], ["People's Choice Credit Union ", "b5c47777-4f25-48fa-9f10-671b7938428e", ["aus"]], ["QBANK", "f2c804e6-7865-404c-aaef-945f8ae12cdf", ["aus"]], ["Beyond Bank", "eaae66d6-0bfb-4fd5-b859-f9903db73fc6", ["aus"]], ["Hunter United ", "2efe9eeb-6565-42c7-9497-b1a11a43a7d1", ["aus"]], ["FCCS Credit Union", "4fee42f2-719b-4d5d-af78-8f2177efe39d", ["aus"]], ["Holiday Coast CU", "65bc8ec7-e665-4551-957b-6f731d57f83c", ["aus"]], ["Greater Bank", "fd9fc2a6-c07c-456e-98fb-3b98304d1b40", ["aus"]], ["Police Bank", "c2b0398b-6c10-4b61-92cb-df9a1ced6768", ["aus"]], ["G&C Mutual Bank", "9446e5c1-81ca-448c-b1a3-afa3ef385a9b", ["aus"]], ["Newcastle Permanent", "cca51fdd-0ded-4000-954a-ea2bb7eb558c", ["aus"]], ["Australian Military Bank", "668ea593-0b8e-4d27-b93d-734c9c85de2b", ["aus"]], ["UniBank", "4cffb76c-2c09-4e88-b94b-e0443e7930b6", ["aus"]], ["Jetstar", "6c774cb0-09bd-442c-a145-ed5c27deef90", ["aus"]], ["Woolworths ", "9e8755a6-fe15-4e39-b3db-49e597f35566", ["aus"]], ["Select Credit Union", "2c0932fe-8554-4853-b9db-77415d1ff31d", ["aus"]], ["Woolworths Employees CU", "7cfe8305-ad66-4bdd-b180-6d7820913d81", ["aus"]]]

const STATES = {
  'aus': ['NSW', 'VIC', 'QLD', 'TAS', 'SA', 'WA', 'NT', 'ACT'],
  'nt': 'NT',
  'act': 'ACT',
  'nsw': 'NSW',
  'vic': 'VIC',
  'qld': 'QLD',
  'sa': 'SA',
  'wa': 'WA',
  'tas': 'TAS',
}
module.exports = async function () {
let connection = await mongoosePromise.connect()
  try {
    for (let i = 0; i < DATA.length; i++) {
      let [name, uuid, states] = DATA[i]
      let statesArray = []
      if (states[0] == 'aus') {
        statesArray = STATES.aus
      } else {
        statesArray = states.map((state) => { return STATES[state]})
      }
      let company = await Company.model.findOne({uuid: uuid}).lean().exec()
      if (company) {
        console.log(company)
        await CompanyCreditCard.model.create({company: company._id, availableStates: statesArray}, (error) => {
          if (error) {
            console.log(error)
            return error
          }
        })
      }
    }
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}()
