module.exports = (server) => {
    const userController = require("../controllers/userController");

    /**
     * Route to get the school user (administrator) or create one when it don't exist.
     */
    server
        .route("/schools/:school_id/user")
            .get(userController.get_school_user)
            .post(userController.create_an_user);
    
    /**
     * Route to login a user.
     */
    server
        .route("/login")
            .post(userController.login_an_user);

    /**
     * Route to get all users from all schools.
     */
    server
        .route("/users")
            .get(userController.get_all_users_from_all_schools);
}