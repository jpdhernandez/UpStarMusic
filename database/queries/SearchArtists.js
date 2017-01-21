const Artist = require('../models/artist');

/**
 * Searches through the Artist collection
 * @param {object} criteria An object with a name, age, and yearsActive
 * @param {string} sortProperty The property to sort the results by
 * @param {integer} offset How many records to skip in the result set
 * @param {integer} limit How many records to return in the result set
 * @return {promise} A promise that resolves with the artists, count, offset, and limit
 */
module.exports = (criteria = {}, sortProperty = {}, offset = 0, limit = 20) => {
    // console.log(criteria); for debugging
    const query = Artist
        .find(buildQuery(criteria))
        // Below will work if all criteria is specified on the onset 
        // otherwise you have to buildQuery (see below)
        // name: criteria.name,
        // age: { $gte: criteria.age.min, $lte: criteria.age.max },
        // yearsActive: { $gte: criteria.yearsActive.min, $lte: criteria.yearsActive.max }
        // OR
        // .where('name').equals(criteria.name)
        // .where('age').gte(ageMin).lte(ageMax)
        // .where('yearsActive').gte(yearsActiveMin).lte(yearsActiveMax)
        .sort({
            [sortProperty]: 1
        })
        .skip(offset)
        .limit(limit);

    // Result from query above doesn't include collection count 
    // we need to use .count() to grab length of collection query
    return Promise.all([query, Artist.find(buildQuery(criteria)).count()])
        .then((results) => {
            return {
                all: results[0],
                count: results[1],
                offset,
                limit
            };
        });
};

const buildQuery = (criteria) => {
    const query = {};

    if (criteria.name) {
        query.$text = { $search: criteria.name };
        // query.name = new RegExp('^' + criteria.name + '.*', 'i'); non-indexed search; slower
    }

    if (criteria.age) {
        query.age = { $gte: criteria.age.min, $lte: criteria.age.max };
    }

    if (criteria.yearsActive) {
        query.yearsActive = { $gte: criteria.yearsActive.min, $lte: criteria.yearsActive.max };
    }

    return query;
};