const keystone = require('keystone')
const keystoneUpdate = require('../../utils/helperFunctions').keystoneUpdate
const logger = require('../../utils/logger')
const csvtojson = require('../../utils/csvToJson')

const CompanyBankAccount = keystone.list('CompanyBankAccount')
const Company = keystone.list('Company')

exports.uploadCsv = async (req, res) => {
	try {
		if (Object.keys(req.files).length === 0) {
			throw 'No upload file is specified'
		}
		const list = await csvtojson(req.files.bankAccountsCompanyUpload.path)
		await upsertBankAccountCompanies(list, req)
		req.flash('success', 'Import successfully.')
		return res.redirect('/import-rates')
	} catch (error) {
		req.flash('error', error)
		return res.redirect('/import-rates')
	}
}

async function upsertBankAccountCompanies (list, req) {
	try {
		const promises = []
		for(let i = 0; i<list.length; i++) {
			const rawCompany = list[i]
			const company = await mapBankAccountsCompanies(rawCompany)
			if(!company) {
				continue
			}
			const bankAccountCompany = new CompanyBankAccount.model()
			bankAccountCompany.set(company)
			promises.push(keystoneUpdate(bankAccountCompany, req))
		}
		await Promise.all(promises)
	} catch (err) {
		logger.error(err)
		throw err
	}
}

async function mapBankAccountsCompanies (rawCompany) {
	const mapping = {
    'companyAtmNumber': 'companyATM',
    'networkAtmNumber': 'networkATM',
		'branchNumber': 'branches',
  }
	if(!rawCompany.company) {
		return null
	}
	const company = await Company.model.findOne({ $or: [
		{ name: { $regex: new RegExp(`^${rawCompany.company}$`, 'i') } },
		{ displayName: { $regex: new RegExp(`^${rawCompany.company}$`, 'i') } },
		{ shortName: { $regex: new RegExp(`^${rawCompany.company}$`, 'i') } },
		{ otherNames: { $regex: new RegExp(`^${rawCompany.company}$`, 'i') } },
	] }).exec()
	if(!company) {
		logger.warn('Wrong company name - ', rawCompany.company)
		return null
	}
	const bankAccountCompany = {}
	for(let key in mapping) {
		bankAccountCompany[mapping[key]] = rawCompany[key]
	}
	bankAccountCompany.company = company._id
	return bankAccountCompany
}
