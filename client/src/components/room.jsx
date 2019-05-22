import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Question from "./question";
import FormDialog from "./formDialog";
import * as questionActions from "../actions/questionActions";
import questionsStore from "../stores/questionsStore";

class Room extends Component {

    constructor(props) {
        super(props);
        this.state = {
            questions: []
        }
    }

    componentWillMount() {
        questionsStore.on("change", this.getQuestions)
    }

    getQuestions = () => {
        this.setState({questions: questionsStore.getQuestions()})
    };

    componentWillUnmount() {
        questionsStore.off("change", this.getQuestions);
    }

    componentDidMount() {
        questionActions.receiveQuestions(this.props.match.params.roomId);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.roomId !== this.props.match.params.roomId)
            questionActions.receiveQuestions(this.props.match.params.roomId);
    }

    render() {
        const {questions, roomName} = this.state;
        return (
          this.props.active ?
            <div className="mt-3">
                <h4>Questions </h4>
                <ul className="list-group">
                    {this.createQuestionItems(questions)}
                    <FormDialog inputProp1={{
                        description: "Enter a question you want to ask users of this room",
                        fieldDescription: "Question",
                        id: "question"
                    }}
                                inputProp2={{
                                    description: "Enter answer options each separated by a comma",
                                    fieldDescription: "Answer options",
                                    id: "answerOptions"
                                }}
                                onSubmit={this.handleSubmitNewQuestion} title="New Question"/>
                </ul>
            </div>
            : <div/>
        );
    }

    handleSubmitNewQuestion = (values) => {
        const question = values[0];
        const answerOptions = values[1].split(",");
        questionActions.createQuestion(question, answerOptions, [this.props.match.params.roomId]);
    };

    createQuestionItems = (questions) => {
        let questionItems = [];

        for (let i = 0; i < questions.length; i++) {
            questionItems.push(<Question answerOptions={questions[i].answerOptions} key={i} questionKey={i.toString()}
                                         value={questions[i].value}
                                         active={questions[i].isActive}
                                         onChange={() => this.handleQuestionActiveChange(questions[i]._id,
                                           !questions[i].isActive)}
            />);
        }
        return questionItems;
    };

    handleQuestionActiveChange = (questionId, activeStatus) => {
        console.log("hejjjj");
        questionActions.setActive(questionId, activeStatus);
    };
}

Room.propTypes = {
    active: PropTypes.bool.isRequired
};

export default Room;
