const Group = require("../models/groupModel");
const School = require('../models/schoolModel');
const {
  capitalize,
  checkMembersKeys,
  checkQuestionsKeys,
} = require("../utils/utils");
const jwt = require('jsonwebtoken');

/**
 * Get a list of all groups from any schools.
 * @param {*} req The request sent.
 * @param {*} res The response of the request.
 */
exports.list_all_groups = async (req, res) => {

  try {
    Group.find({}, (err, groups) => {
      if (err) {
        throw 'Server internal error';
      } else {
        res.status(200);
        res.json(groups);
        console.log("Groups successfully retrieved");
      }
    });
  } catch (err) {
    res.status(500);
    res.json({
      message: err,
    });
  }
};

/**
 * Post a new group to the DataBase.
 * @param {*} req The request sent, where req.body will contains all data we'll need to do the post.
 * @param {*} res The response of the request.
 */
exports.create_a_group = async (req, res) => {
  const { members, questions, about, associatedSchoolId } = req.body;

  try {
    if (checkMembersKeys(members) && checkQuestionsKeys(questions) && about && associatedSchoolId) {
      const emailDoublons = [];

      if(associatedSchoolId.length < 24 || associatedSchoolId.length > 24) {
        throw "This school does not exist";
      }
      
      let schoolVerify = await School.findById({_id: associatedSchoolId}).exec();
      if(!schoolVerify){
        throw "This school does not exist";
      }
      
      /**
       * Format members property to avoid non capitalize firstname, lower-cased email and upper-cased lastname.
       */
      members.forEach((member) => {
        member.lastname = member.lastname.toUpperCase();
        member.firstname = capitalize(member.firstname);
        member.email = member.email.toLowerCase();
      });

      /**
       * Check if members contains a duplicated email.
       * If there's more than 1 occurence of that email, you can't create a group.
       */
      for (let i = 0; i < members.length; i++) {
        if (
          members.filter((member) => {
            return members[i].email === member.email;
          }).length > 1
        ) {
          emailDoublons.push(members[i].email);
        }
      }

      console.log("EmailDoublon : ", emailDoublons);

      if (emailDoublons.length === 0) {
        const new_group = new Group({ ...req.body });

        new_group.save((err, group) => {
          if (err) {
            throw "Internal error occured";

          } else {
            res.status(201);
            res.json(group);
          }
        });
      } else {
          throw "Email must be unique";
      }
    } else {
        throw "All fields must be complete";
    }
  } catch (err) {
    res.status(500);
    res.json({
      message: err,
    });
    console.log(err);
  }
};

/**
 * List all groups from a specific school, where :school_id is his ID.
 * @param {*} req The request sent, where req.params will contains the ID we need.
 * @param {*} res The response of the request.
 */

exports.list_all_school_groups = (req, res) => {
  try {
    const schoolId = req.params.school_id;

    console.log(schoolId)

    School.findById(schoolId, (err, school) => {
      try {
        if (err) {
          throw 'Server internal error 1.';
        } else {
          Group.find({associatedSchoolId: schoolId}, (err, groups) => {
            if (err) {
              throw 'Server internal error 2.';
            } else {
              res.status(200);
              res.json(groups);
            }
          })
        }
      } catch(err) {
        throw err;
      }
      
    })
  } catch(err) {
    res.status(500);
    res.json({
      message: err
    });
  }
}

/**
 * Get a specific group from any school, where :group_id is his ID.
 * @param {*} req The request sent, where req.params will contains the ID we need.
 * @param {*} res The response of the request.
 */
exports.get_a_group = (req, res) => {
  try {
    const groupId = req.params.group_id;
    Group.findById(groupId, (err, group) => {
      if (err || group === null) {
        // Can't use throw to handle error, otherwise it'll .. throw .. an Unhandled error exception
        res.status(500);
        res.json({
          message: "Server internal error.",
        });
      } else  {
        res.status(200);
        res.json(group);
        console.log("Group successfully retrieved");
      }
    });
  } catch (err) {
    res.status(500);
    res.json({
      message: err,
    });
  }
};

/**
 * Delete a specific group from any school, where :group_id is his ID.
 * @param {*} req The request sent, where req.params will contains the ID we need.
 * @param {*} res The response of the request.
 */
exports.delete_a_group = async (req, res) => {
  let statusCode = 201;
  try {
    const groupId = req.params.group_id;
    /**
     * Get the token stored in the "Authorization" request header.
     */
    const payload = jwt.decode(req.headers['authorization']);

    // Equal to : SELECT * FROM Group WHERE _id = :groupId
    const groupData = async () => {
      try {
        return await Group.findById({_id : groupId}).exec();
      } catch(err) {
        throw "Data not found.";
      }
    }

    const resultGroupData = await groupData();

    if (resultGroupData) {
      if (payload.associatedSchoolId === resultGroupData.associatedSchoolId) {
      
        Group.findByIdAndRemove(groupId, (err, group) => {
          if (err) {
            statusCode = 500;
            throw 'Internal server error.';
          } else {
            
            res.status(statusCode);
            res.json({
              message: "Successfully deleted !"
            });
          }
        });
          
      } else {
        statusCode = 403;
        throw 'You are not an administrator of this school.';
      }
    } else{
      statusCode = 403;
      throw 'Data not found';
    }
  } catch (err) {
    res.status(statusCode);
    res.json({
      message: err
    })
  }
}

/**
 * Update a specific group from any school, where :group_id is his ID.
 * @param {*} req The request sent, where req.body will contains all data we need for update.
 * @param {*} res The response of the request.
 */

exports.update_a_group = async (req, res) => {
  let statusCode = 201;
  try {

    const groupId = req.params.group_id;
    const payload = jwt.decode(req.headers['authorization']);
    const {members, questions, about, associatedSchoolId} = req.body;

    const groupData = async () => {
      try {
        return await Group.findById({_id : groupId}).exec();
      } catch(err) {
        throw "Data not found.";
      }
    }

    if(groupId.length < 24 || groupId.length > 24) {
      throw "Wrong group id format";
    }
    
    let groupVerify = await Group.findById({_id: groupId}).exec();
    if(!groupVerify){
      throw "This group does not exist";
    }

    const resultGroupData = await groupData();
    
    if (payload.associatedSchoolId === resultGroupData.associatedSchoolId) {

      if (checkMembersKeys(members) && checkQuestionsKeys(questions) && about && associatedSchoolId) {
        const emailDoublons = [];

        if(associatedSchoolId.length < 24 || associatedSchoolId.length > 24) {
          statusCode = 400;
          throw "Wrong school id format";
        }
        
        let schoolVerify = await School.findById({_id: associatedSchoolId}).exec();
        if(!schoolVerify){
          statusCode = 400;
          throw "This school does not exist";
        }

        members.forEach((member) => {
          member.lastname = member.lastname.toUpperCase();
          member.firstname = capitalize(member.firstname);
          member.email = member.email.toLowerCase();
        });

        for (let i = 0; i < members.length; i++) {
          if (members.filter((member) => {
              return members[i].email === member.email;
            }).length > 1) {
            emailDoublons.push(members[i].email);
          }
        }

        if (emailDoublons.length === 0) {
          Group.findByIdAndUpdate(groupId, req.body, { new: true }, (err, group) => {
            if (err) {
              res.status(500);
              res.json("Internal server error");

            } else {
              res.status(statusCode);
              res.json({
                message: 'Successfully updated',
                group
              });
            }
          });
        } else {
          statusCode = 400;
            throw "Email must be unique";
        }
      } else{
        statusCode = 400;
        throw "All fields are required.";
      }
    } else {
      statusCode = 403;
      throw 'Your are not an administrator of this school.'
    }

  } catch (err) {
    res.status(500);
    res.json({
      message: err
    })
  }
}