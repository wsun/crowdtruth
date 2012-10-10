

// improve text
var speech = "First, we've got to improve our education system. And we've made enormous progress drawing on ideas both from Democrats and Republicans that are already starting to show gains in some of the toughest-to- deal-with schools. We've got a program called Race to the Top that has prompted reforms in 46 states around the country, raising standards, improving how we train teachers. So now I want to hire another hundred thousand new math and science teachers and create 2 million more slots in our community colleges so that people can get trained for the jobs that are out there right now. And I want to make sure that we keep tuition low for our young people."

var hitId = createIdentifyHIT(speech, 0.01)
var hit = mturk.waitForHIT(hitId)

var newText1 = hit.assignments[0].answer.identifyFacts1
var newText2 = hit.assignments[0].answer.identifyFacts2
var newText3 = hit.assignments[0].answer.identifyFacts3
var newText4 = hit.assignments[0].answer.identifyFacts4
var newText5 = hit.assignments[0].answer.identifyFacts5

print("-------------------")
print(newText1)
print(newText2)
print(newText3)
print(newText4)
print(newText5)
print("-------------------")

/*
// verify improvement
if (vote(text, newText, 0.01)) {
    text = newText
    mturk.approveAssignment(hit.assignments[0])
    print("\nvote = keep\n")
} else {
    mturk.rejectAssignment(hit.assignments[0])
    print("\nvote = reject\n")
}
*/    



function createIdentifyHIT(speechText, identifyCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Question>
            <QuestionIdentifier>identifyFacts1</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <FormattedContent><![CDATA[
                    <p><strong>Please identify up to 5 factual claims in the below excerpt. These will be reviewed for their accuracy. 
                    Copy-paste these claims into each of the text boxes below.</strong></p>
                ]]></FormattedContent>
                <Text>{speechText}</Text>
                <Text>Claim 1</Text>
            </QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length minLength="2" maxLength="500"></Length>
                        <AnswerFormatRegex regex="\S" errorText="The content cannot be blank."/>
                    </Constraints>
                    <NumberOfLinesSuggestion>2</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
        <Question>
            <QuestionIdentifier>identifyFacts2</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent><Text>Claim 2</Text></QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length minLength="2" maxLength="500"></Length>
                        <AnswerFormatRegex regex="\S" errorText="The content cannot be blank."/>
                    </Constraints>
                    <NumberOfLinesSuggestion>2</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
        <Question>
            <QuestionIdentifier>identifyFacts3</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent><Text>Claim 3</Text></QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length minLength="2" maxLength="500"></Length>
                        <AnswerFormatRegex regex="\S" errorText="The content cannot be blank."/>
                    </Constraints>
                    <NumberOfLinesSuggestion>2</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
        <Question>
            <QuestionIdentifier>identifyFacts4</QuestionIdentifier>
            <IsRequired>false</IsRequired>
            <QuestionContent><Text>Claim 4</Text></QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length maxLength="500"></Length>
                    </Constraints>
                    <NumberOfLinesSuggestion>2</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
        <Question>
            <QuestionIdentifier>identifyFacts5</QuestionIdentifier>
            <IsRequired>false</IsRequired>
            <QuestionContent><Text>Claim 5</Text></QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length maxLength="500"></Length>
                    </Constraints>
                    <NumberOfLinesSuggestion>2</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
    </QuestionForm>
    
    return mturk.createHIT({title : "Identify Facts", 
                            desc : "Identify factual claims from a political statement",
                            question : "" + q, 
                            reward : identifyCost, 
                            assignmentDurationInSeconds : 5 * 60, 
                            maxAssignments: 1})
}

function createCheckHIT(factText, checkCost) {

}

function vote(textA, textB, voteCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Question>
            <QuestionIdentifier>vote</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <FormattedContent><![CDATA[
<ul>
<li>Please select the better description for this image.</li>
</ul>
<img src="http://groups.csail.mit.edu/uid/turkit/www/nut_people.jpg" alt="description not available"></img>
]]></FormattedContent>
            </QuestionContent>
            <AnswerSpecification>
                <SelectionAnswer>
                    <Selections>
                    </Selections>
                </SelectionAnswer>
            </AnswerSpecification>
        </Question>
    </QuestionForm>

    var options = [{key:"a",value:textA}, {key:"b",value:textB}]
    shuffle(options)
    foreach(options, function (op) {
        default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
        q.Question.AnswerSpecification.SelectionAnswer.Selections.Selection +=
            <Selection>
                <SelectionIdentifier>{op.key}</SelectionIdentifier>
                <Text>{op.value}</Text>
            </Selection>
    })
    var voteHitId = mturk.createHIT({title : "Vote on Text Improvement", desc : "Decide which two small paragraphs is closer to a goal.", question : "" + q,  reward : voteCost, maxAssignments : 2})
    var voteResults = mturk.vote(voteHitId, function (answer) {return answer.vote[0]})
    return voteResults.bestOption == "b"
}
