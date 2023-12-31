// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import model(s)
const { Student, Classroom, StudentClassroom } = require('../db/models');
const { Op } = require("sequelize");
const paginationMiddleware = require('../utils/paginationMiddleware');

router.use(paginationMiddleware)

// List
router.get('/', async (req, res, next) => {
    let errorResult = { errors: [], count: 0, pageCount: 0 };

    // Phase 2A: Use query params for page & size
    // Your code here
    // const page = req.query.page === undefined ? 1 : parseInt(req.query.page)
    // const size = req.query.size === undefined ? 10 : parseInt(req.query.size)

    // // Phase 2B: Calculate limit and offset
    // // Phase 2B (optional): Special case to return all students (page=0, size=0)
    // // Phase 2B: Add an error message to errorResult.errors of
    //     // 'Requires valid page and size params' when page or size is invalid
    // // Your code here
    // let limit
    // let offset
    // if(page === 0 || size === 0){
    //     limit = null
    //     offset = null
    // }else if(page >= 1 && size >= 1){
    //     limit = size
    //     offset = size * (page-1)
    // }else{
    //     errorResult.errors.push({message: 'Requires valid page and size params'})
    // }

    // Phase 4: Student Search Filters
    /*
        firstName filter:
            If the firstName query parameter exists, set the firstName query
                filter to find a similar match to the firstName query parameter.
            For example, if firstName query parameter is 'C', then the
                query should match with students whose firstName is 'Cam' or
                'Royce'.

        lastName filter: (similar to firstName)
            If the lastName query parameter exists, set the lastName query
                filter to find a similar match to the lastName query parameter.
            For example, if lastName query parameter is 'Al', then the
                query should match with students whose lastName has 'Alfonsi' or
                'Palazzo'.

        lefty filter:
            If the lefty query parameter is a string of 'true' or 'false', set
                the leftHanded query filter to a boolean of true or false
            If the lefty query parameter is neither of those, add an error
                message of 'Lefty should be either true or false' to
                errorResult.errors
    */
    const where = {};

    // Your code here
    const queryFirstName = req.query.firstName

    if(queryFirstName !== undefined){
        where.firstName = {
            [Op.like] : `%${queryFirstName}%` 
        }
    }

    const queryLastName = req.query.lastName

    if(queryLastName !== undefined){
        where.lastName = {
            [Op.like] : `%${queryLastName}%` 
        }
    }

    const leftyFilter = req.query.lefty

    console.log(leftyFilter)
    
    if(leftyFilter !== undefined){
        if(['true', 'false'].includes(leftyFilter)){
            where.leftHanded = leftyFilter === 'true' ? 1 : 0
        }else{
            errorResult.errors.push({message: 'Lefty should be either true or false'})
        }
    } 


   

    // Phase 3C: Include total student count in the response even if params were
        // invalid
        /*
            If there are elements in the errorResult.errors array, then
            return a "Bad Request" response with the errorResult as the body
            of the response.

            Ex:
                errorResult = {
                    errors: [{ message: 'Grade should be a number' }],
                    count: 267,
                    pageCount: 0
                }
        */
    // Your code here
    errorResult.count = await Student.count()


     // Phase 2C: Handle invalid params with "Bad Request" response
     if(errorResult.errors.length > 0){
        res.status(400).json(errorResult)
        return
    }

    let result = {};

    // Phase 3A: Include total number of results returned from the query without
        // limits and offsets as a property of count on the result
        // Note: This should be a new query
    
    

    

   
    console.log(where)
    result.rows = await Student.findAll({
        attributes: ['id', 'firstName', 'lastName', 'leftHanded'],
        where,
        include: {
            model: Classroom,
            attributes: ['id', 'name'],
            through: {
                model: StudentClassroom,
                attributes: ['grade']
            }
        },
        // Phase 1A: Order the Students search results
        order: [['lastName', 'ASC'], ['firstName', 'ASC'], [Classroom, StudentClassroom, 'grade', 'DESC'] ],
        limit: req.limit,
        offset: req.offset
    });

    // Phase 2E: Include the page number as a key of page in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // page to 1
        /*
            Response should be formatted to look like this:
            {
                rows: [{ id... }] // query results,
                page: 1
            }
        */
    // Your code here

    

    result.page = req.page === 0 ? 1 : req.page

    // Phase 3B:
        // Include the total number of available pages for this query as a key
            // of pageCount in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // pageCount to 1
        /*
            Response should be formatted to look like this:
            {
                count: 17 // total number of query results without pagination
                rows: [{ id... }] // query results,
                page: 2, // current page of this query
                pageCount: 10 // total number of available pages for this query
            }
        */
    // Your code here

    

    
    const queryCount = result.rows.length

    let numLeftHandedStudents = 0;
    let numAlfonsiStudents = 0;

    result.rows.forEach((row) => {
        if(row.leftHanded){
            numLeftHandedStudents++
        }

        if(row.lastName === 'Alfonsi'){
            numAlfonsiStudents++
        }
    })

    result.count = {
        numStudents: queryCount,
        numLeftHandedStudents: numLeftHandedStudents,
        numRightHandedStudents: queryCount - numLeftHandedStudents,
        numAlfonsiStudents: numAlfonsiStudents
    }

    result.pageCount = req.size === 0 ? 1 : Math.ceil(queryCount/req.size)

    res.json(result);
});

// Export class - DO NOT MODIFY
module.exports = router;