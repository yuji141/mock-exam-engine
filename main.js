let questions = [];
let current = 0;
let score = 0;
let total = 0;

fetch("questions.json")
.then(res => res.json())
.then(data => {
    questions = data;
    shuffle(questions);
    current = 0;
    showQuestion();
    updateScore();
});

function getRandomIndex() {
    return Math.floor(Math.random() * questions.length);
}

function showQuestion() {

    const q = questions[current];

    document.getElementById("question").textContent =
        "Q. " + q.question;

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    q.choices.forEach((choice, index) => {

        const btn = document.createElement("button");
        btn.textContent = choice;

        btn.onclick = () => checkAnswer(index);

        choicesDiv.appendChild(btn);
    });

    document.getElementById("result").textContent = "";
}

function checkAnswer(index) {

    const q = questions[current];
    
    total++;

    if(index === q.answer){
        
        score++;

        document.getElementById("result").textContent =
        "正解！ " + q.explanation;

    }else{

        document.getElementById("result").textContent =
        "不正解。 " + q.explanation;

    }
    
    updateScore();

}

function nextQuestion(){

    current++;

    if(current >= questions.length){
        alert("終了！");
        current = 0;
    }

    showQuestion();
}

function updateScore() {
    document.getElementById("score").textContent =
        "スコア: " + score + " / " + total;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}