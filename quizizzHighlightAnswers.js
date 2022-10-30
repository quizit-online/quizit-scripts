async function fetchAnswers(mongoId, roomHash) {
  const {data} = await fetch(
    `https://api.quizit.online/quizizz/answers/hash?roomHash=${roomHash}&mongoId=${mongoId}`
  ).then(res => res.json());

  return data.answers;
}

function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const QUESTION_TYPES = {
  MSQ: "MSQ",
  MCQ: "MCQ",
  BLANK: "BLANK",
  OPEN: "OPEN",
};

function getGameData() {
  const root = document.querySelector("#root");
  if (!root) {
    console.error("Can't find root container");
    return;
  }

  const {
    user: {
      profile: {mongoId},
    },
    game: {
      data,
      questions: {currentId},
    },
  } = root.__vue_app__.config.globalProperties.$store.state;

  return {
    currentId,
    mongoId,
    data,
  };
}

async function bootstrap() {
  await waitForElement(".screen-game");

  console.info("Script initialized");

  const {mongoId, data} = getGameData();

  const answers = await fetchAnswers(mongoId, data.roomHash);

  const interval = setInterval(async () => {
    if (document.querySelector(".screen-summary")) {
      console.info("Quiz has finished and script has been deactivated");
      clearInterval(interval);
      return;
    }
    await waitForElement(".options-container");

    searchAnswer(answers);
  }, 200);
}

function searchAnswer(answers) {
  const {currentId} = getGameData();

  const answer = answers.find(answer => answer._id === currentId);
  if (!answer) {
    console.error("Can't find answer to this question");
    return;
  }

  if (answer.type === QUESTION_TYPES.BLANK) {
    const input = document.querySelector(".typed-option-input");
    if (!input) {
      console.error("Answer input not found");
      return;
    }

    if (answer.answers.length === 0) {
      console.error("No answers found");
      return;
    }
    const [{text}] = answer.answers;

    input.value = text;
    input.dispatchEvent(new Event("input"));
    return;
  }

  if (answer.type === QUESTION_TYPES.OPEN) {
    const input = document.querySelector(".typed-option-input");
    if (!input) {
      console.error("Answer input not found");
      return;
    }

    input.placeholder = "No answer available for this question";
    return;
  }

  if (answer.type === QUESTION_TYPES.MSQ || answer.type === QUESTION_TYPES.MCQ) {
    const options = document.querySelector(".options-grid").children;
    if (!options) {
      console.error("Can't find any options");
      return;
    }
    for (const option of options) {
      let optionContent = option.querySelector(".textContainer > div")?.innerHTML;

      if (!optionContent) {
        const image = option.querySelector(".option-image");
        if (image) {
          let url = getComputedStyle(image).backgroundImage.slice(5, -2);
          url = url.slice(0, url.indexOf("?"));

          if (answer.answers.some(answer => answer.image === url)) {
            highlightAnswer(option);
          }
          continue;
        }

        console.error("Can't find option content");
        continue;
      }

      if (optionContent.includes("katex")) {
        if (
          answer.answers[0].text.slice(17, -20) ===
          /x-tex">(.*)<\/annotation>/i.exec(optionContent)[1]
        ) {
          highlightAnswer(option);
        }
      }

      if (
        answer.answers.some(
          answer =>
            answer.text.replace(/(<([^>]+)>)/gi, "") === optionContent.replace(/(<([^>]+)>)/gi, "")
        )
      ) {
        highlightAnswer(option);
      }
    }
    return;
  }

  console.error("Invalid question type " + answer.type);
}

function highlightAnswer(el) {
  el.querySelector(".bpl-container").style.backgroundColor = "green";
}

bootstrap();
