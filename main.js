let questions = [];
let current = 0;
let score = 0;
let total = 0;
let mode = "free";
let timeLimit = 0;
let timer = null;
let remainingTime = 0;
let questionLimit = 0;

const labels = ["A", "B", "C", "D"];
const searchLink = document.getElementById("searchLink");

fetch("questions.json")
.then(res => res.json())
.then(data => {
    questions = data;
    shuffle(questions);
    current = 0;
    updateScore();
});

function getRandomIndex() {
    return Math.floor(Math.random() * questions.length);
}

function showQuestion() {
    
    const q = questions[current];
    
    document.getElementById("question").textContent =
        "Q. " + q.question;
    
    const codeBlock = document.getElementById("code");
    
    if (q.code) {
        codeBlock.style.display = "block";
        codeBlock.textContent = q.code;
    } else {
        codeBlock.style.display = "none";
    }
    
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    
    q.choices.forEach((choice, index) => {
        
        const btn = document.createElement("button");
        btn.textContent = labels[index] + ". " + choice;
        
        btn.onclick = () => checkAnswer(index);
        
        choicesDiv.appendChild(btn);
    });
    
    document.getElementById("result").textContent = "";
    searchLink.style.display = "none";
    
    // 🔥 フリーモードだけ問題ごとタイマー開始
    if (mode === "free") {
        startQuestionTimer();
    }
}

function checkAnswer(index) {
    
    const q = questions[current];
    const result = document.getElementById("result");
    
    total++;
    
    if (mode === "free") {
        clearInterval(timer);
    }
    
    if (index === q.answer) {
        
        score++;
        
        result.textContent =
            "正解！ (" + labels[index] + ") " + q.explanation;
        
        result.className = "correct";
        
    } else {
        
        result.textContent =
            "不正解。正解は " + labels[q.answer] + " です。 " + q.explanation;
        
        result.className = "wrong";
        
    }
    
    // Google検索リンク作成
const query = encodeURIComponent(
    (q.code ? q.code : q.question) + " VBA 解説"
);

const url = "https://www.google.com/search?q=" + query;

searchLink.style.display = "block";
searchLink.href = url;
searchLink.textContent = "🔍 Googleで解説を見る";
    
    updateScore();
}

function nextQuestion() {
    
    if (timer) clearInterval(timer); // ← これ重要
    
    current++;
    
    if (current >= questionLimit) {
        endExam();
        return;
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

function startExam() {
    mode = "exam";
    questionLimit = 40;
    timeLimit = 50 * 60;
    startGame();
}

function startHalf() {
    mode = "half";
    questionLimit = 20;
    timeLimit = 25 * 60;
    startGame();
}

function startFree() {
    mode = "free";
    questionLimit = questions.length;
    timeLimit = 0;
    startGame();
}

function startFreeNoTimer() {
    mode = "free_notimer";
    questionLimit = questions.length;
    timeLimit = 0;
    startGame();
}

function startGame() {
    
    if (timer) clearInterval(timer); // ★超重要
    
    const modeEl = document.getElementById("modeDisplay");
    const timerEl = document.getElementById("timer");
    
    let modeText = "";
    
    if (mode === "exam") modeText = "本番モード";
    if (mode === "half") modeText = "ハーフモード";
    if (mode === "free") modeText = "フリーモード（タイマー）";
    if (mode === "free_notimer") modeText = "フリーモード（無制限）";
    
    modeEl.textContent = "モード: " + modeText;
    
    // ボタン無効化
    document.querySelectorAll(".modeBtn").forEach(btn => {
        btn.disabled = true;
    });
    
    shuffle(questions);
    current = 0;
    score = 0;
    total = 0;
    
    // ★ここ重要（questionsを壊さない）
    currentQuestions = questions.slice(0, questionLimit);
    
    // タイマー表示制御
    if (mode === "free_notimer") {
        timerEl.style.display = "none";
    } else {
        timerEl.style.display = "block";
    }
    
    // 時間セット
    if (timeLimit > 0) {
        remainingTime = timeLimit;
        startTimer();
    }
    
    // フリーモード補足表示
    if (mode === "free") {
        timerEl.textContent += "（1問 約90秒）";
    }
    
    showQuestion();
    updateScore();
}

function startTimer() {
    const timerEl = document.getElementById("timer");
    
    // 🔥 既存タイマーを止める（これ重要）
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        remainingTime--;
        
        const min = Math.floor(remainingTime / 60);
        const sec = remainingTime % 60;
        
        timerEl.textContent =
            `残り時間: ${min}:${sec.toString().padStart(2, '0')}`;
        
        if (remainingTime <= 0) {
            clearInterval(timer);
            endExam();
        }
    }, 1000);
}

function startQuestionTimer() {
    
    const timerEl = document.getElementById("timer");
    
    if (timer) clearInterval(timer);
    
    let time = 90; // 1問90秒
    
    timer = setInterval(() => {
        
        time--;
        
        const absTime = Math.abs(time);
        const sec = absTime % 60;
        
        let display = `残り: ${time}`;
        
        // 🔥 マイナスで赤＆太字
        if (time < 0) {
            timerEl.innerHTML =
                `<span style="color:red;font-weight:bold;">-${absTime}秒（超過）</span>`;
        } else {
            timerEl.textContent = `残り: ${time}秒`;
        }
        
    }, 1000);
}

function endExam() {
    
    if (timer) clearInterval(timer);
    
    let scorePoint = total > 0 ?
        Math.floor((score / total) * 1000) :
        0;
    
    let resultText = `終了！\nスコア: ${scorePoint}点`;
    
    if (mode === "exam") {
        resultText += scorePoint >= 700 ? "\n合格！" : "\n不合格";
    }
    
    alert(resultText);
    
    document.querySelectorAll(".modeBtn").forEach(btn => {
        btn.disabled = false;
    });
}