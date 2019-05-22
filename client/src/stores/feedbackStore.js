import {EventEmitter} from "events";
import dispatcher from "../dispatcher";

class FeedbacksStore extends EventEmitter {

    constructor() {
        super();
        this.feedbacks = [];
    }

    receiveFeedback(feedback) {
        this.feedbacks = feedback;
        this.emit("change");
    }

    getFeedback() {
        return this.feedbacks;
    }

    handleActions(action) {
        switch (action.type) {
            case "RECEIVE_FEEDBACK":
                this.receiveFeedback(action.feedback);
                break;
        }
    }

}

const store = new FeedbacksStore();

dispatcher.register(store.handleActions.bind(store));
export default store;
