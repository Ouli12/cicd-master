module.exports = (server) => {
    const questionsController = require("../controllers/questionsController");
  
    /**
     * Route to get all questions
     */
    server
      .route("/questions")
          .get(questionsController.list_all_questions);
  };
  