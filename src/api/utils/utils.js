const validator = require("validator");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const bcrypt = require('bcrypt');

/**
 * Function to check Members properties : if exists, and their validity.
 * @param {*} objectsToCheck Object array used to check their properties.
 */
exports.checkMembersKeys = (objectsToCheck) => {
  if (objectsToCheck.length > 0) {
    let res = true;
    objectsToCheck.map((obj) => {
      if (!obj.lastname) {
        throw "Lastname is required.";
      }

      if (!obj.firstname) {
        throw "Firstname is required.";
      }

      if (!obj.email) {
        throw "Email is required.";
      } else {
        if (!validator.isEmail(obj.email)) {
          throw "Email wrong format.";
        }
      }

      if (!obj.phoneNumber) {
        throw "Phone number is required.";
      } else {
        try {
          let testPhone = phoneUtil.isValidNumber(
            phoneUtil.parse(obj.phoneNumber, "FR")
          );
          if (!testPhone) {
            throw "Phone number is not valid.";
          }
        } catch (err) {
          throw "Phone number is not valid.";
        }
      }
    });
    return res;
  }
};


/**
 * Function that check if all questions in a group are fulfilled.
 * @param {*} objectsToCheck Array of questions, we need to check if all questions ar fulfilled.
 */
exports.checkQuestionsKeys = (objectsToCheck) => {
  if (objectsToCheck) {
    let res = true;
    let count = 0;

    for(const property in objectsToCheck) {
      try  {
        if (objectsToCheck[`${property}`]) {
          count++;
        } else {
          throw `You need to answer the question n°${count+1}.`;
        }
      } catch (err) {
        throw `You need to answer the question n°${count+1}.`;
      }
    }
    if(count !== 5){
      res = false;
    }
    return res;
  }
}

/**
 * Function which return a capitalized string value. (The first char of the string in parameter will get his entire value LowerCased, and his first char will be UpperCased).
 * @param {*} str String value to capitalize (Firstname for example).
 */
exports.capitalize = (str) => {
    let firstCharCapitalize = str.charAt(0).toUpperCase();
    const splicedStr = str.slice(1, str.length).toLowerCase();
    return firstCharCapitalize + splicedStr;
}

/**
 * Decrypt a password, and return a boolean value if it's the same or not.
 * @param {*} inputPassword The password set by the client
 * @param {*} dbPassword The encrypted password get through the Database. 
 */
exports.decryptPassword = async (inputPassword, dbPassword) => {
  bcrypt.compare(inputPassword, dbPassword, (err, result) => {
    if (err || result === false) {
      throw "Passwords not equals";
    } else {
      return result;
    }
  });
}