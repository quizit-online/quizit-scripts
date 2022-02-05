setInterval(async function(){await new Promise((resolve)=>setInterval(function(){if(document.querySelector(".screen-game")!==null&&document.querySelector(".options-container")!==null){resolve()}},1000))
const currentQuestionId=document.querySelector(".screen-game").__vue__.$store.state.game.questions.currentId
const answer=answers.find((question)=>{if(question._id===currentQuestionId){return question}})
let options=answer.type==="BLANK"||answer.type==="OPEN"?document.querySelector(".typed-option-input"):document.querySelector(".options-grid").children
if(answer.type==="BLANK"){if(!options.value){options.value=answer.answers[0].text
options.dispatchEvent(new Event("input"))}}else if(answer.type==="OPEN"){options.dispatchEvent(new Event("input"))}
const optionsIndexes=document.querySelector(".options-container").__vue__?.$props.options
optionsIndexes.forEach((option,index)=>{if(answer.type==="MSQ"){answer.answers.forEach((i)=>{if(option.actualIndex===i.index){options[index].firstChild.firstChild.style.background="green"
options[index].firstChild.style.background="green"}})}else if(answer.type==="MCQ"){if(option.actualIndex===answer.answers[0].index){options[index].firstChild.firstChild.style.background="green"
options[index].firstChild.style.background="green"}}})},1000)
