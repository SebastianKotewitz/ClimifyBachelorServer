import dispatcher from "../dispatcher";
import * as questionService from "../services/questionService";

export function setActive(questionId, activeStatus) {
    questionService.setActive(questionId, activeStatus).then(() => {
        dispatcher.dispatch({
            type: "QUESTION_SET_ACTIVE",
            questionId
        })
    })
}


export function createQuestion(questionValue, answerOptions, rooms) {
    questionService.createQuestion(questionValue, answerOptions, rooms).then(question => {
        console.log("newly posted questions", question);
        dispatcher.dispatch({
            type: "CREATE_QUESTION",
            question
        })
    });
}


export function receiveQuestions(roomId) {
    questionService.getQuestions(roomId).then(questions => {
        dispatcher.dispatch({
            type: "RECEIVE_QUESTIONS",
            questions
        })
    }).catch(error => {
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_QUESTIONS",
            error
        })
    });
}
