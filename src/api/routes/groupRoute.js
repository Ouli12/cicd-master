module.exports = (server) => {
    const groupController = require("../controllers/groupController");
    const {verify_token} = require("../middleware/jwtMiddleware");
  
    /**
     * Route to get all groups or one specific.
     */
    server
      .route("/groups")
          .get(groupController.list_all_groups)
          .post(groupController.create_a_group);

    /**
     * Route to get all groups from a school
     */
    server
      .route("/schools/:school_id/groups") // req.params.school_id
        .get(groupController.list_all_school_groups)

    /**
     * Route to manipulate a specific group
     */
    server
      .route("/groups/:group_id")
        .get(groupController.get_a_group)
        .put(verify_token, groupController.update_a_group)
        .delete(verify_token, groupController.delete_a_group);
};
