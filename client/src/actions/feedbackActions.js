import dispatcher from "../dispatcher";
import * as feedbackService from "../services/feedbackService";

export function receiveBuildingFeedback(buildingId) {
    console.log("hej");
    dispatcher.dispatch({
        type: "FETCH_FEEDBACK"
    });

    feedbackService.getBuildingFeedback(buildingId).then(feedback => {
        console.log("f", feedback);
        dispatcher.dispatch({
            type: "RECEIVE_FEEDBACK",
            feedback
        })
    }).catch(err => {
        console.log(err);
        dispatcher.dispatch({
            type: "ERROR_RECEIVE_FEEDBACK",
            err
        })
    });

}
