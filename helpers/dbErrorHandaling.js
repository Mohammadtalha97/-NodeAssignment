"use strict";

// //get unique error field name

//error may occure like this
// { [MongoError: insertDocument :: caused by :: 11000 E11000 duplicate key error index: mydb-api.users.$email_1  dup key: { : "my@duplicate.com" }]
//   name: 'MongoError',
//   code: 11000,
//   err: 'insertDocument :: caused by :: 11000 E11000 duplicate key error index: mydb-api.users.$email_1  dup key: { : "my@duplicate.com" }' }

const uniqueMessage = (error) => {
  let output;

  try {
    let fieldName = error.message.spilt(".$")[1];
    field = field.spilt(" dub key")[0];
    field = field.substring(0, field.lastIndexOf("_"));
    req.flash("errors", [
      {
        message: "An account with this" + field + "already exists",
      },
    ]);

    output =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + "already exists";
  } catch (err) {
    output = "already exists";
  }

  return output;
};

//get error message from error object

const errorHandler = (error) => {
  let message = "";
  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        console.log(error);
        message = "Something Went Wrong";
    }
  } else {
    for (let errorName in error.errorors) {
      if (error.errorors[errorName].message) {
        message = error.errorors[errorName].message;
      }
    }
  }

  return message;
};

export default errorHandler;
