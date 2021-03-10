/**
 * Get all questions stored in a JSON file in "/ressources/questions.json".
 * @param {*} req Request data.
 * @param {*} res The response we'll send to the client.
 */
exports.list_all_questions = (req, res) => {
    const questions = {
        q1: "What's the name of your project ? : ",
        q2: "Which languages are used for this project ? : ",
        q3: "Which sector are you targeting? (Ex: Finance, Medical) : ",
        q4: "Tell us about your solution : ",
        q5: "What do you expect from this Hackathon ? : "
    
    };

    res.status(200);
    res.json(questions);
    console.log("Questions successfully sent");
}