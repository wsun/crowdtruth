// improve text
var speech = "Well, sure. I'd like to clear up the record and go through it piece by piece. First of all, I don't have a $5 trillion tax cut. I don't have a tax cut of a scale that you're talking about. My view is that we ought to provide tax relief to people in the middle class. But I'm not going to reduce the share of taxes paid by high- income people. High-income people are doing just fine in this economy. They'll do fine whether you're president or I am. The people who are having the hard time right now are middle- income Americans. Under the president's policies, middle-income Americans have been buried. They're — they're just being crushed. Middle-income Americans have seen their income come down by $4,300. This is a — this is a tax in and of itself. I'll call it the economy tax. It's been crushing. The same time, gasoline prices have doubled under the president, electric rates are up, food prices are up, health care costs have gone up by $2,500 a family."
var author = "Mitt Romney"

var hitId0 = createIdentifyHIT(speech, 0.04)
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
var hits = new Array()
foreach(checkedFacts, function(fact) {
    var hitId2 = createSourceHIT(fact, author, 0.25)
    var hit2 = mturk.waitForHIT(hitId2)
    hits.push(hit2)
})

// process sources
var section = process(hits, checkedFacts)

// check sources
var finalHits = new Array()
foreach(section, function(factSources) {
    var hitId3 = createVoteHIT(factSources.fact, author, factSources, 0.05)
    var hit3 = mturk.waitForHIT(hitId3)
    finalHits.push(hit3)
})

// final processing
var complete = aggregate(section, finalHits, hits, 3, 3)

// print results
prettyPrint(complete, speech, author)

function createIdentifyHIT(speechText, identifyCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Overview>
            <FormattedContent><![CDATA[
                <p><strong>Please identify 3-5 potentially incorrect <i>objective</i> claims in the below excerpt. These will be reviewed for their accuracy. 
                Copy-paste these claims into each of the text boxes below.</strong></p>
                <p><strong>Do not identify statements that reflect opinion or subjective ideas. For example:</strong></p>
                <ul>
                    <li>INAPPROPRIATE: I want to hire another hundred thousand new math and science teachers</li>
                    <li>APPROPRIATE: Since January 2012, there are over 450,000 more unemployed people.</li>
                </ul>
                <p><strong>Note that these examples are from an unrelated speaker. Now please perform the task on the below excerpt.</strong></p>
            ]]></FormattedContent>
            <Text>{speechText}</Text>
        </Overview>
        <Question>
            <QuestionIdentifier>identifyFacts1</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent><Text>Claim 1</Text></QuestionContent>
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
    var q = <QuestionForm>
        <Overview>
            <FormattedContent><![CDATA[
                <p><strong>Below are a series of claims made by a political figure. 
                Please decide whether they are complete thoughts and also factual claims that can be verified.</strong></p>
                <p><strong>Statements that reflect opinion or subjective ideas should not be allowed. For example:</strong></p>
                <ul>
                    <li>INAPPROPRIATE: I want to hire another hundred thousand new math and science teachers</li>
                    <li>APPROPRIATE: Since January 2012, there are over 450,000 more unemployed people.</li>
                </ul>
                <p><strong>Note that these examples are from an unrelated speaker. Now please perform the task on the below statements.</strong></p>
            ]]></FormattedContent>
        </Overview>
    </QuestionForm>
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
                                <SelectionIdentifier>Yes</SelectionIdentifier>
                                <Text>Yes</Text>
                            </Selection>
                            <Selection>
                                <SelectionIdentifier>No</SelectionIdentifier>
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
                            maxAssignments: 3 })
}

// helper function to count votes 
function checkFacts(facts, hit) {
    var count = 0
    var sums = new Array()
    var result = new Array()

    for (var i = 0; i < hit.assignments.length; i++) {
        if (i == 0) {
            foreach(hit.assignments[i].answer, function(answer) {
                if (answer == 'Yes') {
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
                if (answer == 'Yes') {
                    sums[count] += 1
                }
                count += 1
            })
        }
        count = 0
    }

    for (var i = 0; i < sums.length; i++) {
        if (sums[i] > 0) {
            result.push(facts[i])
        }
    }

    return result
}

function createSourceHIT(fact, author, sourceCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Overview>
            <FormattedContent><![CDATA[
                <p><strong>Please find a reputable third-party source that proves or disproves this factual claim.</strong></p>
                <p><strong>For example, to evaluate the claim: Wells Fargo began to make loans to subprime borrowers in 1997</strong></p>
                <ul>
                    <li><a href="http://www.economist.com/blogs/schumpeter/2012/10/wells-fargo-and-mortgages">Source</a></li>
                    <li>Relevant passage: According to the complaint, Wells began in 2001 to ramp up its efforts to build a business in loans to borrowers who could not qualify under normal standards and needed the Federal Housing Administration (FHA) to insure their mortgages.</li>
                    <li>Prove or Disprove: Disprove</li>
                </ul>
                <p><strong>Please perform the task on the below statement:</strong></p>
            ]]></FormattedContent>
            <Text>{author}: {fact}</Text>
        </Overview>
        <Question>
            <QuestionIdentifier>sourceLink</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
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
                <Text>Does your evidence prove or disprove the claim?</Text>
            </QuestionContent>
            <AnswerSpecification>
                <SelectionAnswer>
                    <Selections>
                        <Selection>
                            <SelectionIdentifier>Prove</SelectionIdentifier>
                            <Text>Prove</Text>
                        </Selection>
                        <Selection>
                            <SelectionIdentifier>Disprove</SelectionIdentifier>
                            <Text>Disprove</Text>
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
                            maxAssignments: 3})
}

// helper function to extract source info
function process(hits, facts) {
    var excerpt = new Array()
    var count = 0

    foreach(hits, function(hit) {
        var link = new Array()
        var note = new Array()
        var label = new Array()

        foreach(hit.assignments, function(assign){            
            link.push(assign.answer.sourceLink)
            note.push(assign.answer.sourceNote)
            label.push(assign.answer.sourceValidity[0])
        })

        excerpt.push({ fact: facts[count], links: link, notes: note, labels: label })
        count += 1
    })

    return excerpt
}

function createVoteHIT(factText, authorName, factSources, voteCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Overview>
            <FormattedContent><![CDATA[
                <p><strong>Consider the below sources which either prove or disprove this factual claim:</strong></p>
            ]]></FormattedContent>
            <Text>{authorName}: {factText}</Text>
        </Overview>
    </QuestionForm>

    for (var num = 0; num < factSources.links.length; num++) {
        var id = "voteFacts" + num
        var iddup = "voteFactsDup" + num

        var realNum = num + 1
        var label = factSources.labels[num]
        var link = factSources.links[num]
        var note = factSources.notes[num]

        default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";

        // special instructions at the top
        if (num == 0) {
            q.Question += 
                <Question>
                    <QuestionIdentifier>{id}</QuestionIdentifier>
                    <IsRequired>true</IsRequired>
                    <QuestionContent>
                        <Text>Source {realNum}: {label}</Text>
                        <Text>Link: {link}</Text>
                        <Text>Description: {note}</Text>
                        <Text>Please visit the source URL and investigate the validity of the source. 
                        How strong is this piece of evidence, on a scale of 1 to 10 from weak to strong?</Text>
                    </QuestionContent>
                    <AnswerSpecification>
                        <FreeTextAnswer>
                            <Constraints>                            
                                <IsNumeric minValue="1" maxValue="10"/>
                            </Constraints>
                            <NumberOfLinesSuggestion>1</NumberOfLinesSuggestion>
                        </FreeTextAnswer>
                    </AnswerSpecification>
                </Question>
        }
        else {
            q.Question += 
                <Question>
                    <QuestionIdentifier>{id}</QuestionIdentifier>
                    <IsRequired>true</IsRequired>
                    <QuestionContent>
                        <Text>Source {realNum}: {label}</Text>
                        <Text>Link: {link}</Text>
                        <Text>Description: {note}</Text>
                        <Text>Please visit the source URL and investigate the validity of the source. 
                        How strong is this piece of evidence, on a scale of 1 to 10 from weak to strong?</Text>
                    </QuestionContent>
                    <AnswerSpecification>
                        <FreeTextAnswer>
                            <Constraints>                            
                                <IsNumeric minValue="1" maxValue="10"/>
                            </Constraints>
                            <NumberOfLinesSuggestion>1</NumberOfLinesSuggestion>
                        </FreeTextAnswer>
                    </AnswerSpecification>
                </Question>
            q.Question +=
                <Question>
                    <QuestionIdentifier>{iddup}</QuestionIdentifier>
                    <IsRequired>true</IsRequired>
                    <QuestionContent>
                        <Text>Is this source a duplicate of a previous source?</Text>
                    </QuestionContent>
                    <AnswerSpecification>
                        <SelectionAnswer>
                            <Selections>
                                <Selection>
                                    <SelectionIdentifier>Yes</SelectionIdentifier>
                                    <Text>Yes</Text>
                                </Selection>
                                <Selection>
                                    <SelectionIdentifier>No</SelectionIdentifier>
                                    <Text>No</Text>
                                </Selection>
                            </Selections>
                        </SelectionAnswer>
                    </AnswerSpecification>
                </Question>
        }
    }

    // final evaluation
    q.Question += 
        <Question>
            <QuestionIdentifier>voteFactsFinal</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <Text>After considering each of the above sources, how true is this factual claim, 
                on a scale of 1 to 10 from false to true?</Text>
            </QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>                            
                        <IsNumeric minValue="1" maxValue="10"/>
                    </Constraints>
                    <NumberOfLinesSuggestion>1</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>

    return mturk.createHIT({title: "Vote on whether a political claim is truthful",
                            desc: "Determine the validity of political sources and fact-check a political claim",
                            question: "" + q,
                            reward: voteCost,
                            assignmentDurationInSeconds: 10 * 60, 
                            maxAssignments: 3 })
}

// helper function to aggregate ratings
function aggregate(excerptSection, sourceVoteHits, sourceWorkHits, totalSources, totalAssignments) {
    var factCount = 0
    var finalResults = new Array()

    foreach(sourceVoteHits, function(sourceVoteHit) {

        var cumRating = 0
        var factText = excerptSection[factCount].fact

        var sourceRatings = new Array()
        var sourceDup = new Array()
        var sourceInfo = new Array()

        var assignCount = 0

        sourceDup.push(0) // first source is never a dup

        foreach(sourceVoteHit.assignments, function(assign) {
            
            var sourceCount = 0

            foreach(assign.answer, function(answer) {
                if (answer instanceof Array) {
                    if (answer[0] == 'Yes') {
                        if (assignCount == 0) {
                            sourceDup.push(1)
                        }
                        else {
                            sourceDup[sourceCount] += 1
                        }
                        sourceCount += 1
                    }
                    else if (answer[0] == 'No') {
                        if (assignCount == 0) {
                            sourceDup.push(0)
                        }
                        sourceCount += 1
                    }
                }
                else if (sourceCount == totalSources) {
                    cumRating += parseInt(answer, 10)
                }
                else {
                    if (assignCount == 0) {
                        sourceRatings.push(parseInt(answer, 10))
                    }
                    else {
                        sourceRatings[sourceCount] += parseInt(answer, 10)
                    }
                }

                if (sourceCount == 0) {
                    sourceCount += 1    
                }
            })
            assignCount += 1
        })

        // kill dups and approve assignments
        for (var i = 0; i < sourceDup.length; i++) {
            if (sourceDup[i] == totalAssignments) {
                mturk.rejectAssignment(sourceWorkHits[factCount].assignments[i])
            }
            else {
                mturk.approveAssignment(sourceWorkHits[factCount].assignments[i])
                sourceInfo.push([excerptSection[factCount].links[i], excerptSection[factCount].labels[i], excerptSection[factCount].notes[i],
                                 sourceRatings[i] / totalAssignments])
            }
        }

        // average cumulative rating of fact
        cumRating = cumRating / totalSources

        finalResults.push({ fact: factText, sources: sourceInfo, rating: cumRating })
        factCount += 1
        mturk.approveAssignments(sourceVoteHit.assignments)
    })

    return finalResults
}

// helper function to output results to console
function prettyPrint(completeResults, fullText, author) {
    print("----------")
    print(author) // author
    print(fullText) // excerpt text
    print(completeResults.length) // number of facts

    // for each fact
    foreach(completeResults, function(identifiedFact) {
        print(identifiedFact.fact) // fact
        print(identifiedFact.rating) // 1-10 rating of lie-truth of fact
        print(identifiedFact.sources.length) // number sources corresponding to fact

        // for each source
        foreach(identifiedFact.sources, function(source) {
            print(source[0]) // link
            print(source[1]) // notes
            print(source[2]) // prove or disprove string: Prove, Disprove
            print(source[3]) // 1-10 rating

        })
    })
    print("----------")
}