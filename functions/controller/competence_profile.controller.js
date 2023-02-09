const Sequelize = require('sequelize')
const CompetenceProfile = require('../model/competence_profile.model')

const registerCompetence = async (
  person_id,
  competence_id,
  years_of_experience,
) => {
  try {
    const competenceProfileExists = await CompetenceProfile.findOne({
      where: {
        [Sequelize.Op.and]: [
          { person_id },
          { competence_id },
          { years_of_experience },
        ],
      },
    })
    if (competenceProfileExists) {
      throw new Error('Competence profile already exists')
    }
    const newCompetenceProfile = await CompetenceProfile.create({
      person_id,
      competence_id,
      years_of_experience,
    })
    return newCompetenceProfile
  } catch (error) {
    throw error
  }
}

module.exports = { registerCompetence }
