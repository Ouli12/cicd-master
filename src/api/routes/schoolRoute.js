module.exports = (server) => {
  const schoolController = require("../controllers/schoolController");
  const {verify_token} = require("../middleware/jwtMiddleware");

  /**
   * Route to get all schools or create one.
   */
  server
    .route("/schools")
        .get(schoolController.list_all_schools)
        .post(schoolController.create_a_school);

  /**
   * Route to manipulate a school and get it.
   */
  server
    .route("/schools/:school_id")
        .get(schoolController.get_a_school)
        .put(verify_token, schoolController.update_a_school);
};
