import {EventEmitter} from "events";
import dispatcher from "../dispatcher";


class QuestionsStore extends EventEmitter {


    constructor() {
        super();
        this.questions = [];
    }

    createQuestion(question) {
        this.questions.push(question);
        this.emit("change");
    }

    receiveQuestions(questions) {
        this.questions = questions;
        this.emit("change");
    }

    getQuestions() {
        return this.questions;
    }

    setActiveStatus(questionId) {
        const index = this.questions.findIndex(question => question._id === questionId);
        console.log("before", this.questions);
        if (index >= 0) {
            this.questions[index].isActive = !this.questions[index].isActive;
            this.emit("change");
            console.log("after", this.questions);

        }

    }

    handleActions(action) {
        switch (action.type) {
            case "CREATE_QUESTION":
                this.createQuestion(action.question);
                break;
            case "RECEIVE_QUESTIONS":
                this.receiveQuestions(action.questions);
                break;
            case "QUESTION_SET_ACTIVE":
                this.setActiveStatus(action.questionId);
                break;
        }
    }


}

const store = new QuestionsStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
