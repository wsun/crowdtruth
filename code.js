// improve text
var speech = "First, we've got to improve our education system. And we've made enormous progress drawing on ideas both from Democrats and Republicans that are already starting to show gains in some of the toughest-to- deal-with schools. We've got a program called Race to the Top that has prompted reforms in 46 states around the country, raising standards, improving how we train teachers. So now I want to hire another hundred thousand new math and science teachers and create 2 million more slots in our community colleges so that people can get trained for the jobs that are out there right now. And I want to make sure that we keep tuition low for our young people."
var author = "Barack Obama"

var hitId0 = createIdentifyHIT(speech, 0.01)
var hit0 = mturk.waitForHIT(hitId0)

// collect results
var facts = new Array()
foreach(hit0.assignments[0].answer, function(answer) {
    if (answer) {
        facts.push(answer)
    }
})

// check facts
var hitId1 = createCheckHIT(facts, 0.02)
var hit1 = mturk.waitForHIT(hitId1)
var checkedFacts = checkFacts(facts, hit1)
mturk.approveAssignments(hit1.assignments)

// approve if less than one error
if (facts.length - checkedFacts.length < 2) {
    mturk.approveAssignment(hit0.assignments[0])
}
else {
    mturk.rejectAssignment(hit0.assignments[0])
}

// find sources
var sources = new Array()
foreach(facts, function(fact) {
    var hitId2 = createSourceHIT(fact, author, 0.05)
    var hit2 = mturk.waitForHIT(hitId2)
    sources.push(hit2)
})

// process sources
// process(sources)



print("------------------")
print(sources)
print("------------------")



function createIdentifyHIT(speechText, identifyCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Question>
            <QuestionIdentifier>identifyFacts1</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <FormattedContent><![CDATA[
                    <p><strong>Please identify up 3-5 factual claims in the below excerpt. These will be reviewed for their accuracy. 
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

function createCheckHIT(facts, checkCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm></QuestionForm>
    var num = 0
    foreach(facts, function(fact) {
        var id = "voteFacts" + num

        default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
        q.Question += 
            <Question>
                <QuestionIdentifier>{id}</QuestionIdentifier>
                <IsRequired>true</IsRequired>
                <QuestionContent>
                    <FormattedContent><![CDATA[
                        <p><strong>Is this a coherent, factual claim?</strong></p>
                    ]]></FormattedContent>
                    <Text>{fact}</Text>
                </QuestionContent>
                <AnswerSpecification>
                    <SelectionAnswer>
                        <Selections>
                            <Selection>
                                <SelectionIdentifier>yes</SelectionIdentifier>
                                <Text>Yes</Text>
                            </Selection>
                            <Selection>
                                <SelectionIdentifier>no</SelectionIdentifier>
                                <Text>No</Text>
                            </Selection>
                        </Selections>
                    </SelectionAnswer>
                </AnswerSpecification>
            </Question>
        num += 1
    })
    return mturk.createHIT({title: "Vote on Factual Claims",
                            desc: "Decide if a political statement is a factual claim",
                            question: "" + q,
                            reward: checkCost,
                            assignmentDurationInSeconds: 5 * 60, 
                            maxAssignments: 2 })
}

// helper function to count votes 
function checkFacts(facts, hit) {
    var count = 0
    var sums = new Array()
    var result = new Array()

    for (var i = 0; i < hit.assignments.length; i++) {
        if (i == 0) {
            foreach(hit.assignments[i].answer, function(answer) {
                if (answer == 'yes') {
                    sums.push(1)
                }
                else {
                    sums.push(0)
                }
                count += 1
            })
        }
        else {
            foreach(hit.assignments[i].answer, function(answer) {
                if (answer == 'yes') {
                    sums[count] += 1
                }
                count += 1
            })
        }
        count = 0
    }

    for (var i = 0; i < sums.length; i++) {
        if (sums[i] > 0) {
            print("IN")
            result.push(facts[i])
        }
    }

    return result
}

function createSourceHIT(fact, author, sourceCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Question>
            <QuestionIdentifier>sourceLink</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <FormattedContent><![CDATA[
                    <p><strong>Please find a reputable third-party source that supports or refutes this factual claim.</strong></p>
                ]]></FormattedContent>
                <Text>{author}: {fact}</Text>
                <Text>Paste the link to your source.</Text>
            </QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length minLength="2" maxLength="500"></Length>
                        <AnswerFormatRegex regex="\S" errorText="The content cannot be blank."/>
                    </Constraints>
                    <NumberOfLinesSuggestion>1</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
        <Question>
            <QuestionIdentifier>sourceNote</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <Text>Paste the relevant passage or describe the evidence provided.</Text>
            </QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length minLength="2" maxLength="500"></Length>
                        <AnswerFormatRegex regex="\S" errorText="The content cannot be blank."/>
                    </Constraints>
                    <NumberOfLinesSuggestion>4</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
        <Question>
            <QuestionIdentifier>sourceValidity</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <Text>Does your evidence support or refute the claim?</Text>
            </QuestionContent>
            <AnswerSpecification>
                <SelectionAnswer>
                    <Selections>
                        <Selection>
                            <SelectionIdentifier>support</SelectionIdentifier>
                            <Text>Support</Text>
                        </Selection>
                        <Selection>
                            <SelectionIdentifier>refute</SelectionIdentifier>
                            <Text>Refute</Text>
                        </Selection>
                    </Selections>
                </SelectionAnswer>
            </AnswerSpecification>
        </Question>
    </QuestionForm>

    return mturk.createHIT({title : "Investigate a Factual Claim", 
                            desc : "Investigate whether a political claim is valid",
                            question : "" + q, 
                            reward : sourceCost, 
                            assignmentDurationInSeconds : 10 * 60, 
                            maxAssignments: 2})
}

// helper function to extract source info
function process(sources) {
    var section = new Array()

    foreach(sources, function(hit) {
        var links = new Array()
        var notes = new Array()
        var labels = new Array()

        foreach(hit.assignment, function(assign){
            links.push(assign.answer.sourceLink)
            notes.push(assign.answer.sourceNote)
            labels.push(assign.answer.sourceValidity)
        })

        section.push({ fact: links: link, notes: note, labels: label })
    })


    return section
}

// TODO 
function createVoteHIT(sources, voteCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm></QuestionForm>
    var num = 0
    foreach(sources, function(source) {
        var id = "voteSource" + num
        print(id)

        default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
        q += 
            <Question>
                <QuestionIdentifier>{id}</QuestionIdentifier>
                <IsRequired>true</IsRequired>
                <QuestionContent>
                    <FormattedContent><![CDATA[
                        <p><strong>Is this a factual claim?</strong></p>
                    ]]></FormattedContent>
                    <Text>{fact}</Text>
                </QuestionContent>
                <AnswerSpecification>
                    <SelectionAnswer>
                        <Selections>
                            <Selection>
                                <SelectionIdentifier>yes</SelectionIdentifier>
                                <Text>Yes</Text>
                            </Selection>
                            <Selection>
                                <SelectionIdentifier>no</SelectionIdentifier>
                                <Text>No</Text>
                            </Selection>
                        </Selections>
                    </SelectionAnswer>
                </AnswerSpecification>
            </Question>
    })
    return mturk.createHIT({title: "Vote on Factual Claims",
                            desc: "Decide if a political statement is a factual claim",
                            question: "" + q,
                            reward: checkCost,
                            assignmentDurationInSeconds: 5 * 60, 
                            maxAssignments: 3 })
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
